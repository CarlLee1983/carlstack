// 機制實驗室的共用型別。情境模組不碰 DOM、Astro API 與時鐘，
// 只把「每一步長什麼樣」描述成純資料，由客戶端腳本負責播放與渲染。

/** 一個播放步驟；caption 只出現在情境的最後一步。 */
export interface LabStep<State, Readout> {
  state: State;
  readout: Readout;
  caption?: string;
}

export interface ScenarioInfo {
  id: string;
  label: string;
}

/** 一個情境的定義：id、標籤與步驟只在這裡寫一次。 */
export interface ScenarioDef<State, Readout> extends ScenarioInfo {
  /** 每次呼叫都回傳新物件。 */
  build: () => LabStep<State, Readout>[];
}

/** 單一機制向註冊表登記的內容；新增機制只要多寫一個符合此形狀的模組。 */
export interface MechanismModule<State, Readout> {
  /** 依顯示順序；播放時由 index.ts 的入口依 id 找出情境，未知 scenarioId 在那裡統一丟錯。 */
  scenarios: readonly ScenarioDef<State, Readout>[];
  /** 每次呼叫都回傳新物件。 */
  initialStep: () => LabStep<State, Readout>;
}
