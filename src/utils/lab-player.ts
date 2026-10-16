// 機制實驗室動態圖的共用播放器（瀏覽器端，碰 DOM）。
// 情境資料來自 src/utils/lab/ 的純函式；每張圖只提供幾何的「state → 目標值」與繪製，
// 按鈕、計時、reduced motion、離開畫面暫停、讀數與說明、§ 連結與重設都在這裡。
//
// 元件標記約定（root 為帶 data-lab-root 的 figure）：
// - [data-lab-stage]：包住 SVG 的舞台，IntersectionObserver 觀察它
// - [data-lab-controls]、[data-lab-hint]：預設 hidden，掛載後顯示
// - button[data-scenario="<id>"]、button[data-lab-reset]
// - [data-readout="<key>"]：寫入 step.readout[key]
// - [data-lab-note]：播放進度與最後一步的 caption；root 的 data-static-note 是重設後的文字
// - [data-lab-back]：連回長文的段落；掛載時隱藏，情境播完才顯示

import type { LabStep } from "./lab/index.ts";

/** 會連續移動的量（位移、角度、比例），以指數趨近目標。 */
export type Motion = Record<string, number>;

type AnyStep = LabStep<unknown, object>;

export interface LabSource<T extends AnyStep> {
  initial: () => T;
  play: (scenarioId: string) => T[];
}

export interface RenderContext {
  /** 使用者偏好減少動態效果：不補間，直接到位。 */
  readonly reducedMotion: boolean;
  /** 安排本次情境內的延遲動作；開新情境或重設時一併取消。 */
  later(fn: () => void, ms: number): void;
  /** 改變部分目標值（例如中途點）。 */
  aim(next: Motion): void;
  /** 立刻把目前值設定到某處再趨近目標（例如讓脈衝從起點重新出發）。 */
  jump(next: Motion): void;
}

export interface LabFigure<T extends AnyStep> {
  /** 一步的 state 對應到各連續量的目標值；初始步驟決定有哪些量。 */
  targets(step: T): Motion;
  /** 把連續量寫進 SVG（transform、d、座標屬性），每一幀呼叫。 */
  draw(current: Readonly<Motion>): void;
  /**
   * 寫入離散狀態（data-*）。回傳的 Partial<Motion> 會蓋過這一步的目標值
   * （例如先送到中途點，再用 ctx.later 安排終點）；不需要時不回傳。
   */
  render(
    step: T,
    targets: Readonly<Motion>,
    ctx: RenderContext,
  ): Partial<Motion> | void;
}

const STEP_MS = 1100;
const LEAD_MS = 500;
const TAU = 0.28;
const SETTLE = 0.002;

function createSchedule() {
  let timers: number[] = [];
  return {
    later(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    },
    cancel() {
      timers.forEach((id) => window.clearTimeout(id));
      timers = [];
    },
  };
}

/** 一張圖一個動畫迴圈：離開畫面或全部到位就停；reduced motion 時直接到位。 */
function createAnimator(
  initial: Motion,
  draw: (current: Readonly<Motion>) => void,
  still: MediaQueryList,
) {
  const target: Motion = { ...initial };
  const current: Motion = { ...initial };
  const keys = Object.keys(initial);
  let frame = 0;
  let last = 0;
  let visible = false;

  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const ease = 1 - Math.exp(-dt / TAU);
    let moving = false;
    for (const key of keys) {
      const gap = (target[key] ?? 0) - (current[key] ?? 0);
      if (Math.abs(gap) < SETTLE) current[key] = target[key] ?? 0;
      else {
        current[key] = (current[key] ?? 0) + gap * ease;
        moving = true;
      }
    }
    draw(current);
    frame = visible && moving ? requestAnimationFrame(tick) : 0;
  }

  function run() {
    if (still.matches) {
      Object.assign(current, target);
      draw(current);
    } else if (!frame && visible) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  return {
    aim(next: Motion) {
      Object.assign(target, next);
      run();
    },
    jump(next: Motion) {
      Object.assign(current, next);
    },
    setVisible(next: boolean) {
      visible = next;
      if (visible) run();
    },
  };
}

function observe(stage: Element, onChange: (visible: boolean) => void) {
  new IntersectionObserver(
    (entries) => {
      // 同一次回呼可能帶進出兩筆，讀最新的一筆。
      const newest = entries[entries.length - 1];
      if (newest) onChange(newest.isIntersecting);
    },
    { rootMargin: "120px 0px" },
  ).observe(stage);
}

export function mountLabFigure<T extends AnyStep>(
  root: HTMLElement,
  source: LabSource<T>,
  figure: LabFigure<T>,
) {
  const stage = root.querySelector("[data-lab-stage]");
  if (!stage) throw new Error("機制實驗室圖缺少 [data-lab-stage]");
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-scenario]");
  const readouts = root.querySelectorAll<HTMLElement>("[data-readout]");
  const note = root.querySelector<HTMLElement>("[data-lab-note]");
  const back = root.querySelector<HTMLElement>("[data-lab-back]");
  const staticNote = root.dataset.staticNote ?? "";
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const schedule = createSchedule();
  const animator = createAnimator(
    figure.targets(source.initial()),
    (current) => figure.draw(current),
    still,
  );
  const ctx: RenderContext = {
    get reducedMotion() {
      return still.matches;
    },
    later: schedule.later,
    aim: animator.aim,
    jump: animator.jump,
  };

  const showBack = (on: boolean) => {
    if (back) back.hidden = !on;
  };

  function renderStep(step: T, text: string) {
    const base = figure.targets(step);
    const targets = {
      ...base,
      ...(figure.render(step, base, ctx) ?? {}),
    } as Motion;
    const readout = step.readout as Record<string, unknown>;
    readouts.forEach((element) => {
      const key = element.dataset.readout ?? "";
      element.textContent = String(readout[key] ?? "");
    });
    if (note) note.textContent = text;
    animator.aim(targets);
  }

  function setPressed(id: string | null) {
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.scenario === id),
      ),
    );
  }

  function start(button: HTMLButtonElement) {
    const id = button.dataset.scenario ?? "";
    const label = button.textContent?.trim() ?? id;
    const steps = source.play(id);
    schedule.cancel();
    setPressed(id);
    showBack(false);
    // 先回到起點，再逐步播放。
    renderStep(source.initial(), `播放中：${label}`);
    steps.forEach((step, index) => {
      const final = index === steps.length - 1;
      schedule.later(
        () => {
          renderStep(
            step,
            final && step.caption
              ? step.caption
              : `播放中：${label}（第 ${index + 1}／${steps.length} 步）`,
          );
          if (final) showBack(true);
        },
        LEAD_MS + index * STEP_MS,
      );
    });
  }

  function reset() {
    schedule.cancel();
    setPressed(null);
    showBack(false);
    renderStep(source.initial(), staticNote);
  }

  buttons.forEach((button) =>
    button.addEventListener("click", () => start(button)),
  );
  root
    .querySelector<HTMLButtonElement>("[data-lab-reset]")
    ?.addEventListener("click", reset);
  observe(stage, animator.setVisible);

  showBack(false);
  root.querySelector("[data-lab-controls]")?.removeAttribute("hidden");
  root.querySelector("[data-lab-hint]")?.removeAttribute("hidden");
}
