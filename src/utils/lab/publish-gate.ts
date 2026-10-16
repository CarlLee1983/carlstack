// 「驗印閘門」：長文 §6 的發布閘門機制。
// 概念對應：兩條輸送臂 = worker A／B；帶 generation 與 attempt token 印記的匣 = 候選產物；
// 閘門刻度盤 = 目前有效的 attempt token 與租約倒數；撥桿 = active playback asset 指標；
// 死信托盤 = 有負責人的待處理清單。

import type { LabStep, MechanismModule } from "./types.ts";

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

export interface PublishGateState {
  workers: { a: { status: WorkerStatus }; b: { status: WorkerStatus } };
  gate: GateStatus;
  /** 播放資產指標；assetId 為 null 表示尚未有任何資產啟用。 */
  pointer: { assetId: string | null; switchCount: number };
  /** 目前這份工作已嘗試的次數（來源損壞情境用於重試上限）。 */
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

const ASSET_A = "v42-g7-a";
const ASSET_B = "v42-g7-b";
const TOKEN_A = "gen 7 · attempt a";
const TOKEN_B = "gen 7 · attempt b";
const LEASE_FULL = "02:00";
const DEAD_LETTER_OWNER = "轉碼平台值班";

const NO_VALUE = "—";
const NO_ASSET = "無";
const RECEIPT_NONE = "未接受";
const RECEIPT_SAVED = "已保存";
const RECEIPT_RETURNED = "回傳原收據";

interface StepInput {
  a?: WorkerStatus;
  b?: WorkerStatus;
  gate?: GateStatus;
  assetId?: string | null;
  switchCount?: number;
  attempts?: number;
  deadLetter?: boolean;
  token?: string;
  lease?: string;
  receipt?: string;
  caption?: string;
}

// 每一步都從頭組出新物件，呼叫端改動結果不會污染下一次播放。
const step = (input: StepInput = {}): Step => {
  const assetId = input.assetId ?? null;
  const result: Step = {
    state: {
      workers: {
        a: { status: input.a ?? "idle" },
        b: { status: input.b ?? "idle" },
      },
      gate: input.gate ?? "idle",
      pointer: { assetId, switchCount: input.switchCount ?? 0 },
      attempts: input.attempts ?? 0,
      deadLetter: {
        hasJob: input.deadLetter ?? false,
        owner: input.deadLetter ? DEAD_LETTER_OWNER : null,
      },
    },
    readout: {
      activeToken: input.token ?? NO_VALUE,
      leaseRemaining: input.lease ?? NO_VALUE,
      activeAssetId: assetId ?? NO_ASSET,
      receipt: input.receipt ?? RECEIPT_NONE,
    },
  };
  if (input.caption !== undefined) result.caption = input.caption;
  return result;
};

// A 的正常完成起點，供 normal 與 duplicate 共用。
const acceptedByA = (extra: StepInput = {}): Step =>
  step({
    a: "accepted",
    gate: "accepted",
    assetId: ASSET_A,
    switchCount: 1,
    attempts: 1,
    token: TOKEN_A,
    receipt: RECEIPT_SAVED,
    ...extra,
  });

const normal = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: LEASE_FULL }),
  step({
    a: "submitting",
    gate: "verifying",
    attempts: 1,
    token: TOKEN_A,
    lease: "01:20",
  }),
  acceptedByA({
    caption:
      "A 提交的候選產物帶著仍有效的 token，通過驗證後，閘門保存收據並把播放指標切到它。整段只發生一次切換。",
  }),
];

const leaseReassign = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: LEASE_FULL }),
  step({ a: "offline", attempts: 1, token: TOKEN_A, lease: "已到期" }),
  step({
    a: "offline",
    b: "working",
    attempts: 2,
    token: TOKEN_B,
    lease: LEASE_FULL,
  }),
  step({
    a: "rejected",
    b: "working",
    gate: "rejected",
    attempts: 2,
    token: TOKEN_B,
    lease: "01:10",
  }),
  step({
    a: "rejected",
    b: "submitting",
    gate: "verifying",
    attempts: 2,
    token: TOKEN_B,
    lease: "00:40",
  }),
  step({
    a: "rejected",
    b: "accepted",
    gate: "accepted",
    assetId: ASSET_B,
    switchCount: 1,
    attempts: 2,
    token: TOKEN_B,
    receipt: RECEIPT_SAVED,
    caption:
      "A 回來時手上的 token 已經不是有效的那一個，所以被拒絕；它的產物從未被啟用。只有持有目前 token 的 B 能讓指標切換。",
  }),
];

const duplicate = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: LEASE_FULL }),
  step({
    a: "submitting",
    gate: "verifying",
    attempts: 1,
    token: TOKEN_A,
    lease: "01:20",
  }),
  acceptedByA(),
  acceptedByA({ a: "submitting", gate: "verifying" }),
  acceptedByA({
    gate: "receipt-returned",
    receipt: RECEIPT_RETURNED,
    caption:
      "同一份完成通知再次抵達時，閘門直接回傳當初保存的收據，不會再產生一次啟用。收據只證明當時接受過，影片現在能不能播要另外查。",
  }),
];

const MAX_ATTEMPTS = 3;

const corruptSource = (): Step[] => [
  step({ a: "working", attempts: 1, token: TOKEN_A, lease: LEASE_FULL }),
  step({ a: "working", attempts: 2, token: TOKEN_A, lease: "01:30" }),
  step({
    a: "working",
    attempts: MAX_ATTEMPTS,
    token: TOKEN_A,
    lease: "00:50",
  }),
  step({
    a: "failed",
    gate: "stopped",
    attempts: MAX_ATTEMPTS,
    deadLetter: true,
    token: TOKEN_A,
    caption:
      "來源損壞時重跑不會變好，退避重試到上限就停止，工作移進有負責人的死信清單。播放指標沒有動，觀眾看到的仍是原本的狀態。",
  }),
];

const scenarioBuilders: Record<string, () => Step[]> = {
  normal,
  "lease-reassign": leaseReassign,
  duplicate,
  "corrupt-source": corruptSource,
};

export const publishGate: MechanismModule<
  PublishGateState,
  PublishGateReadout
> = {
  scenarios: [
    { id: "normal", label: "正常完成" },
    { id: "lease-reassign", label: "心跳中斷改派" },
    { id: "duplicate", label: "重複完成通知" },
    { id: "corrupt-source", label: "來源損壞" },
  ],
  initialStep: () => step(),
  play: (scenarioId) => {
    const build = scenarioBuilders[scenarioId];
    if (!build) throw new Error(`未知的 scenarioId：${scenarioId}`);
    return build();
  },
};
