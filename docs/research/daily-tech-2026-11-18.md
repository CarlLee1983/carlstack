# 2026-11-18 CarlStack 查核紀錄

基準 main：f6ffc5ab75ca64af6ff7cba13e204aab878e1fe9。工作區乾淨，已 fetch origin main；現有四篇 Claude Prompt Engineering 草稿優先查核。

鎖定安裝：npx --yes pnpm@12.1.0 install --frozen-lockfile 通過；預設 pnpm 11.25.0 不符 engines，未修改設定。

## 封面方向（正式 imagegen）

三張共用 16:9 橫幅及少量朱紅色。任務契約：俯視攝影、奶油白紙張與朱紅封條、明亮側光；模板：側視絲網印刷拼貼、海軍藍與琥珀色分層印版、平光；證據：近距離石版畫、墨綠與銀灰透明檢視片、聚焦冷光。三者在媒材、構圖、主色、光線均不同。最近封面 clice 為藍灰色立體工作艙；GitHub 週榜為紫色紙面文字。不得有文字、商標或把封面當技術圖解。

trail CLI 與 .trail/cache 均不存在，依原始檔查核；未建置或改動索引。既有 4 篇草稿先處理系列 1–3，第 4 篇留待後續查核，不修改系統設計文章。

## 完成本批的來源與取捨

續作而非另建 URL：claude-prompt-as-task-contract（系列1）、maintainable-prompt-templates（系列2）、reduce-ai-hallucinations-with-evidence（系列3）。同一教材但讀者收穫分別為任務定義、模板維護、證據充分性，彼此互鏈；第4篇 from-prompt-to-ai-workflow 維持原狀。三篇此前 draft:true，未正式發布，故改為實際首次發布時間，不保留草稿占位日期 2026-08-31。沒有變更既有正式文 publishDate 或排序程式。

一手查核（2026-11-18）：

- https://github.com/anthropics/prompt-eng-interactive-tutorial ，實際讀取 Anthropic 1P 章節1、2、3、4、5、7、8的 notebook JSON。README仍以Claude 3 Haiku為教材背景。
- https://platform.claude.com/docs/en/api/messages/create ：頂層 system 為合法欄位；新版列出 SystemMessageParam，刪除草稿「絕無 system role」的過度概括。範例保留頂層 system，不宣稱付費呼叫實測。
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices ：查核XML、few-shot、4.6起最末assistant prefill不支援及400錯誤；舊模型與其他歷史assistant message不在此限制。
- https://platform.claude.com/docs/en/build-with-claude/citations 及 https://platform.claude.com/docs/en/build-with-claude/structured-outputs ：citations與output_config.format不能並用，回傳400。
- https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations ：允許不知道、先取直接引文；方法不消除所有幻覺。
- https://platform.claude.com/docs/en/test-and-evaluate/develop-tests ：先訂可量測成功條件。
- https://github.com/anthropics/prompt-eng-interactive-tutorial/issues/48 ：讀者對混合變因的質疑，明確標為社群評論，不冒稱官方研究或因果結論。

去AI檢查已執行並人工判讀：類別「代碼」非程式碼，不誤改；提示性冒號用於具體案例可保留；刪除二元對比空殼及「數據」。全文無模型效果實測，三個few-shot數量是編排、合成年份資料是測試假設。

## 近24小時公開資料研究

TWCERT/CC已讀TVN、漏洞警示、資安新聞列表，未把活動日期或頁尾更新日期當事件日期：https://www.twcert.org.tw/tw/lp-132-1.html 、 https://www.twcert.org.tw/tw/lp-168-1.html 、 https://www.twcert.org.tw/tw/lp-104-1.html 。主管機關頁面 https://moda.gov.tw/ACS/ 已查，最新月曆公告不當漏洞題材；NICS週報 https://www.nics.nat.gov.tw/core_business/information_security_information_sharing/Vulnerability_Alerts/0a2324d0-0c4d-4081-8b9d-ef25fdf63feb/ 正文工具僅回Loading，不能以摘要代替全文。CISA官網與JSON feed皆403，不採第三方鏡像作在野利用證據。

GitHub 11/17新公告已讀正文，不與舊文章混寫：

