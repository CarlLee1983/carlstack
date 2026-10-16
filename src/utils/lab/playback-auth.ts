// 「售票亭＋輸送管」：長文 §7 的播放授權機制。
// 概念對應：售票亭 = 播放 API，發出帶沙漏的短期資格；CDN edge 水槽 = 快取的 segments；
// 檢票閘 = edge 驗證資格（快取命中也要驗）；播放器 = 觀眾端；origin 只能經由 CDN 到達。

import type { LabStep, MechanismModule, ScenarioDef } from "./types.ts";

export type KioskStatus = "idle" | "issuing" | "unavailable";
export type PlayerStatus = "idle" | "playing" | "stalled" | "blocked";
export type EdgeDecision = "none" | "allowed" | "denied";
export type ViewerId = "viewer" | "newcomer";

export interface PassState {
  held: boolean;
  /** 剩餘效期占完整 05:00 的比例（0～1）；沒有資格或已到期為 0。 */
  share: number;
}

export interface ViewerState {
  pass: PassState;
  player: PlayerStatus;
  /** 播放器已緩衝、尚未播完的 segment 數；播放中預設 3。 */
  buffer: number;
}

export interface PlaybackAuthState {
  kiosk: KioskStatus;
  /** 這一步正在向售票亭要資格的觀眾；沒有人就是 null。 */
  kioskRequester: ViewerId | null;
  /** viewer 是已在播放的觀眾，newcomer 是還沒有資格的新觀眾。 */
  viewers: Record<ViewerId, ViewerState>;
  /** 最近一次 segment 請求在 edge 的判定；requester 為 null 表示沒有請求。 */
  edge: {
    decision: EdgeDecision;
    cacheHit: boolean;
    requester: ViewerId | null;
    /** 本步有新的 CDN 請求抵達 edge（cdnRequests 比上一步多）；由 play 統一推導。 */
    fresh: boolean;
  };
  /** 這一步是否有請求打到 origin。 */
  originTouched: boolean;
  counters: { appRequests: number; cdnRequests: number };
}

export interface PlaybackAuthReadout {
  passRemaining: string;
  appRequests: string;
  cdnRequests: string;
}

type Step = LabStep<PlaybackAuthState, PlaybackAuthReadout>;

/** 示例效期：五分鐘（示例政策，非固定推薦值）。 */
export const PASS_SECONDS = 300;

const BUFFER_FULL = 3;

const NO_VALUE = "—";
const EXPIRED = "已到期";

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// 讀數全部由 state 推導：資格剩餘時間讀的是 viewer 的資格。
const readoutOf = (state: PlaybackAuthState): PlaybackAuthReadout => {
  const { pass } = state.viewers.viewer;
  let passRemaining = NO_VALUE;
  if (pass.share > 0) {
    passRemaining = formatTime(Math.round(pass.share * PASS_SECONDS));
  } else if (pass.held) {
    passRemaining = EXPIRED;
  }
  return {
    passRemaining,
    appRequests: String(state.counters.appRequests),
    cdnRequests: String(state.counters.cdnRequests),
  };
};

interface ViewerInput {
  /** 剩餘效期秒數；省略表示沒有資格，0 表示持有但已到期。 */
  pass?: number;
  player?: PlayerStatus;
  buffer?: number;
}

interface StepInput {
  kiosk?: KioskStatus;
  kioskRequester?: ViewerId;
  viewer?: ViewerInput;
  newcomer?: ViewerInput;
  edge?: {
    decision: Exclude<EdgeDecision, "none">;
    cacheHit: boolean;
    requester: ViewerId;
  };
  originTouched?: boolean;
  appRequests?: number;
  cdnRequests?: number;
  caption?: string;
}

const viewerOf = (input: ViewerInput = {}): ViewerState => ({
  pass: {
    held: input.pass !== undefined,
    share: (input.pass ?? 0) / PASS_SECONDS,
  },
  player: input.player ?? "idle",
  buffer: input.buffer ?? (input.player === "playing" ? BUFFER_FULL : 0),
});

// 每一步都從頭組出新物件，呼叫端改動結果不會污染下一次播放。
const step = (input: StepInput = {}): Step => {
  const state: PlaybackAuthState = {
    kiosk: input.kiosk ?? "idle",
    kioskRequester: input.kioskRequester ?? null,
    viewers: {
      viewer: viewerOf(input.viewer),
      newcomer: viewerOf(input.newcomer),
    },
    edge: input.edge
      ? { ...input.edge, fresh: false }
      : { decision: "none", cacheHit: false, requester: null, fresh: false },
    originTouched: input.originTouched ?? false,
    counters: {
      appRequests: input.appRequests ?? 0,
      cdnRequests: input.cdnRequests ?? 0,
    },
  };
  const result: Step = { state, readout: readoutOf(state) };
  if (input.caption !== undefined) result.caption = input.caption;
  return result;
};

