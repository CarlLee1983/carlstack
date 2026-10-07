---
title: "Django 十月安全更新：升級後要驗收的四種邊界"
description: "Django 6.1.2、6.0.9 與 5.2.18 修補四項漏洞。依 HTTP header、GeoDjango bytes、可編輯主鍵 formset 與語系快取拆解適用條件，把升級轉成有證據的回歸驗收。"
publishDate: 2026-10-07T10:11:33+08:00
draft: false
featured: false
tags:
  - API 整合
  - 系統設計
  - 開源專案
series: 現代網路協定與 API 平台架構
seriesOrder: 17
cover: ../../assets/covers/django-october-security-patch-regression.webp
coverAlt: "粉橘水彩中的機械水閘旁放著四個獨立黃銅止擋，表達修補之後仍須逐項檢查不同入口的限制。"
repositoryUrl: https://github.com/django/django
---

升級單寫著「Django 已更新」，卻沒列出受影響的 formset、GIS 查詢與 header 解析路徑，值班工程師很難知道該看哪一組監控。

Django 在 [2026 年 10 月 6 日安全公告](https://www.djangoproject.com/weblog/2026/oct/06/security-releases/)發布 **6.1.2、6.0.9 與 5.2.18**，修補四項漏洞。維護團隊建議儘速升級；公告沒有宣稱已觀察到在野利用，也不能據此推論沒有攻擊。

我會把這次升級拆成四張驗收單。每張寫清楚輸入從哪裡來、會碰到哪個函式、升級後哪個副作用必須消失。版本號是部署證據，後面的檢查才回答自己的服務是否恢復了預期邊界。

> [!NOTE]
> 本文於 2026 年 10 月 7 日核對官方公告、release notes 與修補 diff，未執行 Django 漏洞重現或應用回歸測試。下列案例、停止規則與紀錄格式是作者建議，不是已量測結果；只應在自己有權測試的隔離環境執行。

## Header 修補會改變解析行為，也要保住正常請求

CVE-2026-84429 是 HTTP header 解析的拒絕服務問題，官方評為 moderate。`parse_header_parameters()` 遇到引號內大量分隔符號時有平方級處理成本；`Accept`、`Content-Type` 等入口可能使未登入請求觸及它。單次呼叫的長度限制，不能代表重複 header 合計後的大小也受限。[官方公告](https://www.djangoproject.com/weblog/2026/oct/06/security-releases/)

修補 [7ff7fcc](https://github.com/django/django/commit/7ff7fcc0508864a4bc39693128ace38b1e95a890)改用 Python 的 `email.message.Message`，保留沒有參數時的快速路徑。這項選擇同時帶來相容性問題：某些異常或少見的參數會得到不同解析結果，例如缺少編碼的 RFC 2231 值。直接依賴這個未公開函式的程式尤其需要核對。

我的回歸清單會包含兩類資料：

- 正常路徑：服務實際接受的 content negotiation、multipart 上傳及帶參數媒體型別，核對回應內容與檔案處理結果
- 負面路徑：使用有界的本地測試樣本檢查引號、分隔符號與重複 header，觀察解析耗時；不要拿正式站做高負載重現

此外，反向代理、ASGI／WSGI server 與框架之間如何合併重複 header，也要放進整合測試。我的停止規則是：正常請求改成錯誤格式、或測試 CPU 時間超出事前訂好的預算，就不擴大部署。預算由服務基線決定，本文沒有替所有系統設定通用毫秒數。

## GeoDjango 的顯式包裝，不能替不可信資料背書

CVE-2026-87890 補上先前 CVE-2026-15307 未涵蓋的 bytes 路徑。應用若把攻擊者可控制的 raster bytes 直接交給 spatial lookup，內容可能是引用外部 raster 的 VRT，讓 GDAL 在準備查詢時發出網路請求。問題限定於這條使用方式，不能擴張成「所有使用 Django 的網站都有 SSRF」。[6.1 分支修補](https://github.com/django/django/commit/4e77ef1e69c94780006b82795aa7db101996c3af)

新行為要求 raster bytes 先明確包成 `GDALRaster`；合法十六進位 geometry bytes 仍可接受。官方把這列為不相容變更，也提醒輸入必須經過驗證。[Django 6.1.2 release notes](https://docs.djangoproject.com/en/dev/releases/6.1.2/)

這裡最容易出現一個錯誤修補：遇到型別錯誤，就把所有使用者 bytes 自動包進 `GDALRaster`。如此只是把隱式行為改成顯式呼叫，沒有回答資料是否值得信任。

我的建議是逐一找到 raster 來源：內部產生、受控檔案，或使用者上傳。可信來源的相容性測試確認明確包裝後仍得到正確查詢結果；不可信來源則保留格式、大小及外部資源引用的處理政策。需要出站限制時，另在執行環境落實，不能只靠 Python 型別表達。

負面案例可使用受控測試端點作為外部引用目標，記錄是否出現出站請求。驗收重點是未授權網路副作用為零，而不只是頁面回傳了錯誤。測試端點不應指向第三方服務、內網敏感系統或雲端 metadata。

## Formset 的 queryset，必須一直限制到寫入那一步

CVE-2026-87975 涉及可由表單設定主鍵的 model formset：偽造的 POST 可能刪除限定 queryset 之外的物件，或在 edit-only formset 新增物件。例子包括作為主鍵的 `OneToOneField`、inline formset 的 parent link，以及納入表單欄位的自然主鍵或 UUID。官方明確指出預設 `BigAutoField` 不受這項漏洞影響。[安全公告](https://www.djangoproject.com/weblog/2026/oct/06/security-releases/)

[修補 83cbd21](https://github.com/django/django/commit/83cbd21be57483e6b3eb6e4688a561c841aff75e)揭露了值得記住的失誤：queryset 外的物件可能被建成新 instance，之後主鍵又被表單填入；儲存流程卻把「有主鍵」當成「從允許集合取出」。新檢查加入 `_state.adding`，跳過這類未從 queryset 取得的 instance。

這對業務測試的啟示很具體。假設客服甲只能處理 A 組工單，測試資料應同時包含 A、B 組，而不只建立一筆合法工單：

1. 合法修改 A 組資料仍成功
2. 對 B 組物件送入越界識別值後，該物件仍存在，欄位沒有變動
3. edit-only 流程收到不存在的識別值後，資料筆數沒有增加
4. 若產品另外有新增功能，它仍須走自己的授權入口

這些是本地應用的負面測試設計，不是可直接貼到任意網站的攻擊程式。不要只斷言 HTTP 狀態碼；儲存層的前後差異才是這張驗收單的結果。即使目前所有模型都使用預設主鍵，也要記下排除依據，避免未來新增自然主鍵時沿用過期判斷。

## 語系快取要在保留字串之前限制長度

CVE-2026-77050 的教訓在檢查順序。`get_supported_language_variant()` 已有長度處理，但完整語系碼會先成為 `lru_cache` 的 key；大量不同的長字串仍可能占用過多記憶體。官方評級為 low，修補把拒絕或截短超過 500 字元的輸入移到 cached lookup 之前。[修補 c88b304](https://github.com/django/django/commit/c88b304cc2d90fc37d3bd1f5f3829706fa6c13bc)

`maxsize` 限制 key 的數量，沒有自動限制每個 key 的位元組大小。這個區別也適用於自行實作的快取：若驗證被放在 decorator 包住的函式裡，值得確認 decorator 是否已經保存了原始輸入。

回歸測試應同時涵蓋正常語系 fallback、strict 模式與不同長度的異常值。對這類記憶體問題，我會在固定 worker 數及有限請求量下比較保留記憶體，再確認語系切換功能正常。測試報告要記錄樣本量、Python 與 Django 版本；只看到一次請求被拒絕，不足以說明 cache 沒留下長 key。

## 把四張驗收單放進同一次部署紀錄

選擇自己所在的受支援分支更新：6.1 對應 6.1.2、6.0 對應 6.0.9、5.2 對應 5.2.18。本文列的是這次公告的修補版本，日後執行時仍須核對該分支當時的最新安全版本。不要因這張清單沒有列舊分支，就推論舊版沒有風險。

以下是我建議的紀錄骨架，內容需要由執行升級的人填入；`pending` 刻意保留，避免把規劃寫成通過：

```yaml
# 升級紀錄範本，並非實測輸出
release:
  deployed_django_version: pending
  application_commit: pending
  image_digest: pending
  worker_restart_evidence: pending
checks:
  header_normal_and_negative_cases: pending
  raster_source_and_outbound_policy: pending
  editable_pk_queryset_write_boundary: pending
  language_cache_and_fallback: pending
rollout:
  canary_observation: pending
  owner: pending
  stop_condition: unauthorized_write_or_egress_or_regression
```

容器、背景 worker 與管理工具可能使用不同環境。我會從實際執行程序取得版本證據，再把 lockfile、image digest 與部署批次串起來；不能只在開發機跑一次 `django.get_version()` 就結案。

這次 release 另含 bugfix 與既有 GIS 安全緩解補強，使用相關功能者仍應讀完整 [release notes](https://docs.djangoproject.com/en/dev/releases/6.1.2/)。上面的四張單聚焦安全公告，沒有取代應用原有測試套件。

站內的 [OpenWA 請求目標邊界](/blog/openwa-request-target-boundaries/)談出站前的實際目標核對；[NetScaler 修補與事件調查](/blog/netscaler-cve-2026-88779-saml-kev-remediation/)把更新完成和歷史風險調查分開。這次 Django 更新延續相同紀律：為每個受影響入口保留一份可複查的結果。

下一步可以從 formset 開始：列出所有能由表單設定主鍵的模型，挑一條限定 queryset 的寫入路徑，補上「集合外物件未變更」的斷言。這比一張只有版本號的升級截圖，更能防止邊界在下一次重構時消失。
