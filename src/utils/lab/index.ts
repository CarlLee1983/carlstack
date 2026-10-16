// 機制實驗室情境模組的統一入口。純資料、無 DOM、無時鐘；
// 新增機制只要寫好一個 MechanismModule，並在 registry 登記一列。

import { originCost } from "./origin-cost.ts";
import type { OriginCostReadout, OriginCostState } from "./origin-cost.ts";
import { playbackAuth } from "./playback-auth.ts";
import type {
  PlaybackAuthReadout,
  PlaybackAuthState,
} from "./playback-auth.ts";
import { publishGate } from "./publish-gate.ts";
import type { PublishGateReadout, PublishGateState } from "./publish-gate.ts";
import type { LabStep, MechanismModule, ScenarioInfo } from "./types.ts";

export type { LabStep, ScenarioInfo } from "./types.ts";
export type {
  EdgeDecision,
  KioskStatus,
  PassState,
  PlaybackAuthReadout,
  PlaybackAuthState,
  PlayerStatus,
  ViewerId,
  ViewerState,
} from "./playback-auth.ts";
export type {
  DeferredRendition,
  EdgeTower,
  OriginCostReadout,
  OriginCostState,
} from "./origin-cost.ts";
export type {
  GateStatus,
  PublishGateReadout,
  PublishGateState,
  WorkerStatus,
} from "./publish-gate.ts";

export type Mechanism = "publish-gate" | "playback-auth" | "origin-cost";

interface StateByMechanism {
  "publish-gate": { state: PublishGateState; readout: PublishGateReadout };
  "playback-auth": { state: PlaybackAuthState; readout: PlaybackAuthReadout };
  "origin-cost": { state: OriginCostState; readout: OriginCostReadout };
}

type StepOf<M extends Mechanism> = LabStep<
  StateByMechanism[M]["state"],
  StateByMechanism[M]["readout"]
>;

const registry: {
  [M in Mechanism]: MechanismModule<
    StateByMechanism[M]["state"],
    StateByMechanism[M]["readout"]
  >;
} = {
  "publish-gate": publishGate,
  "playback-auth": playbackAuth,
  "origin-cost": originCost,
};

const isMechanism = (value: string): value is Mechanism =>
  Object.hasOwn(registry, value);

function lookup(mechanism: string) {
  if (!isMechanism(mechanism)) {
    throw new Error(`未知的 mechanism：${mechanism}`);
  }
  return registry[mechanism];
}

// 未知的 scenarioId 只在這裡丟錯，各機制模組不重複處理。
function findScenario(mechanism: string, scenarioId: string) {
  const scenario = lookup(mechanism).scenarios.find(
    ({ id }) => id === scenarioId,
  );
  if (!scenario) throw new Error(`未知的 scenarioId：${scenarioId}`);
  return scenario;
}

export function play<M extends Mechanism>(
  mechanism: M,
  scenarioId: string,
): StepOf<M>[];
export function play(
  mechanism: string,
  scenarioId: string,
): StepOf<Mechanism>[];
export function play(mechanism: string, scenarioId: string) {
  return findScenario(mechanism, scenarioId).build();
}

/** 已註冊的機制，依註冊順序。 */
export function mechanisms(): Mechanism[] {
  return Object.keys(registry) as Mechanism[];
}

export function scenarios(mechanism: string): ScenarioInfo[] {
  return lookup(mechanism).scenarios.map(({ id, label }) => ({ id, label }));
}

export function initialStep<M extends Mechanism>(mechanism: M): StepOf<M>;
export function initialStep(mechanism: string): StepOf<Mechanism>;
export function initialStep(mechanism: string) {
  return lookup(mechanism).initialStep();
}
