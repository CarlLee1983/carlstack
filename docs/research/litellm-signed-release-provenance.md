# LiteLLM 1.107.0 污染事件查核

- 查核日期：2026-10-22（台北）。正式文章：`src/content/blog/litellm-signed-release-provenance.md`。
- 主來源／正規化 URL： https://docs.litellm.ai/blog/security-incident-oct-21-2026 （無追蹤參數）。來源署名 Krrish Dholakia、Ishaan Jaffer、Oliver Jensen、Nate Armstrong。原文發布 2026-10-21，所見最後更新 20:30 UTC。
- 穩定 ID：LiteLLM 1.107.0、GitHub Issue 47826；官方 source tag 與污染 binary artifact 分開處理。
- 去重：父任務於最新 main 588fd59 搜尋 blog、research、queue，LiteLLM/URL/版本無既有項目；另閱 pnpm OIDC audience 與 GitHub Actions lockfile 文章，讀者收穫不同。
- 系列判斷：現有主題系列未對應事件應變與供應鏈復原的連續教學，不硬納入 AI Agent 系列，不新建單篇系列。

## 來源與事實邊界

1. https://docs.litellm.ai/blog/security-incident-oct-21-2026 ：確認受影響版本、各 registry 時間窗、source tag 乾淨、官方建置簽署發布的污染 artifact。台北換算 UTC+8，PyPI19:39–21:23；Docker Hub19:46–22:20。GHCR 下架時間另列，文章未混成同一時間窗。
2. https://github.com/BerriAI/litellm/issues/47826 ：Upwind 通報團隊的靜態解碼與更新，檔案、啟動機制、竊取範圍、marker 限制與乾淨重建建議。未下載或執行 payload，未重現。
3. https://docs.python.org/3.14/library/site.html ：.pth import 行與 sitecustomize 的啟動處理；刻意使用3.14文件，避免未標版本的目前文件3.15新行為混淆。
4. https://slsa.dev/spec/v1.2/verifying-artifacts ：subject digest、builder與預期來源／參數驗證。用於工程建議，不宣稱 LiteLLM 已符合某 SLSA 等級或可由某單一工具必然阻擋。

官方對 Claude Code 回應／log token 暴露的觀察，與攻擊者如何進入內部部署的推測，均保留初步狀態。未寫成 Anthropic 漏洞定論、所有部署皆洩漏或所有過去版本永久安全。

## 編輯與驗收

- 作者未執行惡意套件、重現攻擊或檢查讀者環境；集中在開頭交代。
- 隔離、取證、乾淨環境輪替與發布契約的順序，為作者建議。
- 封面由發布任務另行生成與視覺驗收，coverAlt 須按實際畫面更新。
- 草稿沒有 Markdown 表格、Mermaid 或 SVG。
- 發布 gate、封面、正式網址與部署驗證由發布主代理接續；本子任務不提交或推送。

## 封面驗收

使用內建 imagegen 原創生成，來源 `generated_images/exec-6c187584-ae9e-4763-adaa-6094a7a6f39f.png`，正式 WebP 1672×941。視覺方向為寫實棚拍、側面非對稱構圖、白／酸黃／炭黑、硬午光；提示詞指定污染包裹隔離箱與獨立乾淨托盤的新鑰匙、白包裝，禁止文字／logo／UI。已檢視完整像素及360×203卡片裁切，coverAlt已按實際畫面替換。

## Preview environment limitation

Local Chromium launch failed before page rendering: `process_singleton_posix.cc` socket operation not permitted (2026-10-22). No flag/security bypass attempted. Full/card cover pixels were inspected. Local desktop/mobile/light/dark article preview remains unverified; publication is authorized despite this environmental preview limitation, with all source and technical gates still required. Production verification follows deployment.