// 一次授權，之後的 segment 請求全由 CDN 回應；首片未快取時才經 CDN 回源。
const normal = (): Step[] => [
  step({
    kiosk: "issuing",
    kioskRequester: "viewer",
    viewer: { pass: 300 },
    appRequests: 1,
  }),
  step({
    viewer: { pass: 270, player: "playing" },
    edge: { decision: "allowed", cacheHit: false, requester: "viewer" },
    originTouched: true,
    appRequests: 1,
    cdnRequests: 1,
  }),
  step({
    viewer: { pass: 200, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 1,
    cdnRequests: 5,
  }),
  step({
    viewer: { pass: 120, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 1,
    cdnRequests: 9,
    caption:
      "授權只在開頭問了應用一次，之後每個 segment 都是 CDN 憑資格直接回應。應用請求數與影片位元組的請求數完全不是同一個量級。",
  }),
];

// 資格到期前，播放器先向應用更新，換成新的完整效期，播放不中斷。
const refresh = (): Step[] => [
  step({
    viewer: { pass: 150, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 1,
    cdnRequests: 8,
  }),
  step({
    viewer: { pass: 20, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 1,
    cdnRequests: 14,
  }),
  step({
    kiosk: "issuing",
    kioskRequester: "viewer",
    viewer: { pass: 15, player: "playing" },
    appRequests: 2,
    cdnRequests: 14,
  }),
  step({
    viewer: { pass: 300, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 2,
    cdnRequests: 15,
    caption:
      "播放器在資格到期前就回到售票亭換新的，舊資格還沒失效，所以影片一格都沒停。五分鐘只是示例政策，太短會增加對授權服務的依賴。",
  }),
];

// 授權服務掛掉：持有效資格者由 CDN 續播到期限為止；到期後請求在 edge 被拒絕。
const authDown = (): Step[] => [
  step({
    viewer: { pass: 240, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 1,
    cdnRequests: 6,
  }),
  step({
    kiosk: "unavailable",
    viewer: { pass: 150, player: "playing" },
    edge: { decision: "allowed", cacheHit: true, requester: "viewer" },
    appRequests: 1,
    cdnRequests: 10,
  }),
  step({
    kiosk: "unavailable",
    kioskRequester: "viewer",
    viewer: { pass: 90, player: "playing" },
    appRequests: 2,
    cdnRequests: 10,
  }),
  step({
    kiosk: "unavailable",
    kioskRequester: "newcomer",
    viewer: { pass: 60, player: "playing" },
    newcomer: { player: "blocked" },
    appRequests: 3,
    cdnRequests: 10,
  }),
  step({
    kiosk: "unavailable",
    viewer: { pass: 0, player: "playing", buffer: 2 },
    newcomer: { player: "blocked" },
    edge: { decision: "denied", cacheHit: true, requester: "viewer" },
    appRequests: 3,
    cdnRequests: 11,
  }),
  step({
    kiosk: "unavailable",
    viewer: { pass: 0, player: "stalled", buffer: 0 },
    newcomer: { player: "blocked" },
    edge: { decision: "denied", cacheHit: true, requester: "viewer" },
    appRequests: 3,
    cdnRequests: 11,
    caption:
      "授權服務無法確認權限時，不再發出新資格，但手上還有效的資格照常運作，更新失敗也不會讓播放立刻停。資格到期後，新的 segment 請求在 edge 被拒絕，已經傳出、緩衝好的片段不會被收回，播完才停。",
  }),
];

// 沒有資格的請求直接打 segment URL：即使該 segment 已在 edge 快取，也要先驗資格。
const directUrl = (): Step[] => [
  step({ newcomer: { player: "idle" } }),
  step({
    newcomer: { player: "idle" },
    edge: { decision: "denied", cacheHit: true, requester: "newcomer" },
    cdnRequests: 1,
  }),
  step({
    newcomer: { player: "blocked" },
    edge: { decision: "denied", cacheHit: true, requester: "newcomer" },
    cdnRequests: 1,
    caption:
      "沒有資格的請求即使撞上已經快取的 segment，檢票閘照樣擋下，origin 一次都沒被碰到。快取命中只代表東西在 edge，不代表請求者有權拿。",
  }),
];

// 有 edge 請求、且 cdnRequests 比上一步多，才算新請求；圖不必自己比對相鄰步驟。
const markFresh = (steps: Step[]): Step[] =>
  steps.map((current, i) => {
    const previous = steps[i - 1]?.state.counters.cdnRequests ?? 0;
    const fresh =
      current.state.edge.requester !== null &&
      current.state.counters.cdnRequests > previous;
    return {
      ...current,
      state: { ...current.state, edge: { ...current.state.edge, fresh } },
    };
  });

const scenarioTable: readonly ScenarioDef<
  PlaybackAuthState,
  PlaybackAuthReadout
>[] = [
  { id: "normal", label: "正常播放", build: normal },
  { id: "refresh", label: "到期前更新", build: refresh },
  { id: "direct-url", label: "直接抓 segment URL", build: directUrl },
  { id: "auth-down", label: "授權服務暫時不可用", build: authDown },
];

export const playbackAuth: MechanismModule<
  PlaybackAuthState,
  PlaybackAuthReadout
> = {
  scenarios: scenarioTable.map((scenario) => ({
    ...scenario,
    build: () => markFresh(scenario.build()),
  })),
  initialStep: () => step(),
};
