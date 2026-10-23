# 形式證明範圍與部署產物查核

- 查核：2026-10-23 Asia/Taipei。起始 main `d8c7bbebe704cba489438484ff04fe257948fede`。
- 主來源／正規化 URL：https://www.anthropic.com/research/formal-verification ，發布2026-10-22。署名 Anthropic Frontier Red Team、Theorem 合作。穩定識別 slug `formal-verification`。
- 先搜尋 blog、research、queue 的完整 URL、slug、formal verification、形式驗證、Theorem／Rocq／239／123。沒有相同來源；poteto trust investment 僅列形式驗證為選項，新稿的讀者收穫為 binary/statement/model 身分與公開命題範圍，已內鏈。
- 未完成掃描：queue只有 multi-region/Raft，既有四篇 draft 是 prompt 系列，無待續新聞。main最新內容為今日systemdesign13，與新聞額度分開。
- 系列：AI Agent 工程化與工作流實戰，既有最高95，新稿96。

## 來源對照

1. Anthropic全文：研究239入口／123libraries／約180M行Rocq；<64MB、單執行緒、固定記憶體、static RISC-V Linux/musl範圍；Claude修補後重建規格與reward hacking審查。文章僅摘要必要結果，未使用模型成本比較或未公開漏洞資訊。
2. https://github.com/theorem-labs/oss-verify-proofs ：HEAD `8f5f46768858af236a4270f9628e6beed9aa0e72`，2026-10-23取樣。完整README已讀。公開集合60入口／25libraries與研究總數分開；README What a proof does not say明示發布證明沒有halts，因此不排除nontermination。本文優先用具體公開artifact定義，不把研究摘要的always exit normally當公開證明保證。proofs/provenance、statements、binary hashes與checking方法有文件依據。
3. https://github.com/theorem-labs/rocq-linux-process-semantics ：公告連結已讀README，確認Linux process formal model本身有假設與範圍，未聲稱模型與所有production Linux一致。

## 寫作與範圍

未重跑proof checker、未重建研究binary、未在讀者環境測試。YAML為團隊自訂示意範本，明示不是官方可執行設定。停止規則、production-gap審查、保留resource limit與patch行為驗收是作者建議。沒有發出CVE或安全認證結論。不存在Mermaid或新圖解。

## Cover Direction 與驗收

生成前目視相鄰PHP封面（紙雕機械門、藍橘、近側構圖）及GitLab封面（木刻多捲軸、海軍藍赭紅、夕陽）。本稿：有限玻璃範圍與外部延續分枝；棚拍雕塑；低斜角中央單一主體；珍珠白淡紫深梅；柔和冷光。下一篇Skills以gouache、俯視書桌、綠赭暖光區別至少三欄。

內建imagegen原創，非CLI。原檔`generated_images/exec-c7013784-ac62-4433-8921-333049ac1bec.png`；正式 `src/assets/covers/formal-verification-proof-scope.webp`，1672×941 RGB。全尺寸及360×203卡片目視通過，無可讀文字/logo，盒外分枝清楚，coverAlt按實際像素寫。

Prompt: Wide landscape editorial studio sculpture photograph of a precisely bounded translucent glass specimen chamber enclosing part of a white ceramic branching structure, with continuation branches outside unexamined. Low oblique central composition, thumbnail safe crop. Pearl white, pale lilac, plum, cool diffuse studio light. No text/numbers/logos/UI/circuits/people. Symbolic art, not a technical diagram.

## 本批發布前驗收

2026-10-23 10:20台北完成：pnpm12.1.0 frozen install；僅本批Markdown Prettier write、目標stage後content:policy -- HEAD（3篇）；完整pnpm check（Astro 0errors/0warnings/0hints與production build）；pnpm test117/117；最終pnpm build。SITE_URL為正式域名。Astro telemetry預設設定目錄不可寫，改用process-local ASTRO_TELEMETRY_DISABLED=1及workspace XDG，未修改追蹤設定或關閉品質gate。

獨立解析最終dist確認三篇各單一h1、正確canonical、cover及本地資產、內鏈、blog list、RSS、sitemap、series與Pagefind fragment。GitHub文內fragment經cloud browser核對為真實permalink；Anthropic腳註鏈改回官方canonical避免猜anchor。

完整與卡片封面已目視。Local dev在ready前退出，cloud browser localhost連線拒絕，未繞過限制；發布前desktop/mobile/light/dark文章預覽未完成。發布授權允許此環境preview限制不阻擋，其餘來源與技術gate均完成；部署後另驗證正式內容。這些是preview限制，不宣稱未檢視的版面通過。

工作時序（台北）：10:03開始查main/rules/dedup，10:06確認兩新一更新，10:08封面完成，10:12完整稿與編輯審閱，10:20全站gates通過。未推估計費或使用者credits。
