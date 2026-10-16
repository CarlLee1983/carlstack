// 「驗印閘門」：長文 §6 的發布閘門機制。
// 概念對應：兩條輸送臂 = worker A／B；帶 generation 與 attempt token 印記的匣 = 候選產物；
// 閘門刻度盤 = 目前有效的 attempt token 與租約倒數；撥桿 = active playback asset 指標；
// 死信托盤 = 有負責人的待處理清單。

import type { LabStep, MechanismModule, ScenarioDef } from "./types.ts";

export type WorkerStatus =
  | "idle"
  | "working"
  | "offline"
  | "submitting"
  | "rejected"
  | "accepted"
  | "failed";

export type GateStatus =
  | "idle"
  | "verifying"
  | "accepted"
  | "rejected"
  | "receipt-returned"
  | "stopped";

export type Lane = "a" | "b";
export type Attempt = "a" | "b" | "c";

export interface PublishGateState {
  /** 目前有效的 attempt token，以及持有它的輸送臂；尚未發出時為 null。 */
  token: { attempt: Attempt; lane: Lane } | null;
  /** 目前租約剩餘占完整租約的比例（0～1）；已到期或不適用時為 0。 */
  leaseShare: number;
  workers: { a: { status: WorkerStatus }; b: { status: WorkerStatus } };
  gate: GateStatus;
  /** 播放資產指標；assetId 與 lane 為 null 表示尚未有任何資產啟用。 */
  pointer: { assetId: string | null; lane: Lane | null; switchCount: number };
  /** 這份工作已嘗試的次數（1 起算）；圖上的三顆計數燈對應此值。 */
  attempts: number;
  deadLetter: { hasJob: boolean; owner: string | null };
}

export interface PublishGateReadout {
  activeToken: string;
  leaseRemaining: string;
  activeAssetId: string;
  receipt: string;
}

type Step = LabStep<PublishGateState, PublishGateReadout>;

/** 完整租約秒數；圖只需要 leaseShare（0～1）。 */
export const LEASE_SECONDS = 120;
const GENERATION = 7;
const DEAD_LETTER_OWNER = "轉碼平台值班";

const NO_VALUE = "—";
const NO_ASSET = "無";
const RECEIPT_NONE = "未接受";
const RECEIPT_SAVED = "已保存";
const RECEIPT_RETURNED = "回傳原收據";

const assetIdOf = (lane: Lane) => `v42-g${GENERATION}-${lane}`;

const formatLease = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// 讀數全部由 state 推導，state 與讀數不會互相矛盾。
// 租約為 0 時：閘門已終結（接受、回傳收據、停止）顯示「—」，否則有 token 即代表租約已到期。
const readoutOf = (state: PublishGateState): PublishGateReadout => {
  const settled = ["accepted", "receipt-returned", "stopped"].includes(
    state.gate,
  );
  let leaseRemaining = NO_VALUE;
  if (state.leaseShare > 0) {
    leaseRemaining = formatLease(Math.round(state.leaseShare * LEASE_SECONDS));
  } else if (state.token && !settled) {
    leaseRemaining = "已到期";
  }

  let receipt = RECEIPT_NONE;
  if (state.gate === "receipt-returned") receipt = RECEIPT_RETURNED;
  else if (state.pointer.switchCount > 0) receipt = RECEIPT_SAVED;

  return {
    activeToken: state.token
      ? `gen ${GENERATION} · attempt ${state.token.attempt}`
      : NO_VALUE,
    leaseRemaining,
    activeAssetId: state.pointer.assetId ?? NO_ASSET,
    receipt,
  };
};

interface StepInput {
  a?: WorkerStatus;
  b?: WorkerStatus;
  gate?: GateStatus;
  /** 指標指向哪條輸送臂的資產；省略表示尚未啟用。 */
  pointerLane?: Lane;
  switchCount?: number;
  attempts?: number;
  deadLetter?: boolean;
  token?: PublishGateState["token"];
  /** 剩餘租約秒數；省略表示 0（已到期或不適用）。 */
  lease?: number;
  caption?: string;
}

// 每一步都從頭組出新物件，呼叫端改動結果不會污染下一次播放。
const step = (input: StepInput = {}): Step => {
  const lane = input.pointerLane ?? null;
  const state: PublishGateState = {
    token: input.token ? { ...input.token } : null,
    leaseShare: (input.lease ?? 0) / LEASE_SECONDS,
    workers: {
      a: { status: input.a ?? "idle" },
      b: { status: input.b ?? "idle" },
    },
    gate: input.gate ?? "idle",
    pointer: {
      assetId: lane && assetIdOf(lane),
      lane,
      switchCount: input.switchCount ?? 0,
    },
    attempts: input.attempts ?? 0,
    deadLetter: {
      hasJob: input.deadLetter ?? false,
      owner: input.deadLetter ? DEAD_LETTER_OWNER : null,
    },
  };
  const result: Step = { state, readout: readoutOf(state) };
  if (input.caption !== undefined) result.caption = input.caption;
  return result;
};

