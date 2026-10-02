# Pi Durable：恢復與副作用邊界查核

查核日期：2026-10-02（Asia/Taipei）。

## 去重與選題

- 研究前查 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的 pi-1-0、pi-durable、Pi Durable、Earendil、checkpoint、重啟與冪等相關字串。
- 主來源 URL／正規化 URL：https://earendil.com/posts/pi-1-0/ 、https://earendil.com/posts/pi-durable/ 。穩定識別 pi-1-0、pi-durable；作者 Earendil／Earendil Engineering；兩文均標 2026-10-01。
- 既有 `pi-mcp-codemode-tool-composition` 聚焦 MCP、工具發現與程式組合；本篇以 process 中斷、checkpoint、提交去重、外部副作用與核准恢復為讀者收穫，並連回舊文。
- 既有消息交付語義文章有通用冪等背景，未涵蓋本次 Pi Durable 發布；本篇不重述 Kafka。
- 基準 main：dad0a35040998dd426734172e62e76d1001e4de8。未找到 2026-10-02 既有文章。AI Agent 工程化與工作流實戰最高 order 51，本篇接續 52；不修改無關舊資料。
- 初步備選 Clef、decision models、SvelteKit、turbopuffer 在三處未找到關鍵字；沒有取得所有備選作者與穩定 ID，這僅是初步查重。

## 證據與限制

- Pi 1.0 公告完整讀取：https://earendil.com/posts/pi-1-0/ 。穩定 coding harness 的定位是官方說法；Durable 同時發布但明確 experimental。
- Pi Durable 公告完整讀取：https://earendil.com/posts/pi-durable/ 。核對 checkpoint、replay safe、requestId、memo、ownership、付款去重示例與 API 可變動警告。
- 官方 repo：https://github.com/earendil-works/pi 。查核時 main 為 7fbbd5f4a1d982bb02d63472dde0774fa639f99b；正文 README 連結固定到該 commit，避免浮動文件成為固定 API 承諾。
- README：https://github.com/earendil-works/pi/blob/7fbbd5f4a1d982bb02d63472dde0774fa639f99b/packages/durable/README.md 。核對 Persist and Resume、Tools、Abort and Subagents。工具未標 replay safe 的 interrupted 行為與提交 requestId 去重各有不同範圍。
- 「遠端已成功、本機未保存」空窗、核准參數綁定與四個故障注入點是作者建議。未安裝或執行 Pi、未做當機測試，無恢復成功率與效能數據；JSON 明確標為概念紀錄。

## 封面方向與驗收

近期封面：影片為攝影材質、横向膠片、暖白琥珀；Pi MCP 為網版合成器、俯視、象牙白酒紅橄欖綠；eval 為靛藍山形。

本篇：陶土步道與雙閘門隱喻；黏土微縮材質；斜俯視構圖；陶土、鼠尾草綠與粉白；陰天漫射光。與最近封面在媒材、構圖、主色與光線均不同。

使用內建 imagegen skill。提示：Original horizontal 16:9 editorial cover; sculpted terracotta causeway crossing pale sage landscape; ceramic checkpoint gate bridging a broken segment; clay tokens waiting at a separate human-operated gate; handcrafted clay stop-motion miniature aesthetic, elevated diagonal view, cool overcast diffuse light; no text, letters, numbers, logos or watermark.

資產：`src/assets/covers/pi-durable-recovery-side-effect-boundaries.png`，1672 × 941。完整圖與文章／索引卡片均已視覺檢查，無文字或商標，裁切仍可辨識檢查點與第二閘門。

隔離 Chrome profile 檢查預覽：1440 px 與 320 px 深淺色，封面均載入；320 px document scrollWidth 為 320。截圖保留於任務 workspace，不提交 QA 腳本或截圖。必要依賴已以 pnpm 12.1.0 完成 `pnpm install --frozen-lockfile`。
