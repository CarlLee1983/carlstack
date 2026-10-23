# Agent Skills AAIF 移交查核

- 查核2026-10-23 Asia/Taipei，起始main `d8c7bbebe704cba489438484ff04fe257948fede`。
- 主來源／正規化URL https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation ，2026-10-22，署名Anthropic。穩定slug同URL。
- 去重在blog/research/queue搜尋URL、slug、AAIF、Agent Skills、donation、治理。無相同來源。既有ai-productivity-skills-portability、agent-skill-installation-contract、agent-skill-adherence-effect-evals分別談可攜性、安裝、效果；本稿專注新治理與版本演進中的採用紀錄，正文內鏈三篇，無複製原文。
- 系列AI Agent 工程化與工作流實戰，97（96為本批formal-verification）。

## 查核

1. 公告全文已讀：name/logo/GitHub org/domain移交；無須加入AAIF也能使用貢獻；跨公司工程師以個人身分維護。versioned releases/formal proposals/security guidance明列proposed roadmap，不能寫成已上線制度。未用70平台／million skills／280M installs宣傳數量，避免導入量與品質混淆。
2. https://agentskills.io/specification 全文已讀：SKILL.md/name/description、可選scripts/references/assets，allowed-tools experimental且因宿主支援不同。https://github.com/agentskills/agentskills HEAD `69ef37e9424c0a7ea9dd2293b559e43ec8176379` 作規格取樣身分，網站仍可變。
3. https://agentskills.io/home 全文已讀：格式與按需載入，不推論為執行權限機制。

不聲稱AAIF安全認證或新lockfile已發布；版本固定、rollback、成功/失敗案例與跨宿主驗收均為作者建議。沒有執行新skill或跨宿主實測，正文集中說明。沒有Markdown table/Mermaid/新圖解。

## Cover Direction 與驗收

相鄰封面已與formal-verification研究記錄共同評估。新稿：共享技術手冊和獨立關閉工具箱；gouache手繪；俯視非對稱書桌；米白森林綠芥黃赭；暖午後光。與formal玻璃棚拍在隱喻、媒材、構圖、主色、光線皆不同。

內建imagegen原創，非CLI。來源`generated_images/exec-bc829483-c2f1-4b52-98a9-72b5092865f7.png`，正式`src/assets/covers/agent-skills-aaif-governance.webp`，1672×941 RGB；完整及360×203卡片目視通過，無可讀文字/logo。圖片有示意零件圖，不當成正文技術流程；coverAlt只描述手冊與工具箱實際關係。

Prompt: Wide landscape original gouache editorial still life, open community technical manual with colored removable tabs on shared round wooden reading table, separate closed dark-green tool case. Overhead asymmetrical book/toolbox composition, warm cream/forest green/mustard/terracotta, warm afternoon window light. Pages only abstract short strokes, no readable text/numbers/logos/UI/people. Symbolic art, not technical diagram.

## 本批發布驗收

與formal-verification-proof-scope同批：frozen install、format、stage後policy、完整check、117tests及最終build通過，dist canonical/h1/cover/內鏈/list/RSS/sitemap/series/Pagefind驗證通過。兩張封面完整及卡片目視，無新SVG圖解。Local dev退出且cloud localhost拒絕，desktop/mobile/light-dark文章preview未完成，未繞過；詳見同批formal研究紀錄。
