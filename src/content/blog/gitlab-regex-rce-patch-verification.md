---
title: "GitLab regex RCE 的調查缺口：崩潰請求不一定留下 Rails 日誌"
description: "GitLab 10 月 21 日修補 CVE-2026-110264。從官方 Onigmo 與 Org-mode 偵測規則，檢查 Rails、Workhorse、Puma 日誌覆蓋，分清修補到位與調查證據不足。"
publishDate: 2026-10-22T10:03:00+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 軟體品質
  - 系統設計
cover: ../../assets/covers/gitlab-regex-rce-patch-verification.webp
coverAlt: "木刻風格的三組記錄機沿紙帶排列，中間滾輪破裂並留下空白段，旁邊備有替換零件，表達程序崩潰造成的觀測缺口。"
---

GitLab 在 [2026 年 10 月 21 日的緊急修補公告](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-5-1-released/)列出 CVE-2026-110264：特製正規表示式引發整數溢位，在特定條件下可能讓未登入使用者於伺服器執行任意程式碼，CVSS 3.1 為 10.0。自管站台需要立即安排更新。[1]

這次還有一個會改變調查方法的細節。GitLab 官方偵測文件指出，讓 worker 崩潰的請求可能來不及寫入 Rails 請求日誌。[2] 只搜尋 `production_json.log` 沒有命中，無法回答那段時間是否出現攻擊嘗試。

查核截至 10 月 22 日台北上午，以官方公告、升級文件與 GitLab Security 的 TLDR 規則為依據。我沒有安裝或升級 GitLab、重現漏洞，也沒有在讀者的日誌管線測試規則。下方的查核順序與交接格式是工程建議，官方規則中的實驗室事件也不代表已確認野外利用。

## 先把新的修補邊界放回資產清單

CVE-2026-110264 的受影響範圍從 CE／EE 7.0 起，對應修補分支為 18.11.13、19.0.10、19.1.9、19.2.9、19.3.6、19.4.3、19.5.1。這些是各分支的修補界線，不能用小數大小跨分支比較。[1]

例如還在 19.3.5 的自管站台，不能沿用上一輪「已修補」的結論。本站先前的 [GitLab 十月修補驗收](/blog/gitlab-critical-patch-ci-trust-boundary/)處理的是 CVE-2026-97229 與 Duo 相關問題，這次需要增加新的 CVE、目標版本與檢查日期，保留舊工單的歷史結果。

GitLab.com 已套用修補。Dedicated 租戶若為 19.3.5-internal0、19.4.2-internal0 或以後版本，官方表示已含修補。[1] 自管資產則應逐項記下安裝方式、目前版本、對應目標、實際承接流量的節點，以及讀取版本的時間。尚未讀到的節點列為待確認，避免未知值被算成完成。

回復策略也應跟目標版本一起審。若升級失敗後回到原版本，原本的漏洞暴露可能一併恢復；回復後的入口限制與再次修補時間，要有明確負責人。

## worker 崩潰會把證據拆到不同日誌

