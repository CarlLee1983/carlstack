# LMCache multiprocess 傳輸信任邊界：來源與驗收

- 核對日：2026-10-08，Asia/Taipei
- 主來源：Yuval Moravchick，JFrog，2026-10-07，https://research.jfrog.com/vulnerabilities/lmcache-is-vulnerable-to-unauthenticated-remote-code-execution-via-pickle-deserialization-on-the-multiprocess-zmq-transport-cve-2026-105192-jfsa-2026-001694382/
- 文章：`src/content/blog/lmcache-multiprocess-pickle-trust-boundary.md`
- 研究方式：完整公告與固定版本原始碼靜態閱讀；沒有安裝 LMCache、執行 PoC、部署 GPU 或量測效能。

## 去重

基線 ad3a1aa27e312b3c91843c2ea956498e43119fa5。完整 checkout 的 blog、research、queue 搜尋主來源 URL、正規化 URL（原始無追蹤參數）、CVE-2026-105192、JFSA-2026-001694382、LMCache、Yuval Moravchick、JFrog，無同源文章。Oct8 未有完成文章或 commit；Oct7 最新批次為 Django、Decisions API、MCP redirect。此篇新增 cache 系列 10，與 Django、SubQuery 互補：讀者收穫是 multiprocess 與 HTTP 入口分別盤點及解碼前信任檢查。

## 主張與來源

JFrog 公告：>=0.3.9 multiprocess/distributed；遠端可達 --host 才對應 CVSS9.8；localhost預設及嵌入vLLM模式另行限定。公告時0.5.5、0.5.6rc3未修補，公開PoC與在野利用不混同。公告內容只作精簡摘要，本文未重製PoC。

固定原始碼：

- https://github.com/LMCache/LMCache/blob/v0.5.5/lmcache/v1/multiprocess/custom_types.py ：msgpack extension code1、DeviceIPCWrapper的serde註冊及ext_hook。檔案blob b8ecdb8d144991b90dcdee065974d52ed611f714。
- https://github.com/LMCache/LMCache/blob/v0.5.5/lmcache/v1/platform/base/ipc_wrapper.py ：Deserialize呼叫pickle.loads。
- https://github.com/LMCache/LMCache/blob/v0.5.5/lmcache/v1/multiprocess/http_server.py ：HTTPFrontendConfig和MPServerConfig分別使用，lifecycle啟動run_cache_server。blob ed6f9b84e9185e0ffe2b049e28cc1b09cce67258。
- https://docs.python.org/3/library/pickle.html ：untrustedpickle可執行任意程式碼；只作短摘要。
- https://github.com/LMCache/LMCache/releases ：查閱時可見0.5.6rc3（pre-release，508efbf）；本文沒有把最新build當作已修補證據，沒有宣稱完整證明不存在新修補。

部署盤點骨架、停止規則、連通性正負測試、最小權限檢查和調查建議是作者工程設計，未冒充已執行成果。不提供利用payload，不針對第三方掃描。

## Cover Direction

已看Oct7 Django粉橘水閘、Decisions藍玻璃秤架、MCP綠玻璃管封面。此篇選橘銅線材從黑檔案櫃側邊進入的隱喻，炭黑與象牙白木刻版畫媒材、非對稱剖面構圖、強斜光；與前組在媒材/構圖/主色不同。原創內建imagegen，無第三方圖；已檢視1536×1024全尺寸與320×180裁切卡片：主體可辨，無文字、logo或浮水印；正式WebP本地引用。

## 驗收界線

不含Mermaid、圖解或Markdown表格。所有production gate、build索引、exact-SHA部署與正式頁檢查在整合後核對；此處不預先宣稱通過。本地瀏覽器預覽未執行，依授權仍可發佈；其餘gate照常保留。
