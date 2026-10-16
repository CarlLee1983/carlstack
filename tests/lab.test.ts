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
  assert.equal(final.state.pointer.assetId, "v42-g7-b");
  assert.equal(final.state.pointer.switchCount, 1);
  assert.equal(final.readout.activeToken, "gen 7 · attempt b");
  assert.equal(final.readout.activeAssetId, "v42-g7-b");
  assert.equal(final.readout.receipt, "已保存");

  const everActive = play("publish-gate", "lease-reassign").map(
    (step) => step.state.pointer.assetId,
  );
  assert.ok(!everActive.includes("v42-g7-a"));
});

test("重複完成通知：回傳原收據，指標只切換一次", () => {
  const final = last(play("publish-gate", "duplicate"));
  assert.equal(final.state.gate, "receipt-returned");
  assert.equal(final.readout.receipt, "回傳原收據");
  assert.equal(final.state.pointer.assetId, "v42-g7-a");
  assert.equal(final.state.pointer.switchCount, 1);
  assert.equal(final.readout.activeAssetId, "v42-g7-a");
});

test("來源損壞：重試到上限後停止，進入有負責人的死信，指標不變", () => {
  const final = last(play("publish-gate", "corrupt-source"));
  const initial = initialStep("publish-gate");
  assert.equal(final.state.attempts, 3);
  assert.equal(final.state.gate, "stopped");
  assert.equal(final.state.deadLetter.hasJob, true);
  assert.ok(final.state.deadLetter.owner);
  assert.equal(final.state.pointer.assetId, null);
  assert.equal(final.state.pointer.switchCount, 0);
  assert.equal(final.readout.activeAssetId, initial.readout.activeAssetId);
  assert.equal(final.readout.receipt, "未接受");
});

test("正常完成：A 被接受，指標切換到 A 的資產一次", () => {
  const final = last(play("publish-gate", "normal"));
  assert.equal(final.state.workers.a.status, "accepted");
  assert.equal(final.state.gate, "accepted");
  assert.equal(final.state.pointer.assetId, "v42-g7-a");
  assert.equal(final.state.pointer.switchCount, 1);
  assert.equal(final.readout.activeAssetId, "v42-g7-a");
  assert.equal(final.readout.receipt, "已保存");
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
  assert.equal(step.readout.receipt, "未接受");
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
