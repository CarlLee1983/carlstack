# PHP 2026-11-20 來源與編輯紀錄

## 交付

- 文章：src/content/blog/php-november-security-runtime-verification.md
- 標題：PHP 8.2 到 8.5 的安全更新
- 封面：src/assets/covers/php-november-security-runtime-verification.webp

## main 與去重

2026-11-20 查讀 CarlLee1983/carlstack main，commit `21206de17211d729fd175965381d43f9f7c549ba`，tree `395aa52a12660d187aebb7c5144d7ab6acc4c8f4`。

已讀 AGENTS.md、docs/content-guide.md、src/content.config.ts、.agents/skills/carlstack-copywriting/SKILL.md、.agents/skills/humanize-writing/SKILL.md、references/zh-tw.md，以及 10 月 PHP 文章與研究筆記、近期 NGINX 文章。

已查 main 的完整遞迴檔案樹與 docs/article-queue.md。PHP 同題既有文章是 php2shell-request-lifecycle-patching.md；已讀其全文及研究紀錄。待寫佇列未列 PHP。GitHub connector 搜尋 PHP、CVE-2026-129474、GHSA-gr4f-wgx5-jpfv 皆無結果；因搜尋 PHP 亦漏掉已知舊文，搜尋索引不能視為全庫正文去重證明。

新文理由：11/19 是另一批安全版本及公告；新增讀者價值為逐項區分 PHP 8.5 設定、PHP-CGI 排除 FPM、FPM 本機提權及容器權限邊界。正文交叉連結 10 月文章，沒有以舊公告的已修補版本代替新版本。既有 PHP 文章無 series；本文沿用獨立安全更新文章，不新增或硬塞不相干系列。

以 4 個 CVE、對應 GHSA、官方公告 URL 與主題查詢 main 正文、研究紀錄及佇列。沒有找到同一批安全更新的既有文章。

## 第一手來源

查閱日均為 2026-11-20。正文保留來源連結，無攻擊重現步驟、payload 或攻擊程式。

1. https://www.php.net/archive/2026.php
   11/19 四個正式安全版本與 11/18 預告。另以 https://www.php.net/ 首頁核對 8.2.36、8.3.37、8.4.28、8.5.13。
2. https://www.php.net/ChangeLog-8.php
   已查 Version 8.5.13 節，確認 advisory 列入該安全版。正文四項為選讀，沒有宣稱是全部漏洞。
3. https://github.com/php/php-src/security/advisories/GHSA-8mjj-2r7p-4hg2
   CVE-2026-129474。正文依該 advisory 的 affected/patched versions 與 Summary，保留內建預設和 php.ini-production 的差異。
4. https://github.com/php/php-src/security/advisories/GHSA-gr4f-wgx5-jpfv
   CVE-2026-129496。確認 PHP 檔案型日誌與 FPM 日誌不等同，區分遠端崩潰與額外假設下的本機程式碼執行研究結果。
5. https://github.com/php/php-src/security/advisories/GHSA-5j3f-64r7-f564
   CVE-2026-129538。確認 php-cgi 的 CGI/FastCGI 模式、設定與路徑對應條件；明確排除 FPM／Apache module。
6. https://github.com/php/php-src/security/advisories/GHSA-jm4m-qfqx-967m
   CVE-2026-129291。確認 local worker code execution 前提、epoll、output capture、master 權限，以及容器提權不等於逃逸。未提供利用步驟。
7. https://www.php.net/manual/en/function.php-sapi-name.php
   SAPI 名稱及 PHP_SAPI。
8. https://www.php.net/manual/en/configuration.file.php
   各 SAPI 設定檔搜尋及額外 .ini。
9. https://www.php.net/manual/en/function.php-ini-loaded-file.php
   主設定檔路徑查詢範圍。
10. https://access.redhat.com/security/updates/backporting
    只支持 backport 的一般維護原則，不能證明本次任何發行版已推出補丁。正文已明說未核實每家發行版釋出情況。

## 編輯與驗證範圍

正文部署盤點、受控診斷、逐副本確認、舊程序退出與正常回歸檢查是工程建議，不宣稱已在使用者環境測試，也不把正常回歸當漏洞測試。

未宣稱在野利用。未把研究的所有示範條件推廣成漏洞的一般必要條件。未把 8.6 新功能升級混入本次 8.2 到 8.5 修補工作。

- 正式封面由原創生圖工具產生，再轉 WebP 1440 × 810（91,124 bytes）；已目視全尺寸構圖及 320 × 200 模擬置中裁切。
