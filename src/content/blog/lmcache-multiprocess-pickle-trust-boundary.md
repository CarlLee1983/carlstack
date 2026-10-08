---
title: "LMCache 的遠端風險，藏在快取程序之間的信任邊界"
description: "CVE-2026-105192 涉及 LMCache multiprocess 的 ZeroMQ 與 pickle 解碼路徑。分清部署模式、HTTP 與快取傳輸端點，再用連線來源、程序權限與版本證據驗收暫時隔離措施。"
publishDate: 2026-10-08T10:08:30+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 系統設計
  - 資訊安全
series: 高併發快取與訊息中介軟體
seriesOrder: 10
cover: ../../assets/covers/lmcache-multiprocess-pickle-trust-boundary.webp
coverAlt: "黑色檔案櫃的正面入口封閉，橘色線材卻從側邊開口進入象牙白快取片之間，呈現程序間傳輸入口也需要獨立信任邊界。"
repositoryUrl: https://github.com/LMCache/LMCache
---

推理 API 已經放在驗證閘道後面，旁邊的快取程序卻仍接受其他主機連線。這種部署裡，「對外入口有保護」無法回答整個推理服務是否有未受控的執行路徑。

JFrog 的 Yuval Moravchick 在 [2026 年 10 月 7 日公告 CVE-2026-105192](https://research.jfrog.com/vulnerabilities/lmcache-is-vulnerable-to-unauthenticated-remote-code-execution-via-pickle-deserialization-on-the-multiprocess-zmq-transport-cve-2026-105192-jfsa-2026-001694382/)：LMCache 自 0.3.9 起的 multiprocess／distributed 模式有未驗證的 ZeroMQ 反序列化路徑。CVSS 9.8 對應設定可路由 `--host` 的情境；預設 localhost 不接受其他主機連入，僅嵌入 vLLM 程序的模式也不開這個 port。公告時 0.5.5 與 0.5.6rc3 仍未修補，並附公開 PoC，沒有宣稱已觀察到在野利用。

我會把這次盤點的最小單位設成「一個實際監聽端點＋能連到它的程序」。只搜尋 lockfile 裡有沒有 `lmcache`，會把沒有開啟該路徑的服務和已跨節點暴露的服務混在一起。

> [!NOTE]
> 本文於 2026 年 10 月 8 日閱讀公告、固定版本原始碼與 release 清單，未執行漏洞重現、LMCache 部署或 GPU 效能測試。下列盤點與驗收流程是作者建議；本文查閱的資料尚未提供可確認的修補版本，實際處置時須重新核對上游。

## HTTP 設定不等於快取傳輸設定

[`v0.5.5` 的 HTTP server](https://github.com/LMCache/LMCache/blob/v0.5.5/lmcache/v1/multiprocess/http_server.py) 分別接收 HTTP frontend 與 multiprocess server 設定：啟動生命週期會呼叫 `run_cache_server`，HTTP listener 則交給 uvicorn。從這份程式可看出，檢查 HTTP 的 host 與 port，不能取代檢查另一條傳輸路徑。

對維運文件，我會要求留下兩組資料，不接受只填「服務位址」：

- 應用入口：推理 API、HTTP frontend、反向代理及其身分驗證範圍
- 程序間入口：實際 bind 位址、傳輸協定、port、允許的來源工作負載

ZeroMQ 傳輸的預設 port 是 5555，但盤點應依執行中的參數，不能只掃固定號碼。JFrog 指出的遠端條件是可連到傳輸端點；改成另一個 port，沒有改變誰能送入資料。

我建議把部署設定與執行狀態相互比對。若設定檔寫 localhost，實際卻有 wildcard listener，就先停止擴大部署；若兩者一致，再檢查容器 port mapping、Service、host network 或轉送規則有沒有改變暴露面。這些都是待查項目，不表示本文已確認任何讀者的叢集存在上述設定。

## 解碼已經有副作用，handler 的型別錯誤就太晚了

[`custom_types.py`](https://github.com/LMCache/LMCache/blob/v0.5.5/lmcache/v1/multiprocess/custom_types.py) 把 `DeviceIPCWrapper` 對應到 msgpack extension code 1；decoder 的 `ext_hook` 會呼叫已註冊的 deserializer。而 [`ipc_wrapper.py`](https://github.com/LMCache/LMCache/blob/v0.5.5/lmcache/v1/platform/base/ipc_wrapper.py) 的 `Deserialize` 直接呼叫 `pickle.loads`。這兩個固定版本檔案足以指出需要審查的序列化邊界。

[Python 官方文件](https://docs.python.org/3/library/pickle.html) 明確提醒：不可信 pickle 可在反序列化時執行程式碼。外層採用 msgpack，不會使 extension 內再次使用的 pickle 自動安全。

這改變了我會要求的安全驗收位置：檢查要發生在資料進入具有執行能力的解碼器之前。若先解碼，再檢查物件型別，即使最後回傳錯誤，也不能證明先前沒有副作用。

對自行維護的協定，適合分開檢查兩件事：

1. 訊息來源有沒有被驗證，能否被撤銷，以及驗證是否早於危險解碼
2. 資料格式是否只表達允許的欄位與資源描述，是否仍存在可還原任意物件的入口

這是設計檢查方向，並非對 LMCache 提供一份可直接套用的 patch。GPU IPC 的資源生命週期與裝置相容性需要另外驗證；把一個函式換成 JSON，不代表完整協定就能正常工作。

## 暫時隔離要寫出剩餘風險

在修補版本可被確認之前，我的處置順序會是先縮小連線來源，再確認權限與歷史暴露。單節點部署如果不需要跨主機共享，應優先保留本機傳輸範圍。跨節點共享確有需求時，則由負責部署的人評估是否暫停該模式，或建立明確的允許來源清單。

**停止規則：無法說清楚哪些工作負載能連到快取傳輸端點，就不把「位於內網」當成驗收通過。** 共用叢集內的其他 Pod、開發測試主機或遭入侵的合法 peer，仍可能處於同一網路範圍。

網路限制屬於暫時緩解，不能當作反序列化缺陷已修復。低權限程序同樣只是限制可能影響範圍：它可能仍能讀取掛載資料或使用既有服務權限。對每個執行環境，應盤點實際 UID、掛載與可用憑證，避免因為不是 root 就直接結案。

以下是我會交給服務負責人的紀錄骨架，不是本文實測輸出：

```yaml
# 部署盤點範本；pending 必須由實際觀察補上
cache_transport_review:
  lmcache_version: pending
  image_digest: pending
  runtime_mode: pending
  actual_bind_address_and_port: pending
  allowed_source_workloads: pending
  observed_listener_matches_config: pending
  unauthorized_source_connection_denied: pending
  authorized_peer_functional_check: pending
  process_identity_and_mounts: pending
  historical_exposure_window: pending
  upstream_fix_reference: pending
  mitigation_owner: pending
```

連線驗收只在有權管理的環境進行：從允許與不允許的來源分別確認連通性，再測合法 peer 的快取功能。這一階段不需要向服務送入可執行 payload；網路可達性與反序列化修補是不同驗收項目，應留下各自的證據。

如果端點曾對不可信來源可達，封住入口也不能證明過去沒有執行事件。我會保留暴露期間、程序與容器日誌、異常程序和憑證使用紀錄，交由事件應變流程判斷後續範圍。是否要輪替憑證或重建環境，應由實際暴露與調查證據決定，不能只從 CVSS 數字推定所有服務都遭入侵。

## 新版出現後，還要核對被修補的那條路徑

[上游 release 清單](https://github.com/LMCache/LMCache/releases) 在本文查核時可見 0.5.6rc3；「有更新的 build」不等於「這個 CVE 已修補」。後續升級單應連到具體修補說明，確認它涵蓋 multiprocess 傳輸、來源驗證與解碼行為，再對實際執行版本做回歸。

這也延伸了站內 [Django 安全更新的入口驗收](/blog/django-october-security-patch-regression/)：套件版本是必要證據，應用使用方式決定要測哪條路。若要檢查程序權限與事件調查的區別，可接著看 [SubQuery 執行邊界](/blog/subql-common-compromise-execution-boundary/)。

今天可以先完成一件小事：從一個正在使用 LMCache 的部署，列出所有 listener 與能接近它們的工作負載。把這份清單附在擴容或開啟跨節點共享的變更單上，下一次改 `--host` 時，就有明確的安全審查入口。
