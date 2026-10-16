// 「水塔＋抽水站」：長文 §8 的回源成本機制。
// 概念對應：edge 水塔 = 各地 CDN edge 的快取；抽水站 = origin；中間可選的蓄水池 = Origin Shield；
// 儀表 = 位元組命中率、回源 Gbps、origin 負載。命中率是位元組比例，不是 request hit ratio。

import type { LabStep, MechanismModule, ScenarioDef } from "./types.ts";

export type DeferredRendition = "running" | "paused";

export interface EdgeTower {
  /** 水位 0～1，代表該 edge 的快取填充程度。 */
  level: number;
  /** 該 edge 正在未命中、向上游抓取。 */
  missing: boolean;
}

export interface OriginCostState {
  edges: EdgeTower[];
  shield: { enabled: boolean; level: number };
  /** 是否合併相同物件的並發回源。 */
  collapse: boolean;
  /** 位元組命中率 0～1。 */
  byteHit: number;
  /**
   * 同一個物件這一步同時向 origin 抓取的次數：沒有合併時，每個未命中的 edge 各抓一次；
   * 合併並發回源（Shield 後）或沒有 edge 未命中時為 1。文章的 0.52／3.12 是未計入重複抓取的簡化值。
   */
  originFetches: number;
  /** 回源 Gbps = EGRESS_GBPS × (1 − byteHit) × originFetches，只含快取未命中的位元組。 */
  originGbps: number;
  /** 後補格式與背景掃描的回源量（Gbps）；暫緩時為 0。教學假設，不是文章數字。 */
  backfillGbps: number;
  /** (originGbps + backfillGbps) 占 origin 容量的比例；超過 1 代表超載，圖自行截斷顯示。 */
  originLoad: number;
  /** 後補格式是否執行中。 */
  deferred: DeferredRendition;
}

export interface OriginCostReadout {
  byteHit: string;
  originGbps: string;
  originLoad: string;
}

type Step = LabStep<OriginCostState, OriginCostReadout>;

/** 文章的尖峰總下行假設（Gbps）。 */
export const EGRESS_GBPS = 10.4;
/**
 * origin 容量（Gbps）。這是教學用假設，不是文章數字：取 4 Gbps。
 * 負載一律含後補流量（執行中時），所有情境一致：95% 命中約 23%、70% 命中約 88%，
 * 冷門轉熱門的暴衝（三個 edge 各自回源）約 166%，會超過容量，這正是要展示的代價；
 * overload 情境命中率 65% 時執行後補為 101%，暫緩後補後為 91%。
 */
export const ORIGIN_CAPACITY_GBPS = 4;
/**
 * 後補格式與背景掃描執行中的回源量（Gbps）。同為教學假設；
 * originGbps 仍只代表快取未命中的位元組，文章的 0.52 與 3.12 不變。
 */
export const BACKFILL_GBPS = 0.4;

const EDGE_COUNT = 3;

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;

// 讀數全部由 state 推導。
const readoutOf = (state: OriginCostState): OriginCostReadout => ({
  byteHit: percent(state.byteHit),
  originGbps: `${state.originGbps.toFixed(2)} Gbps`,
  originLoad: percent(state.originLoad),
});

interface StepInput {
  edges?: EdgeTower[];
  shield?: { enabled: boolean; level: number };
  collapse?: boolean;
  /** 位元組命中率；回源量與負載由它推導。 */
  byteHit?: number;
  deferred?: DeferredRendition;
  caption?: string;
}