[官方 Org-mode 偵測文件](https://gitlab.com/gitlab-security-oss/tldr/-/raw/main/Detections/platforms/GitLab/Vulnerability%20Detections/org_mode_render_error_burst.md)描述幾種不同結果：render timeout 會進入 `exceptions_json.log`。worker 硬崩潰時，Workhorse 可留下 502，但 Rails 來不及完成請求紀錄。某些執行結果則可能沒有明顯崩潰。[2]

因此我會先確認收集範圍，再解讀搜尋結果。若 SIEM 只有 Rails 日誌，報告應寫「已搜尋 Rails 的指定時間窗」，同時列出 Workhorse 和 Puma 資料是否可取得。把三種來源合成一個「GitLab logs」勾選欄位，接班人很難知道還缺哪一段。

調查可以分開問：

- `exceptions_json.log` 是否保留 `.org` rendering 的 timeout、檔名、呼叫端與用戶端識別？
- Workhorse 是否保留相關路徑的 502，以及能對到節點和時間的紀錄？
- Puma 的 stderr 是否保留完整 native crash report，而非只有「worker 重啟」通知？

這些問題對應不同失敗位置。日誌來源缺席時，優先記錄缺口與保留期限，讓事件負責人決定替代證據；不要把補裝收集器後的新資料，當成事發當時已經具備的歷史覆蓋。

## 多行 crash report 可能在收集時被拆散

[Onigmo native worker crash 規則](https://gitlab.com/gitlab-security-oss/tldr/-/raw/main/Detections/platforms/GitLab/Vulnerability%20Detections/onigmo_native_worker_crash.md)將 `[BUG]` 與 `org-ruby` 或 Onigmo stack frame 組合，作為關聯佐證。規則預期多行 crash report 能被視為同一事件；若收集器逐行送出，條件可能永遠無法在單筆事件同時成立。[3]

這會造成一種容易誤判的狀態：原始檔有資料、SIEM 也有資料，但實際搜尋的事件形狀已經不同。匯入規則後看到「啟用成功」，還沒有驗證多行合併、欄位映射與節點識別。

我建議先在核准的非正式環境，用明確標記的合成事件測試收集路徑。測試要回答原始片段進了哪個 index、規則看到哪些欄位、告警帶出哪個 host／pod，以及值班人能否回到原始資料。這測的是偵測管線，不是漏洞是否可利用。官方文件同樣將 synthetic test 與真實漏洞觸發分開，並警告不要為了驗收告警去渲染惡意 `.org` 檔。[3]

**停止規則：沒有證明事件形狀能命中，就不把「規則已匯入」記為「偵測已驗收」。**

## 關聯用 host 與時間，結論保留證據強度

對崩潰請求，官方建議以 host 與時間連接 native crash 和周邊請求，不能依賴那筆缺席的 Rails `correlation_id`。[3] 在 Kubernetes 環境還應保留 pod 識別與時間對應，避免重啟後的同名服務把兩段不同程序歷史混在一起。

這裡的工程取捨是搜尋範圍。時間窗太窄可能漏掉前後事件，太寬則會混入一般 timeout 與重啟。可以先保留查詢、時區、節點清單與採用窗口的理由，再由調查人員依現場資料擴大。不要用一次命中直接宣稱已成功入侵，也不要用零命中宣稱沒有入侵。

官方 Org-mode 規則提供 timeout burst 的關聯邏輯，並要求依合法文件流量調整基線與欄位。[2] 套用到自己的 SIEM 時，應記錄哪些欄位經過 flatten、哪些來源位址被代理轉換，以及用戶端識別能否跨事件維持一致。這些環境條件會影響查詢是否真的查到同一組活動。

## 修補驗收與調查各留一個結果

正式更新仍須遵循部署型態的程序。[升級前檢查文件](https://docs.gitlab.com/update/plan_your_upgrade/)要求確認必要停靠點、備份與還原計畫，並在升級前後執行健康檢查；[多節點零停機文件](https://docs.gitlab.com/update/zero_downtime/)也對 Linux package、負載平衡與 HA 條件設有限制，不能直接套用到所有拓樸。[4][5]

修補工單可以記錄每個節點的版本、程序更新與功能檢查結果；事件工單則記錄查過的時間窗、來源覆蓋、告警與未確認事項。兩張單共用資產識別並互相連結。即使更新已完成，缺少歷史 Puma 日誌的調查限制仍應保留下來。

今天可立即做的下一步，是從一個仍在受影響版本的自管實例開始：確認修補目標，同時請日誌負責人回報 Rails、Workhorse、Puma 三條來源各自的保留範圍。值班交接時，讓下一個人看見具體缺口，而不是只有「已更新、沒有告警」。

## 來源

1. [GitLab：2026-10-21 緊急修補公告與各分支版本](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-5-1-released/)
2. [GitLab Security TLDR：Org-mode render error burst](https://gitlab.com/gitlab-security-oss/tldr/-/raw/main/Detections/platforms/GitLab/Vulnerability%20Detections/org_mode_render_error_burst.md)
3. [GitLab Security TLDR：Onigmo native worker crash](https://gitlab.com/gitlab-security-oss/tldr/-/raw/main/Detections/platforms/GitLab/Vulnerability%20Detections/onigmo_native_worker_crash.md)
4. [GitLab Docs：Before you upgrade](https://docs.gitlab.com/update/plan_your_upgrade/)
5. [GitLab Docs：Upgrade a multi-node instance with zero downtime](https://docs.gitlab.com/update/zero_downtime/)
