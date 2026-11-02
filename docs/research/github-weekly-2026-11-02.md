# GitHub 熱門專案週報：2026-11-02 查核

- 文章：`src/content/blog/github-weekly-2026-11-02.md`
- Asia/Taipei 週次：2026-W45；本系列第 1 篇。
- 基準 main：`9fba28d0d5d58951c4789d167108547e77901733`。
- 完整查重：AGENTS、內容指南、schema、部署 workflow、相關 copywriting/humanize skill；搜尋 blog/research/queue 的 weekly URL、系列名與十個 owner/repo，無同週週報。不改每日系列或站台設定。
- `trail` 指令與 `.trail/cache/INDEX.md` 均不可用，改直接讀必要檔案。

## 排名快照

2026-11-02 09:03 至 09:05 +08:00，以正常雲端瀏覽器讀取 https://github.com/trending?since=weekly ，選項 Language Any、Spoken Language Any、This week。搜尋工具同 URL 回傳標為上月的不同快照，未採用。官方未標精確週期起訖，不自行推定自然週。

名次／owner-repo／累積 stars／stars this week：

1. Nutlope/hallmark：44,886／11,566
2. pbakaus/impeccable：99,337／12,017
3. AgriciDaniel/claude-seo：25,546／5,034
4. thedotmack/claude-mem：109,296／5,852
5. cloudflare/security-audit-skill：56,385／10,069
6. obra/superpowers：310,638／5,896
7. JetBrains/thinkrail：6,971／5,760
8. pingdotgg/t3code：38,020／6,926
9. multica-ai/andrej-karpathy-skills：227,997／4,459
10. jakubkrehel/skills：10,083／1,607

保留官方排列，不依任一 stars 欄位重排。封面總星數依一位小數 k 四捨五入並移除 .0；正文整數是同快照。

## 來源與段落對應

每個排名段的來源均為該 repo 官方 main README、可取得 LICENSE、Releases；精確連結保留在正式文章。研究查核時間 2026-11-02 09:04 +08:00，已讀全文而非搜尋摘要。

- Hallmark：README 的 Floor/Reflex/Finish、首屏/瀏覽器/reviewer 流程；MIT LICENSE；release 列表為空，v2 僅文件敘述。照片授權另計。
- Impeccable：README 的共用設計上下文、CLI/CI、hooks 邊界；Apache-2.0；skill-v4.8.0 與 engine-v0.1.18（10/26）不混用。
- Claude SEO：README 的多agent/headless、Google API 缺少時的推論、資料送 Claude；MIT 主程式但 FLOW prompts CC BY 4.0；v2.5.0（10/22）。
- Claude-Mem：README hooks/SQLite/向量搜尋/同步；目前 LICENSE Apache-2.0，不能沿用舊 AGPL。v15.8.0 同步變更；v15.8.1 僅 repo 清理，不是 runtime 功能更新。
- Security audit：README 六階段、獨立驗證、confirmed/needs_validation/rejected、沙箱執行條件；MIT；無 release。
- Superpowers：README 工作樹/TDD/雙階段審查；MIT；v7.0.1（10/21）提問與參考文件拆分。未引用文件內尚未同步的細粒度任務舊要求。
- ThinkRail：README pi/worktree/SPEC.md/架構/privacy；Apache-2.0；v0.3.1 發布於 11/1 23:56 UTC，即台北 11/2 07:56。--no-analytics 不能擴大解釋為所有回報停用。
- T3 Code：README 七種供應端與早期限制；MIT；v0.1.6（10/31）stable 與 v0.1.7-nightly.20261101.4048（11/1）prerelease 分開。已修復問題只作回歸案例。
- Karpathy skills：README/CLAUDE.md，非 Karpathy 官方。README 說 MIT、根目錄無 LICENSE，授權全文未核，不猜連結。舊 forrestchang 安裝路徑未推薦。無 release。
- Jakub skills：README 技能與 WCAG 2.2 目標；MIT；無 release。未聲稱通過合規。

作者的適用情境、試用案例和優先讀兩項為工程建議。十個工具均未安裝或跑效能/安全實測，已在正式文集中揭露。

## 封面

參考鄰近 programming-foundations-reading-path 的實物木製路徑/綠色景深封面，本篇改為文字資訊圖，雙欄編輯排版、象牙白/黑/鈷藍，構圖/媒材/配色均不同。正式圖片工具先生成一張，再調整中央安全區以適配列表裁切，非第三方圖，無品牌 logo。

封面左 1–5、右 6–10，名稱/順序/k 值逐項與快照核對，圖中文字正確。WebP 1600×900；全尺寸及16:9卡片、4:3與1:1中心裁切已目視；十項名稱與星數保留於中央安全區，窄列表縮圖用於辨識主題，正文提供可讀文字。轉檔僅縮放與WebP壓縮，未以程式修改生成文字。`coverAlt`描述資訊。

## 發布驗收

本機預覽：dev server 退出未 ready，瀏覽器連線拒絕，未完成本機桌機與手機整頁目視，不以此阻擋其餘必要驗收。所有必要技術檢查針對最後檔案執行，提交與精確 main 部署及正式頁面驗證另存發布收據，不以研究完成視為上線。