// 每一步都從頭組出新物件，呼叫端改動結果不會污染下一次播放。
const step = (input: StepInput = {}): Step => {
  const byteHit = input.byteHit ?? 0.95;
  const edges =
    input.edges?.map((e) => ({ ...e })) ??
    Array.from({ length: EDGE_COUNT }, () => ({ level: 1, missing: false }));
  const collapse = input.collapse ?? false;
  const originFetches = collapse
    ? 1
    : Math.max(1, edges.filter((e) => e.missing).length);
  const originGbps = EGRESS_GBPS * (1 - byteHit) * originFetches;
  const deferred = input.deferred ?? "running";
  const backfillGbps = deferred === "running" ? BACKFILL_GBPS : 0;
  const state: OriginCostState = {
    edges,
    shield: { ...(input.shield ?? { enabled: false, level: 0 }) },
    collapse,
    originFetches,
    byteHit,
    originGbps,
    backfillGbps,
    originLoad: (originGbps + backfillGbps) / ORIGIN_CAPACITY_GBPS,
    deferred,
  };
  const result: Step = { state, readout: readoutOf(state) };
  if (input.caption !== undefined) result.caption = input.caption;
  return result;
};

const warming = (level: number, missing: boolean): EdgeTower[] =>
  Array.from({ length: EDGE_COUNT }, () => ({ level, missing }));

// 文章示例：命中率 95%，回源約 0.52 Gbps。
const hit95 = (): Step[] => [
  step({ edges: warming(0.6, false), byteHit: 0.85 }),
  step({ edges: warming(0.85, false), byteHit: 0.92 }),
  step({
    edges: warming(1, false),
    byteHit: 0.95,
    caption:
      "10.4 Gbps 的下行裡，只有 5% 的位元組需要回到 origin，約 0.52 Gbps。這裡算的是位元組比例，不是 request hit ratio。",
  }),
];

// 同樣的總下行，命中率掉到 70%，回源約 3.12 Gbps，是 95% 的六倍。
const hit70 = (): Step[] => [
  step({ byteHit: 0.95 }),
  step({ edges: warming(0.8, false), byteHit: 0.85 }),
  step({
    edges: warming(0.6, false),
    byteHit: 0.7,
    caption:
      "同樣是 10.4 Gbps，命中率從 95% 掉到 70%，回源就從約 0.52 變成約 3.12 Gbps，相差六倍。這是位元組比例的簡化推算，尚未計入 Range 與清單請求。",
  }),
];

// 冷門影片突然轉熱門：所有 edge 同時未命中，回源暴衝；啟用 Shield 與合併並發回源後回落。
const coldToHot = (): Step[] => [
  step({ byteHit: 0.95 }),
  step({ edges: warming(0.1, true), byteHit: 0.8 }),
  step({
    edges: warming(0.5, true),
    shield: { enabled: true, level: 0.4 },
    collapse: true,
    byteHit: 0.85,
  }),
  step({
    edges: warming(1, false),
    shield: { enabled: true, level: 1 },
    collapse: true,
    byteHit: 0.9,
    caption:
      "三個 edge 同時沒有這支影片，各自回源同一個物件，origin 一下子被重複抓取拉到超過容量。加上 Origin Shield 與合併相同物件的並發回源後，重複的填充被吸收，回源量回落。預熱也要有邊界，不是把所有畫質推到所有區域。",
  }),
];

// origin 超載：優先保住基本畫質，暫緩昂貴的後補格式與背景工作。
const overload = (): Step[] => [
  step({ byteHit: 0.95 }),
  step({ edges: warming(0.7, false), byteHit: 0.7 }),
  step({ edges: warming(0.5, false), byteHit: 0.65 }),
  step({
    edges: warming(0.5, false),
    byteHit: 0.65,
    deferred: "paused",
    caption:
      "回源量超過 origin 能承受的範圍時，先保住已存在的基本畫質，觀眾看的仍是這些畫質，會繼續播放。暫緩昂貴的後補格式與非必要的背景工作後，origin 負載就退回容量以內，等穩定再恢復。",
  }),
];

const scenarioTable: readonly ScenarioDef<
  OriginCostState,
  OriginCostReadout
>[] = [
  { id: "hit-95", label: "命中率 95%", build: hit95 },
  { id: "hit-70", label: "命中率 70%", build: hit70 },
  { id: "cold-to-hot", label: "冷門轉熱門", build: coldToHot },
  { id: "overload", label: "origin 超載", build: overload },
];

export const originCost: MechanismModule<OriginCostState, OriginCostReadout> = {
  scenarios: scenarioTable,
  initialStep: () => step(),
};