- MDASH：https://github.blog/open-source/maintainers/maintainers-dont-need-more-ai-bug-reports-they-need-fixes/ ，Ashley Wolf、Gregg Cochran。數千候選經AI篩選與研究員人工查核後99份私密報告；截至11/15修正55、已發布14。這是試點結果，不等於掃描工具全自動正確率。
- AHP：https://github.blog/engineering/engineering-principles/building-the-agent-host-protocol-for-sessions-that-continue-across-devices/ ，Connor Peet、Rob Lourens。獨立版本協定、root/session/chat channel、server仲裁狀態，重連需等reconcile與ack，不把重新顯示歷史當工具副作用恰好一次。尚未另寫正式稿。

## 新收到的優先資安題材

已以CVE、URL、Java4Shell、Confluence、N-central查重，無命中；以下是可續作研究，未計為完成文章。

Java4Shell：已讀 https://calif.io/java4shell （帶尾斜線才成功開啟）與 https://www.oracle.com/security-alerts/cspunov2026.html 。CVE-2026-114938是OpenJDK Base64最佳化路徑的記憶體破壞；研究者展示產品利用鏈不等於在野攻擊。Oracle Java SE矩陣「Supported Versions Affected」列的是受影響版本，不能當修補版。Calif採CVSS4.0 9.2，Oracle採CVSS3.1 8.1，不混用評分標準。Calif明列需x86-64 AVX-512 VBMI，ARM64不適用；可用-XX:-UseBASE64Intrinsics停用最佳化，或僅在x86-64用-XX:UseAVX=2，ARM不接受後者可能啟動失敗。其所連OpenJDK 2026-11-17 advisory回403。正式成稿前仍須逐供應商確認固定版本及恢復部署驗證；不執行PoC或掃描服務。

Confluence：已讀 https://www.rapid7.com/blog/post/etr-rapid7-detected-exploitation-of-cve-2026-90436-against-atlassian-confluence-data-center-n-able-n-central-also-exploited/ 與 https://confluence.atlassian.com/security/cve-2026-90436-remote-code-execution-in-confluence-data-center-and-server-1874560038.html 。CVE-2026-90436是Axis 1.x舊API問題。11/17文章新增MDR入侵觀察，事件發生11/13，不稱11/17才開始攻擊。Confluence 1–9.x需啟用Remote API(XML-RPC & SOAP)才適用；固定版本9.2.28、10.x移除功能、Cloud不受影響。HTTP500並不表示利用失敗；需串連Java子行程與憑證使用調查。N-central需另依N-able公告，不能把Confluence修補方式套用過去。正式稿仍應核對Apache原始公告與N-able指引，並準備適用封面。

## 封面實際交付

新imagegen生成三張16:9概念圖，但輸出為大型data URI，大型write_stdin傳輸被工具以「terminal input and permission details are too large to review safely」拒絕，無檔案寫入，已停止該傳輸。替代使用本來與三篇草稿一起存在的原創封面：PNG皆有OpenAI/C2PA metadata，逐張全尺寸目視後，以sharp轉同構圖1536×1024 WebP，不刪PNG。新生成圖未交付、未冒稱保存；實際版本為紙片與紅線、黏土模組、研究桌放大鏡。WebP依序約329/56/78KiB。沒有新增SVG圖解。

## 發布前驗收結果

- 鎖定安裝、全repo pnpm format 完成，僅stage本批7檔，無無關格式變更。
- pnpm content:policy -- HEAD：3篇通過。
- pnpm check：249檔、0 errors、0 warnings；完整build 806頁，Pagefind索引804頁。
- pnpm test：117/117通過，0 skipped。
- 三篇各自存在RSS、Sitemap、系列頁，seriesOrder為1/2/3；Pagefind gzip fragment逐篇含正式slug，正文帶data-pagefind-body。
- 三張原創封面全尺寸及320×180卡片裁切已目視，構圖可辨，WebP資產存在且frontmatter指向正確。
- 本機dev在ready前退出；改用dist靜態預覽後，Chromium仍因socket() Operation not permitted無法啟動。完整桌面/320px/深淺色頁面目視未驗，未冒稱通過，按本批授權之環境例外不阻發布。
- 再次fetch後origin/main仍為f6ffc5ab75ca64af6ff7cba13e204aab878e1fe9，尚無另一系統設計工作的新增commit。推送必須non-force；若main前進則重新reconcile。
- 另跑最終production build及正式站部署/HTTP驗證，實際結果由交付訊息附精確commit與Actions紀錄，不把本研究紀錄當已上線證明。
