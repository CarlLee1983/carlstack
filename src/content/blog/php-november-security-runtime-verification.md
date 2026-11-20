---
title: "PHP 8.2 到 8.5 的安全更新"
description: "PHP 發布 8.2.36、8.3.37、8.4.28 與 8.5.13。整理本次重要漏洞的適用條件，以及 PHP-FPM、CLI 與發行版回補套件的更新確認方式。"
publishDate: 2026-11-20T10:03:41+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 開源專案
  - 軟體品質
cover: ../../assets/covers/php-november-security-runtime-verification.webp
coverAlt: "透明靛藍測試機架裝了三個黑色模組，右側留一個空槽，前方放著黃色探棒。"
repositoryUrl: https://github.com/php/php-src
---

PHP 在 2026 年 11 月 19 日發布四個安全更新版本：**8.2.36、8.3.37、8.4.28 與 8.5.13**。仍使用這四條分支的服務，應安排更新到對應修補版；這次修補不需要和跨分支升級綁在同一張工單。[PHP 官方發布公告](https://www.php.net/archive/2026.php)

本次有 Critical 等級漏洞，但不能把公告讀成「所有 PHP 網站都能直接遭到遠端入侵」。PHP 的預告已說明，Critical 項目涉及非預設設定或少見部署。判斷個別服務的風險，必須對照該漏洞的執行模式、設定與程式行為。[官方安全更新預告](https://www.php.net/archive/2026.php#2026-11-18-1)

本文核對至 11 月 20 日的官方資料，只整理防禦與部署檢查；沒有重現漏洞或測試任何實際服務。先前的 [10 月 PHP 安全更新](/blog/php2shell-request-lifecycle-patching/)處理另一批公告，不能用當時的修補版本結束本次檢查。

## 四項容易判斷錯誤的適用條件

這裡挑出會影響部署判斷的四項問題，並非本次全部修正清單。其他項目仍應以各分支的 [PHP ChangeLog](https://www.php.net/ChangeLog-8.php)為準。

### PHP 8.5 的 magic method backtrace

**CVE-2026-129474** 影響 8.5.0 至 8.5.12，修補版是 8.5.13。官方描述的方法涉及 `__call()`／`__callStatic()` 與錯誤回溯；已展示的遠端攻擊需要同時開啟 `fatal_error_backtraces`，並讓 `zend.exception_ignore_args=0`。

不要只寫「預設安全」或「預設受影響」。PHP 8.5 內建預設會啟用 fatal error backtrace，並包含引數；隨附的 `php.ini-production` 則把 `zend.exception_ignore_args` 設為 `1`，阻斷公告展示的這條攻擊路徑。應查看服務生效的值，而非假設部署時使用了哪一份範本。[官方 advisory](https://github.com/php/php-src/security/advisories/GHSA-8mjj-2r7p-4hg2)

### 時區快取與啟動時的錯誤紀錄

**CVE-2026-129496** 涉及時區快取的已釋放記憶體存取。影響取決於啟動診斷、worker 初始化與 PHP 檔案型 `error_log` 的設定。FPM 自己的錯誤日誌，不等於符合 PHP 檔案型錯誤紀錄這個條件。

公告記載 FPM worker 的遠端崩潰結果，也區分了額外假設下的本機程式碼執行驗證。因此，不能把研究中的程式碼執行結果說成所有預設部署皆可遠端利用。四條分支的修補版就是本文開頭列出的版本。[官方 advisory](https://github.com/php/php-src/security/advisories/GHSA-gr4f-wgx5-jpfv)

### PHP-CGI 不等於 PHP-FPM

**CVE-2026-129538** 涉及 `php-cgi` 的路徑資訊修正，適用於 CGI 或 FastCGI 模式，並要求 `cgi.fix_pathinfo=1` 及特定、不一致的 Web server 路徑對應。只有啟用 URL rewrite 或 FastCGI，還不足以判定這個漏洞可被觸發。

官方明確排除 PHP-FPM 與 Apache module。看到 Nginx 設定裡的 `fastcgi_pass`，不能就把後端歸類成受影響的 `php-cgi`；要查它連到哪個程序。這項漏洞也在四個安全版本中修補。[官方 advisory](https://github.com/php/php-src/security/advisories/GHSA-5j3f-64r7-f564)

### FPM epoll 是本機權限提升問題

**CVE-2026-129291** 需要攻擊者已能在低權限 FPM worker 內執行程式碼，且使用 epoll、啟用 `catch_workers_output`，並具備公告列出的程序操作條件。它可能把權限提升到 FPM master 的身分，不能改寫成「送一個匿名 HTTP 請求就取得 root」。

若 master 在容器內以 root 執行，取得的是該 master 的容器權限；這本身不代表已逃出容器。官方指出 PHP-FPM Docker 映像常啟用 worker output capture，因此也不能直接套用一般 FPM 的預設關閉值來排除風險。[官方 advisory](https://github.com/php/php-src/security/advisories/GHSA-jm4m-qfqx-967m)

## 更新後，要查承接請求的 PHP

在主機上執行 `php -v`，只能確認該命令找到的 CLI。Web server 可能連到另一個 FPM pool、另一版 PHP 套件，或另一個容器。PHP 官方列出的 SAPI 名稱也把 `cli`、`cgi-fcgi`、`fpm-fcgi` 與 `apache2handler` 分開。[SAPI 說明](https://www.php.net/manual/en/function.php-sapi-name.php)

建議把部署檢查分成兩份紀錄：

1. **執行檔與套件。** 記下更新後的完整套件版本或映像 digest，確認 Web server upstream、FPM pool 與實際程序的對應。另列 CLI、排程及長時間執行的 queue worker，不要把它們當成同一個程序。
2. **實際 HTTP 請求。** 經由受控的內部診斷或應用日誌，記下服務的 PHP 版本、`PHP_SAPI`、載入的設定檔，以及需要對照的生效設定。用節點或容器識別資訊，把結果對回部署清單。

`php_ini_loaded_file()` 可以確認主設定檔路徑，但還要留意額外載入的 `.ini` 與服務端覆寫。PHP 會依 SAPI 和設定搜尋路徑載入檔案，CLI 讀到的設定不能替 Web worker 作證。[設定檔載入規則](https://www.php.net/manual/en/configuration.file.php)、[主設定檔查詢](https://www.php.net/manual/en/function.php-ini-loaded-file.php)

不要為了驗收把 `phpinfo()` 公開到網際網路。診斷應限制存取、避免寫入機密，確認完就移除。負載平衡器後方若有多個副本，一次正常回應也不能代表所有副本都更新了。

## 發行版回補要看完整套件版本

自行編譯或直接採用上游版本，可以比對本文列出的修補版。使用作業系統維護的 PHP 套件時，則要查該發行版對應 CVE 的安全公告、產品版本及完整套件版號。

發行版可能把修正回補到較舊版本，保留原有的上游版本字串。Red Hat 的官方說明便以 PHP 示範這種維護方式。因此，不能只因版號小於 8.2.36 就斷定某個發行版套件尚未修補；也不能反過來假設供應商一定已經回補。[Red Hat 安全修正回補說明](https://access.redhat.com/security/updates/backporting)

本文沒有確認每一家發行版已釋出這批修正。更新紀錄應附上實際採用的供應商公告與套件版本；找不到對應紀錄時，保留「待確認」狀態。

## 工單什麼時候能關閉

套件裝完後，依部署方式替換或重新啟動承接流量的程序，確認舊 worker 已退出、新副本使用預期的執行檔與設定，再做登入、session、上傳及主要 API 的正常回歸測試。這些是部署建議，測試成功不等於已證明漏洞無法觸發。

每個承接流量的 PHP 實例，都應能對應到已修補的上游版本或供應商套件；舊程序已退場，應用的正常流程也通過檢查，才算完成這次更新。CLI 顯示新版本只是其中一筆紀錄。