const TOKEN_A = { attempt: "a", lane: "a" } as const;
const TOKEN_B = { attempt: "b", lane: "b" } as const;
// 重試都在 A 的輸送臂上重跑，但每次領新的 attempt token。
const TOKEN_A_RETRY_B = { attempt: "b", lane: "a" } as const;
const TOKEN_A_RETRY_C = { attempt: "c", lane: "a" } as const;

// A 的正常完成終點，供 normal 與 duplicate 共用。
const acceptedByA = (extra: StepInput = {}): Step =>
  step({
    a: "accepted",
    gate: "accepted",
    pointerLane: "a",
    switchCount: 1,
    attempts: 1,
    token: TOKEN_A,
    ...extra,
  });

const normal = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: 120 }),
  step({
    a: "submitting",
    gate: "verifying",
    attempts: 1,
    token: TOKEN_A,
    lease: 80,
  }),
  acceptedByA({
    caption:
      "A 提交的候選產物帶著仍有效的 token，通過驗證後，閘門保存收據並把播放指標切到它。整段只發生一次切換。",
  }),
];

const leaseReassign = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: 120 }),
  step({ a: "offline", attempts: 1, token: TOKEN_A }),
  step({ a: "offline", b: "working", attempts: 2, token: TOKEN_B, lease: 120 }),
  step({
    a: "rejected",
    b: "working",
    gate: "rejected",
    attempts: 2,
    token: TOKEN_B,
    lease: 70,
  }),
  step({
    a: "rejected",
    b: "submitting",
    gate: "verifying",
    attempts: 2,
    token: TOKEN_B,
    lease: 40,
  }),
  step({
    a: "rejected",
    b: "accepted",
    gate: "accepted",
    pointerLane: "b",
    switchCount: 1,
    attempts: 2,
    token: TOKEN_B,
    caption:
      "A 回來時手上的 token 已經不是有效的那一個，所以被拒絕；它的產物從未被啟用。只有持有目前 token 的 B 能讓指標切換。",
  }),
];

const duplicate = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: 120 }),
  step({
    a: "submitting",
    gate: "verifying",
    attempts: 1,
    token: TOKEN_A,
    lease: 80,
  }),
  acceptedByA(),
  acceptedByA({ a: "submitting", gate: "verifying" }),
  acceptedByA({
    gate: "receipt-returned",
    caption:
      "同一份完成通知再次抵達時，閘門直接回傳當初保存的收據，不會再產生一次啟用。收據只證明當時接受過，影片現在能不能播要另外查。",
  }),
];

// 前兩次是原檔暫時無法讀取（可重試），每次重試都在 A 的輸送臂上領新的 attempt token
// 與全新租約；第三次被判定為來源損壞，立刻停止，不再重試。
const corruptSource = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: 120 }),
  step({ a: "failed", attempts: 1, token: TOKEN_A, lease: 70 }),
  step({ a: "working", attempts: 2, token: TOKEN_A_RETRY_B, lease: 120 }),
  step({ a: "failed", attempts: 2, token: TOKEN_A_RETRY_B, lease: 60 }),
  step({ a: "working", attempts: 3, token: TOKEN_A_RETRY_C, lease: 120 }),
  step({
    a: "failed",
    gate: "stopped",
    attempts: 3,
    deadLetter: true,
    token: TOKEN_A_RETRY_C,
    caption:
      "原檔暫時讀不到，可以用退避重試，每次重試都領新的 token 與租約。一旦判定來源本身損壞，就立刻停止並交給死信清單的負責人，不讓重跑占滿佇列。",
  }),
];

// 情境的 id、標籤與步驟只在這裡定義一次，清單與播放都由它推導。
const scenarioTable: readonly ScenarioDef<
  PublishGateState,
  PublishGateReadout
>[] = [
  { id: "normal", label: "正常完成", build: normal },
  { id: "lease-reassign", label: "心跳中斷改派", build: leaseReassign },
  { id: "duplicate", label: "重複完成通知", build: duplicate },
  { id: "corrupt-source", label: "來源損壞", build: corruptSource },
];

export const publishGate: MechanismModule<
  PublishGateState,
  PublishGateReadout
> = {
  scenarios: scenarioTable,
  initialStep: () => step(),
};
