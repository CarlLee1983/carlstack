// 機制實驗室動態圖的共用幾何（純函式，不碰 DOM）。
// 座標都是 SVG viewBox 的螢幕座標；等角投影由各圖的 build script 先算成
// 「世界座標每單位的螢幕位移」向量（VX、VY、VZ）與錨點，執行期只做仿射運算。

export type Vec = [number, number];

/** 四捨五入到 0.1，寫進 SVG 屬性時用。 */
export const fmt = (value: number) => Math.round(value * 10) / 10;

export const point = ([x, y]: Vec) => `${fmt(x)} ${fmt(y)}`;

/** 沿螢幕向量 v 平移 amount 單位的 transform 字串。 */
export const translate = (v: Vec, amount: number) =>
  `translate(${fmt(v[0] * amount)} ${fmt(v[1] * amount)})`;

/** 兩點直線的 path d。 */
export const segmentPath = (a: Vec, b: Vec) => `M${point(a)}L${point(b)}`;

/** origin + a·sa + b·sb：在某個平面上沿兩個軸向量取點（刻度盤、撥桿、閥把手）。 */
export const along = (
  origin: Vec,
  a: Vec,
  b: Vec,
  sa: number,
  sb: number,
): Vec => [
  origin[0] + a[0] * sa + b[0] * sb,
  origin[1] + a[1] * sa + b[1] * sb,
];

/** 折線上依弧長比例 share（0～1）取點。 */
export function pointAlong(points: readonly Vec[], share: number): Vec {
  const lengths = points.slice(1).map((p, i) => {
    const q = points[i] as Vec;
    return Math.hypot(p[0] - q[0], p[1] - q[1]);
  });
  let left = share * lengths.reduce((sum, length) => sum + length, 0);
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i] ?? 0;
    const a = points[i] as Vec;
    const b = points[i + 1] as Vec;
    if (left <= length || i === lengths.length - 1) {
      const t = length ? Math.min(1, left / length) : 0;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    left -= length;
  }
  return (points[0] ?? [0, 0]) as Vec;
}

/** 一串脈衝中第 index 顆的進度：同一個 t 驅動，各顆錯開出發。 */
export const staggered = (t: number, index: number) =>
  Math.min(1, Math.max(0, t * 1.5 - index * 0.25));

/** 去程 0→1、回程 1→0；t 到底（≥ 0.999）時回傳 1，代表脈衝結束。 */
export const roundTrip = (t: number) =>
  t >= 0.999 ? 1 : t < 0.5 ? t * 2 : 2 - t * 2;
