---
title: "PHP 10 月安全更新：驗收 Web worker，並檢查 session handler 切換"
description: "PHP 10 月 21 日修補兩項 RCE，23 日另公告特定 session handler 切換條件下的 CVE-2026-115560。分開確認修補版本、upload progress 設定與承接 HTTP 流量的 worker。"
publishDate: 2026-10-22T10:02:20+08:00
updatedDate: 2026-10-24T10:06:31+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 開源專案
  - 軟體品質
cover: ../../assets/covers/php2shell-request-lifecycle-patching.webp
coverAlt: "紙雕門鎖的剖面露出多組齒輪與維修人員，珊瑚色外把手與內部機構分開，呈現修補必須驗收到實際運作的 worker。"
repositoryUrl: https://github.com/php/php-src
---

PHP 在 [2026 年 10 月 21 日安全公告](https://www.php.net/archive/2026.php#2026-10-21-1)正式發布 8.5.12、8.4.27、8.3.36 與 8.2.35，修補 CVE-2026-109618 與 CVE-2026-109619。兩項問題可能造成未經驗證的遠端程式碼執行，官方要求立即更新。這四個版本對應的是這兩項漏洞的修補。

修補工單必須驗收到承接 HTTP 請求的 PHP worker。只有套件安裝紀錄、CLI 的 `php -v`，或「已限制上傳大小」，都缺少服務實際執行狀態的證據。

> [!NOTE]
> 10 月 22 日核對 PHP 官方公告與兩份技術 advisory，24 日補查 23 日的 session upload progress 公告。未重現漏洞、稽核實際服務或執行應用回歸測試。以下部署紀錄與驗收流程是工程建議。公告中的「已驗證利用」指研究結果，這次查核沒有據此確認在野攻擊。

## 10 月 23 日新增的 session handler 切換條件

PHP 另以 CVE-2026-115560 追蹤一條狹窄 RCE 路徑。依[10 月 23 日官方說明](https://www.php.net/archive/2026.php#2026-10-23-1)，必須同時符合以下條件：

- 設定中的 `session.serialize_handler` 是 `php_binary` 或 `php_serialize`。
- 應用在執行時以 `ini_set()` 改成 `php`，之後呼叫 `session_start()`。
- `session.upload_progress.enabled` 仍開啟。

官方建議先設 `session.upload_progress.enabled=0`，保持到下次正常 bugfix 發布。先前已停用者維持設定即可，從不在執行時更換 handler 的應用則可保留功能。完整 advisory 預定隨下次發布公布，目前這則說明未列出新 CVE 的完整受影響與修補版本，不能將前述四個版本當作它已修好的證據。

我會在原有修補工單追加一項程式檢查：搜尋 bootstrap、session 初始化與相容層中對 `session.serialize_handler` 的修改，核對設定載入後到 `session_start()` 之前的實際順序。只有設定檔的快照，可能看不到程式在執行時做的切換。需要停用 upload progress 時，沿用下方請求解析前套用設定、替換 worker 與回歸測試的驗收方式，並記下等待完整公告的負責人。

## 兩項漏洞要分開判讀 FPM 的條件

### OOM 會讓清理程序讀到未完成的狀態

[CVE-2026-109618 技術公告](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)指出，記憶體不足時的 `longjmp()` 可能跳過必要處理，使 request shutdown 讀到尚未初始化完成的資料。mod_php 的已驗證路徑可在應用程式開始執行前觸發。這份公告對 FPM 的判斷來自原始碼分析，尚未展示該項漏洞的完整 FPM exploit。

這解釋了為何把應用的登入驗證列為緩解措施會漏掉風險：若觸發點在 framework 接手之前，路由 middleware 根本沒有執行機會。我會先盤點服務的 SAPI、前端伺服器與部署包，再決定驗收在哪一層取證。

### 另一條路徑會跨越同一 worker 的兩次請求

[CVE-2026-109619 技術公告](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)描述 request 記憶體釋放後，worker 的全域欄位仍保留指向舊狀態的參照。下一個請求若在正常初始化前使用它，便可能造成 use-after-free。這份公告已驗證 mod_php 與 FPM 的 session lifecycle RCE。FPM 的已驗證路徑依賴應用操作在成功 startup 後留下狀態、遭 fatal error 中斷，再由後續請求的 upload progress 讀取。

因此「FPM 尚未展示 exploit」只能用在前一項 OOM 公告的特定結論，不能拿來替整組漏洞背書。兩份公告的驗證範圍不同，也都不代表每個部署的可利用條件完全相同。

對維運更直接的影響是：增加 worker 數量或縮短回收週期可能降低單次請求利用成功率，但不能消除漏洞條件或代替修補，不能據此結案。結案應回到含完整修補的 runtime，而不是猜測攻擊請求有多難碰到同一個行程。

## 更新證據應跟著流量走到每一個 pool

PHP 官方將所有提供 Web 請求的安裝列入風險範圍，並提醒發行版與 LTS 供應商可能提供回補。PHP 8.1 與更舊版本已不再由 PHP 專案提供一般更新，應向供應商確認回補或升級至受支援版本。[官方安全公告](https://www.php.net/archive/2026.php#2026-10-21-1)

實作上，我建議每個服務留下以下四組紀錄，而不是只存一張終端機截圖：

- 部署來源：上游版本，或發行版完整套件修訂號與對應安全公告。採回補時，用供應商明確列出的 CVE 修補證據判斷，不自行只比上游字串。
- 流量落點：網域、後端實例、SAPI、FPM pool 或 Apache 服務的對應關係，包含低流量的管理介面與背景入口。
- 啟用證據：新映像或套件已部署、舊 worker 已退出，並記錄重啟或替換時間。如何讀取以現有平台的受控診斷與行程管理方式為準。
- 應用驗收：正常登入、session、上傳及錯誤頁仍符合預期。只測存在的功能，不為了湊清單新增不必要入口。

`php -v` 可以作為 CLI 盤點的起點。它的輸出若沒有對應到承接流量的 pool，就仍有待補證據。也不要為這次查核把 `phpinfo()` 公開到網際網路，讓完整設定成為另一個資訊外洩面。

建議停止規則是：**任何仍承接流量的實例，若無法對應到修補來源與新 worker 啟用證據，該服務就維持未驗收。** 後續動作可以是補取證據、替換實例，或在授權變更下停止該入口，不能由其他節點的成功結果代填。

## 暫時配置必須同時評估容量與功能代價

OOM 公告給無法立即升級的安裝一項反直覺措施：以管理設定強制 `memory_limit=-1`，移除可預期的 PHP 每請求 OOM 觸發點。但底層配置記憶體失敗仍可能走到漏洞路徑，這不是完整修補。公告也明確警告不要以 `RLIMIT_AS` 或 `RLIMIT_DATA` 替代，因為它們可能製造該類配置失敗。[OOM 公告的 Mitigation](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)

這不適合變成一段直接貼到所有正式服務的設定。移除單一請求記憶體上限後，團隊要重新評估同機其他 worker 的容量與失敗範圍。若沒有可觀察的容量邊界與變更負責人，我會優先安排緊急升級或受控縮小暴露面，不把這項暫緩措施當作免費的安全增強。

跨請求狀態公告則提供兩個有限措施：停用 `session.upload_progress.enabled`，以及 PHP 8.5 停用 `fatal_error_backtraces`，並重啟所有 worker。這些設定必須由請求解析前生效的 php.ini、pool 或伺服器設定套用，不能依賴應用程式內的 `ini_set()` 或 FPM `.user.ini`。它們分別切斷已確認的特定路徑，沒有涵蓋所有狀態生命週期問題。關閉錯誤顯示也無法阻止初始化期間使用舊狀態。[狀態生命週期公告的 Mitigation](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)

若必須暫緩，變更單應另列到期時間、後續升級窗口與相容性檢查。依賴上傳進度的介面要確認功能退化是否可接受。設定成功套用與應用仍能使用，是兩個都要驗收的結果。

## 今天可以把修補單改成可接手的紀錄

這次與先前的 [Django 安全更新驗收](/blog/django-october-security-patch-regression/)都需要把版本變更連到實際入口。PHP 多了一個必須明確寫出的邊界：請求的初始化、異常退出與 worker 重用。

今天可先挑一個對外 PHP 服務，把「安裝版本」、「供應商修補證據」、「流量對應的 worker 已替換」、「正常流程已驗收」分開記錄。若只能確定前兩項，就保留後兩項的負責人與下一步。這樣下一班接手時，能直接知道還缺哪個證據，而不必重新解讀一句「已更新」。
