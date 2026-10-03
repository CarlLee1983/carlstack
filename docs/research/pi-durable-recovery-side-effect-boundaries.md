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

## 2026-10-04 更新：jiangkoumo 恢復驗收

- 使用者新來源原始 URL：https://x.com/jiangkoumo_/status/2106317420961112392?s=46 。正規化 URL：https://x.com/jiangkoumo_/status/2106317420961112392 。移除追蹤參數 s，保留穩定 ID 2106317420961112392。作者 jiangkoumo（@jiangkoumo_），標題「Pi Durable 实战指南：给自己的 Agent 加上断点续跑」。X 顯示 2026-10-03 02:36，時區未確認，不推算精確發文時間。
- 修改前在 blog、research、article queue 查完整 URL／正規化 URL／ID／作者／pi-durable／Pi Durable。ID 無既有紀錄，但 Pi Durable 的主題與本篇相同，因此更新既有 URL，不新增文章或系列順序；publishDate 保持不變，更新 updatedDate。基準 main d43ed5ca218b46ad5f0ac9b113c70e9bbe22f9e8。
- 已由雲端瀏覽器讀原 X article。新增讀者收穫：完成後重新開啟只證明結果重用；中途故障另需控制暫停點與核對 submission／task／已完成工具；Doc 已讀狀態不代表模型理解；safe 應涵蓋整段 execute 的狀態變動；done 不能代替業務品質驗收。不複製全文或長程式，不把原作者 DeepSeek 執行结果寫成本站實測。
- 再讀官方 README current main（內容 blob fef41c069a65678833325a42cc10a294d214aa90）及既有 commit 7fbbd5f4a1d982bb02d63472dde0774fa639f99b 的 spec。新增引用保持固定 commit。Storage 支持 MemoryStorage 不持久化、SQLite WAL/NORMAL 的 process crash 與 power/host failure 區別；spec 第 2.2 節明訂既有 root 忽略 agent/init。沒有宣稱本次 API 更新，也沒有宣稱完成主機斷電測試。
- 官方 spec：https://github.com/earendil-works/pi/blob/7fbbd5f4a1d982bb02d63472dde0774fa639f99b/packages/durable/docs/spec.md#22-public-harness-surface 。原來源與官方事實、本文驗收建議分開標示。
- 維持 AI Agent 工程化與工作流實戰 seriesOrder 52；沿用符合恢復／授權主題的原封面。已重新檢視 1672×941 完整圖與 320×180 卡片，無不應有的文字或商標，雙閘門與斷裂路徑可辨。
- 本次瀏覽器版面驗收依使用者明確授權交由發布後線上檢視；不宣稱重新完成桌面／320 px 深淺色預覽，不繞過既有 loopback 限制。仍執行完整 format、staged policy、check、test、build 與索引檢查。
