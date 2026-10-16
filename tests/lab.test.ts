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

test("每個機制的每個情境只有最後一步有 caption，且不為空", () => {
  for (const mechanism of ["publish-gate", "playback-auth"]) {
    for (const { id } of scenarios(mechanism)) {
      const steps = play(mechanism, id);
      const name = `${mechanism}/${id}`;
      assert.ok(steps.length > 1, `${name} 應有多步`);
      const final = last(steps);
      assert.ok(
        final.caption && final.caption.length > 0,
        `${name} 最後一步缺 caption`,
      );
      for (const step of steps.slice(0, -1)) {
        assert.equal(
          step.caption,
          undefined,
          `${name} 非最後一步不應有 caption`,
        );
      }
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

test("playback-auth 依顯示順序列出四個情境", () => {
  assert.deepEqual(scenarios("playback-auth"), [
    { id: "normal", label: "正常播放" },
    { id: "refresh", label: "到期前更新" },
    { id: "direct-url", label: "直接抓 segment URL" },
    { id: "auth-down", label: "授權服務暫時不可用" },
  ]);
});

test("playback-auth 初始狀態：沒有資格、沒有請求、沒有 caption", () => {
  const step = initialStep("playback-auth");
  assert.equal(step.caption, undefined);
  assert.equal(step.state.kiosk, "idle");
  assert.equal(step.state.viewers.viewer.pass.held, false);
  assert.equal(step.state.viewers.newcomer.pass.held, false);
  assert.equal(step.state.viewers.viewer.player, "idle");
  assert.equal(step.state.edge.requester, null);
  assert.equal(step.state.originTouched, false);
  assert.deepEqual(step.state.counters, { appRequests: 0, cdnRequests: 0 });
});

test("直接抓 segment URL：快取命中仍在 edge 被拒絕，origin 全程未被碰觸，沒有任何內容播放", () => {
  const steps = play("playback-auth", "direct-url");
  const final = last(steps);
  assert.equal(final.state.edge.decision, "denied");
  assert.equal(final.state.edge.cacheHit, true);
  assert.equal(final.state.edge.requester, "newcomer");
  assert.equal(final.state.viewers.newcomer.pass.held, false);
  assert.equal(final.state.viewers.newcomer.player, "blocked");
  assert.equal(final.state.counters.appRequests, 0);
  assert.ok(steps.every((s) => !s.state.originTouched));
  assert.ok(steps.every((s) => s.state.viewers.newcomer.player !== "playing"));
});

test("正常播放：只向應用授權一次，CDN 請求數遠多於應用請求數，播放中", () => {
  const final = last(play("playback-auth", "normal"));
  assert.equal(final.state.counters.appRequests, 1);
  assert.ok(final.state.counters.cdnRequests >= 6);
  assert.equal(final.state.viewers.viewer.player, "playing");
  assert.equal(final.state.edge.decision, "allowed");
  assert.equal(final.state.edge.cacheHit, true);
});

test("到期前更新：播放不中斷，換成新的滿效期資格，應用請求數變 2", () => {
  const steps = play("playback-auth", "refresh");
  const final = last(steps);
  assert.equal(final.state.counters.appRequests, 2);
  assert.equal(final.state.viewers.viewer.pass.share, 1);
  assert.equal(final.state.viewers.viewer.player, "playing");
  assert.ok(
    steps.every(
      (s) =>
        s.state.viewers.viewer.pass.share > 0 &&
        s.state.viewers.viewer.player !== "stalled",
    ),
    "更新前資格從未到期，播放從未中斷",
  );
});

test("授權服務不可用：持有效資格者在期限內續播，資格到期後才停", () => {
  const steps = play("playback-auth", "auth-down");
  const unavailable = steps.filter((s) => s.state.kiosk === "unavailable");
  assert.ok(unavailable.length > 0);

  const servedWhileDown = unavailable.filter(
    (s) =>
      s.state.viewers.viewer.pass.share > 0 &&
      s.state.viewers.viewer.player === "playing" &&
      s.state.edge.decision === "allowed",
  );
  assert.ok(servedWhileDown.length > 0, "授權掛掉時 CDN 仍服務有效資格");

  const final = last(steps);
  assert.equal(final.state.kiosk, "unavailable");
  assert.deepEqual(final.state.viewers.viewer.pass, { held: true, share: 0 });
  assert.equal(final.state.viewers.viewer.player, "stalled");
  assert.equal(final.state.edge.decision, "denied");
});

test("授權服務不可用：新觀眾拿不到資格、無法開始播放，且從未被放行", () => {
  const steps = play("playback-auth", "auth-down");
  const final = last(steps);
  assert.equal(final.state.viewers.newcomer.pass.held, false);
  assert.equal(final.state.viewers.newcomer.player, "blocked");
  assert.ok(steps.every((s) => s.state.viewers.newcomer.player !== "playing"));
  assert.ok(
    steps.every(
      (s) =>
        s.state.edge.requester !== "newcomer" ||
        s.state.edge.decision !== "allowed",
    ),
  );
});

test("playback-auth 每一步的讀數都由 state 推導，兩者不會矛盾", () => {
  for (const { id } of scenarios("playback-auth")) {
    for (const { state, readout } of play("playback-auth", id)) {
      const { pass } = state.viewers.viewer;
      assert.equal(readout.appRequests, String(state.counters.appRequests));
      assert.equal(readout.cdnRequests, String(state.counters.cdnRequests));
      assert.equal(readout.passRemaining === "—", !pass.held);
      assert.equal(
        readout.passRemaining === "已到期",
        pass.held && pass.share === 0,
      );
    }
  }
});
