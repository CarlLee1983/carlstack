"""Run an isolated SQLite backup, restore, and service recovery drill.

Usage: python3 scripts/recovery-drill.py
All databases live under a temporary directory and are deleted on exit.
"""

from __future__ import annotations

import json
import multiprocessing
import sqlite3
import tempfile
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


RTO_TARGET_SECONDS = 10.0
RPO_TARGET_SECONDS = 2.0


def serve(database: str, ready: multiprocessing.Queue) -> None:
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args: object) -> None:
            pass

        def do_GET(self) -> None:
            if self.path != "/orders":
                self.send_error(404)
                return
            with sqlite3.connect(database) as connection:
                rows = connection.execute("SELECT id, cents FROM orders ORDER BY id").fetchall()
            self.respond({"orders": [{"id": row[0], "cents": row[1]} for row in rows]})

        def do_POST(self) -> None:
            if self.path != "/orders":
                self.send_error(404)
                return
            try:
                body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                order_id, cents = body["id"], body["cents"]
                if not isinstance(order_id, str) or not isinstance(cents, int) or cents <= 0:
                    raise ValueError("invalid order")
                with sqlite3.connect(database) as connection:
                    connection.execute("INSERT INTO orders(id, cents) VALUES (?, ?)", (order_id, cents))
            except (KeyError, ValueError, sqlite3.Error) as error:
                self.respond({"error": str(error)}, 400)
                return
            self.respond({"acknowledged": order_id}, 201)

        def respond(self, payload: dict, status: int = 200) -> None:
            data = json.dumps(payload).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    ready.put(server.server_address[1])
    server.serve_forever()


def start_service(database: Path) -> tuple[multiprocessing.Process, str]:
    ready: multiprocessing.Queue = multiprocessing.Queue()
    process = multiprocessing.Process(target=serve, args=(str(database), ready))
    process.start()
    port = ready.get(timeout=5)
    return process, f"http://127.0.0.1:{port}/orders"


def request(url: str, order_id: str | None = None, cents: int = 100) -> dict:
    body = None if order_id is None else json.dumps({"id": order_id, "cents": cents}).encode()
    with urlopen(Request(url, data=body, headers={"Content-Type": "application/json"}), timeout=2) as response:
        return json.load(response)


def backup(source: Path, target: Path) -> None:
    with sqlite3.connect(source) as source_db, sqlite3.connect(target) as target_db:
        source_db.backup(target_db)


def check_database(database: Path, expected: list[str]) -> dict:
    with sqlite3.connect(database) as connection:
        integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
        foreign_keys = connection.execute("PRAGMA foreign_key_check").fetchall()
        orders = connection.execute("SELECT id, cents FROM orders ORDER BY id").fetchall()
    if integrity != "ok" or foreign_keys or orders != [(order_id, 100) for order_id in sorted(expected)]:
        raise AssertionError("restored database failed integrity or business checks")
    return {"integrity_check": integrity, "foreign_key_violations": len(foreign_keys),
            "order_ids": [row[0] for row in orders], "total_cents": sum(row[1] for row in orders)}


def stop(process: multiprocessing.Process) -> None:
    process.terminate()
    process.join(timeout=5)
    if process.is_alive():
        process.kill()
        process.join()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="carlstack-recovery-") as directory:
        root = Path(directory)
        primary, snapshot, restored, new_primary = (
            root / name for name in ("primary.db", "snapshot.db", "restored.db", "new-primary.db")
        )
        with sqlite3.connect(primary) as connection:
            connection.execute("CREATE TABLE orders(id TEXT PRIMARY KEY, cents INTEGER NOT NULL CHECK(cents > 0))")

        processes: list[multiprocessing.Process] = []
        try:
            live, live_url = start_service(primary)
            processes.append(live)
            acknowledged: dict[str, float] = {}
            for order_id in ("A1", "A2", "A3"):
                assert request(live_url, order_id)["acknowledged"] == order_id
                acknowledged[order_id] = time.monotonic()

            backup(primary, snapshot)
            snapshot_check = check_database(snapshot, ["A1", "A2", "A3"])
            for order_id in ("A4", "A5"):
                assert request(live_url, order_id)["acknowledged"] == order_id
                acknowledged[order_id] = time.monotonic()
                time.sleep(0.25)

            fault_at = time.monotonic()
            stop(live)
            primary.rename(root / "quarantined-primary.db")
            try:
                request(live_url)
                raise AssertionError("failed primary still answered")
            except URLError:
                pass

            backup(snapshot, restored)
            restored_check = check_database(restored, ["A1", "A2", "A3"])
            recovery, recovery_url = start_service(restored)
            processes.append(recovery)
            if [row["id"] for row in request(recovery_url)["orders"]] != ["A1", "A2", "A3"]:
                raise AssertionError("recovered service returned wrong data")
            assert request(recovery_url, "R1")["acknowledged"] == "R1"
            service_restored_at = time.monotonic()
            recovered_check = check_database(restored, ["A1", "A2", "A3", "R1"])

            failback_start_at = time.monotonic()
            stop(recovery)
            try:
                request(recovery_url)
                raise AssertionError("old recovery service still answered during failback")
            except URLError:
                pass
            backup(restored, new_primary)
            failback_check = check_database(new_primary, ["A1", "A2", "A3", "R1"])
            replacement, replacement_url = start_service(new_primary)
            processes.append(replacement)
            if [row["id"] for row in request(replacement_url)["orders"]] != ["A1", "A2", "A3", "R1"]:
                raise AssertionError("new primary returned wrong data")
            assert request(replacement_url, "F1")["acknowledged"] == "F1"
            failback_at = time.monotonic()
            failback_check = check_database(new_primary, ["A1", "A2", "A3", "F1", "R1"])

            rto = service_restored_at - fault_at
            recovery_point_age = fault_at - acknowledged["A3"]
            result = {
                "environment": {"sqlite": sqlite3.sqlite_version, "workload": "local HTTP order writes; temporary SQLite files"},
                "targets_seconds": {"rto": RTO_TARGET_SECONDS, "rpo": RPO_TARGET_SECONDS},
                "backup": snapshot_check,
                "fault": {"acknowledged_before_fault": list(acknowledged), "quarantined_primary": True},
                "restore": restored_check,
                "service_recovery": recovered_check,
                "observed": {"rto_seconds": round(rto, 3), "recovery_point_age_seconds": round(recovery_point_age, 3),
                             "lost_acknowledged_order_ids": ["A4", "A5"],
                             "rto_target_met": rto <= RTO_TARGET_SECONDS,
                             "rpo_target_met": recovery_point_age <= RPO_TARGET_SECONDS},
                "failback": {"service_interruption_seconds": round(failback_at - failback_start_at, 3),
                             "elapsed_since_fault_seconds": round(failback_at - fault_at, 3), **failback_check},
            }
            print(json.dumps(result, ensure_ascii=False, indent=2))
        finally:
            for process in processes:
                if process.is_alive():
                    stop(process)


if __name__ == "__main__":
    main()
