// 機制實驗室情境模組的統一入口。純資料、無 DOM、無時鐘；
// 新增機制只要寫好一個 MechanismModule，並在 registry 登記一列。

import { publishGate } from "./publish-gate.ts";
import type { PublishGateReadout, PublishGateState } from "./publish-gate.ts";
import type { LabStep, MechanismModule, ScenarioInfo } from "./types.ts";

export type { LabStep, ScenarioInfo } from "./types.ts";
export type {
  GateStatus,
  PublishGateReadout,
  PublishGateState,
  WorkerStatus,
} from "./publish-gate.ts";

// 之後加入 "playback-auth" | "origin-cost" 時在此擴充。
export type Mechanism = "publish-gate";

interface StateByMechanism {
  "publish-gate": { state: PublishGateState; readout: PublishGateReadout };
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
};

const isMechanism = (value: string): value is Mechanism =>
  Object.hasOwn(registry, value);

function lookup(mechanism: string) {
  if (!isMechanism(mechanism)) {
    throw new Error(`未知的 mechanism：${mechanism}`);
  }
  return registry[mechanism];
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
  return lookup(mechanism).play(scenarioId);
}

export function scenarios(mechanism: string): ScenarioInfo[] {
  return lookup(mechanism).scenarios.map((scenario) => ({ ...scenario }));
}

export function initialStep<M extends Mechanism>(mechanism: M): StepOf<M>;
export function initialStep(mechanism: string): StepOf<Mechanism>;
export function initialStep(mechanism: string) {
  return lookup(mechanism).initialStep();
}
