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

/** 單一機制向註冊表登記的內容；新增機制只要多寫一個符合此形狀的模組。 */
export interface MechanismModule<State, Readout> {
  scenarios: readonly ScenarioInfo[];
  /** 每次呼叫都回傳新物件。 */
  initialStep: () => LabStep<State, Readout>;
  /** 每次呼叫都回傳新物件；未知 scenarioId 由註冊表先擋下。 */
  play: (scenarioId: string) => LabStep<State, Readout>[];
}
