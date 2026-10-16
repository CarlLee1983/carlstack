import assert from "node:assert/strict";
import test from "node:test";
import { initialStep, play, scenarios } from "../src/utils/lab/index.ts";

const last = <T>(steps: T[]): T => {
  const step = steps.at(-1);
  assert.ok(step, "情境至少要有一步");
  return step;
};

test("未知的 mechanism 會丟出錯誤並指名該值", () => {
  assert.throws(() => play("no-such-mechanism", "normal"), /no-such-mechanism/);
  assert.throws(() => scenarios("no-such-mechanism"), /no-such-mechanism/);
  assert.throws(() => initialStep("no-such-mechanism"), /no-such-mechanism/);
});

test("未知的 scenarioId 會丟出錯誤並指名該值", () => {
  assert.throws(
    () => play("publish-gate", "no-such-scenario"),
    /no-such-scenario/,
  );
});

test("publish-gate 依顯示順序列出四個情境", () => {
  assert.deepEqual(scenarios("publish-gate"), [
    { id: "normal", label: "正常完成" },
    { id: "lease-reassign", label: "心跳中斷改派" },
    { id: "duplicate", label: "重複完成通知" },
    { id: "corrupt-source", label: "來源損壞" },
  ]);
});

test("心跳中斷改派：A 被拒絕、B 被接受、指標指向 B 且 A 的資產從未啟用", () => {
  const final = last(play("publish-gate", "lease-reassign"));
  assert.equal(final.state.workers.a.status, "rejected");
  assert.equal(final.state.workers.b.status, "accepted");
  assert.equal(final.state.gate, "accepted");
  assert.equal(final.state.pointer.lane, "b");
  assert.equal(final.state.pointer.switchCount, 1);
  assert.deepEqual(final.state.token, { attempt: "b", lane: "b" });
  assert.equal(final.readout.activeAssetId, "v42-g7-b");

  const everActive = play("publish-gate", "lease-reassign").map(
    (step) => step.state.pointer.lane,
  );
  assert.ok(!everActive.includes("a"));
});

test("重複完成通知：回傳原收據，指標只切換一次", () => {
  const final = last(play("publish-gate", "duplicate"));
  assert.equal(final.state.gate, "receipt-returned");
  assert.equal(final.readout.receipt, "回傳原收據");
  assert.equal(final.state.pointer.lane, "a");
  assert.equal(final.state.pointer.switchCount, 1);
});

test("來源損壞：重試到上限後停止，進入有負責人的死信，指標不變", () => {
  const final = last(play("publish-gate", "corrupt-source"));
  const initial = initialStep("publish-gate");
  assert.equal(final.state.gate, "stopped");
  assert.equal(final.state.deadLetter.hasJob, true);
  assert.ok(final.state.deadLetter.owner);
  assert.deepEqual(final.state.pointer, initial.state.pointer);
  assert.equal(final.state.pointer.switchCount, 0);
});

test("正常完成：A 被接受，指標切換到 A 的資產一次", () => {
  const final = last(play("publish-gate", "normal"));
  assert.equal(final.state.workers.a.status, "accepted");
  assert.equal(final.state.gate, "accepted");
  assert.equal(final.state.pointer.lane, "a");
  assert.equal(final.state.pointer.switchCount, 1);
});

test("每個情境只有最後一步有 caption，且不為空", () => {
  for (const { id } of scenarios("publish-gate")) {
    const steps = play("publish-gate", id);
    assert.ok(steps.length > 1, `${id} 應有多步`);
    const final = last(steps);
    assert.ok(
      final.caption && final.caption.length > 0,
      `${id} 最後一步缺 caption`,
    );
    for (const step of steps.slice(0, -1)) {
      assert.equal(step.caption, undefined, `${id} 非最後一步不應有 caption`);
    }
  }
});

test("初始狀態：沒有任何東西被啟用、沒有 caption", () => {
  const step = initialStep("publish-gate");
  assert.equal(step.caption, undefined);
  assert.equal(step.state.gate, "idle");
  assert.equal(step.state.pointer.assetId, null);
  assert.equal(step.state.pointer.switchCount, 0);
  assert.equal(step.state.deadLetter.hasJob, false);
  assert.equal(step.state.token, null);
  assert.equal(step.state.leaseShare, 0);
  assert.equal(step.state.pointer.lane, null);
});

test("每次呼叫回傳新物件，修改結果不影響下次呼叫", () => {
  const first = initialStep("publish-gate");
  first.state.pointer.switchCount = 99;
  assert.equal(initialStep("publish-gate").state.pointer.switchCount, 0);

  const steps = play("publish-gate", "normal");
  last(steps).state.workers.a.status = "idle";
  assert.equal(
    last(play("publish-gate", "normal")).state.workers.a.status,
    "accepted",
  );
});

test("來源損壞：每次重試領新的 attempt token，第三次被判定來源損壞後立刻停止", () => {
  const steps = play("publish-gate", "corrupt-source");
  const attempts = steps
    .map((s) => s.state.token?.attempt)
    .filter(
      (attempt, i, all) => attempt !== undefined && attempt !== all[i - 1],
    );
  assert.deepEqual(attempts, ["a", "b", "c"]);

  const stoppedAt = steps.findIndex((s) => s.state.gate === "stopped");
  assert.equal(stoppedAt, steps.length - 1, "停止後不應再有步驟");
  assert.equal(last(steps).state.token?.attempt, "c");
  assert.equal(last(steps).state.deadLetter.hasJob, true);
});

test("心跳中斷改派：租約到期時 leaseShare 為 0，B 領新 token 後恢復為滿租約", () => {
  const steps = play("publish-gate", "lease-reassign");
  const expiredAt = steps.findIndex(
    (s) => s.state.workers.a.status === "offline" && s.state.leaseShare === 0,
  );
  assert.ok(expiredAt >= 0, "應有 A 離線且租約已到期的步驟");
  assert.equal(steps[expiredAt]?.state.token?.attempt, "a");

  const claimed = steps[expiredAt + 1];
  assert.deepEqual(claimed?.state.token, { attempt: "b", lane: "b" });
  assert.equal(claimed?.state.leaseShare, 1);
});

test("心跳中斷改派：指標終點的 lane 是 b；正常完成與重複通知則是 a", () => {
  assert.equal(
    last(play("publish-gate", "lease-reassign")).state.pointer.lane,
    "b",
  );
  assert.equal(last(play("publish-gate", "normal")).state.pointer.lane, "a");
  assert.equal(last(play("publish-gate", "duplicate")).state.pointer.lane, "a");
  assert.equal(
    last(play("publish-gate", "corrupt-source")).state.pointer.lane,
    null,
  );
  assert.equal(initialStep("publish-gate").state.pointer.lane, null);
});

test("每一步的讀數都由 state 推導，兩者不會矛盾", () => {
  for (const { id } of scenarios("publish-gate")) {
    for (const { state, readout } of play("publish-gate", id)) {
      assert.equal(
        readout.activeToken.endsWith(
          state.token ? ` ${state.token.attempt}` : "—",
        ),
        true,
      );
      assert.equal(
        readout.activeAssetId === "無",
        state.pointer.assetId === null,
      );
      assert.equal(
        readout.receipt === "未接受",
        state.pointer.switchCount === 0,
      );
    }
  }
});
