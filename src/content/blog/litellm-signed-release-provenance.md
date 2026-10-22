---
title: "LiteLLM 1.107.0 遭投毒後，復原要從乾淨環境與憑證輪替開始"
description: "LiteLLM 1.107.0 的 PyPI 與容器產物遭污染。整理受影響時間窗、Python 啟動風險與復原順序，再把來源 repository、artifact digest 與發布授權納入驗收。"
publishDate: 2026-10-22T10:04:15+08:00
draft: false
featured: false
tags:
  - 安全架構
  - AI 工程化
  - DevOps 與 CI/CD
cover: ../../assets/covers/litellm-signed-release-provenance.webp
coverAlt: "透明隔離箱內放著破損黑色包裹與墨漬，另一個乾淨托盤上是新鑰匙與白色包裝，表達污染環境隔離、乾淨重建及憑證替換。"
---

LiteLLM 於 2026 年 10 月 21 日確認，`1.107.0` 發布產物遭投毒並已下架，私有企業 registry 未受影響。[官方事故紀錄](https://docs.litellm.ai/blog/security-incident-oct-21-2026)所見更新時間為當日 20:30 UTC，調查仍在進行。

受影響團隊現在要處理的是曾執行的環境與它接觸過的秘密。把依賴退回舊版，只改變下一次安裝，無法收回可能已送出的憑證。

查核依據是上述官方紀錄、[通報者的 Issue #47826](https://github.com/BerriAI/litellm/issues/47826)、Python 文件與 SLSA 規格。我沒有執行惡意套件、重現攻擊，也沒有檢查讀者的主機。以下把已公開的暴露線索和建議的復原驗收分開。

## 暴露盤點要查當時的產物，不能只看今天的 tag

官方列出的 PyPI 污染版本為 `litellm==1.107.0`，存在於 10 月 21 日 11:39–13:23 UTC。Docker Hub 的 `v1.107.0`、`latest`、`main-latest`、`main-stable` 在 11:46–14:20 UTC 指向污染產物。換成台北時間，分別是當日 19:39–21:23、19:46–22:20。GHCR 另有變體與不同下架時間，需按[官方完整清單](https://docs.litellm.ai/blog/security-incident-oct-21-2026#confirmed-affected-versions)逐一核對。

我的盤點建議是保留四項資料：安裝或拉取時間、套件版本／image digest、實際執行位置，以及當時可取得的秘密。範圍包含正式服務、開發機、CI runner、短命測試容器及內部映像快取。它們有不同的存續時間，不能用現在還活著的 pod 代表全部歷史部署。

可變 tag 今日已改指乾淨映像，回答不了昨天拉到什麼。應向部署紀錄、registry mirror、runner log 與容器執行平台找當時的 digest，再比對事件清單。**找不到歷史 digest 的部署，保留為待釐清暴露，不能勾成未受影響。** 這是建議的事件處理規則，不是 LiteLLM 替個別環境做出的判定。

## 受污染的 Python 環境，不適合拿來執行修復工具

通報者透過靜態解碼發現，wheel 會把 `cook.pth`、`cook.py`、`sitecustomize.py` 放進 site-packages。`cook.pth` 載入竊密程式，另一個啟動檔建立背景載入器。通報因此提醒，連在該環境執行 pip 都可能再次觸發，單純刪除套件不足以處理背景程序。[原始通報與處置說明](https://github.com/BerriAI/litellm/issues/47826)

這符合 [Python 3.14 的 site 啟動機制](https://docs.python.org/3.14/library/site.html)：`.pth` 的可執行 import 行可在 interpreter 啟動時執行，之後還會嘗試載入 `sitecustomize`。風險不以應用程式有沒有明寫 `import litellm` 為界。

我的處理順序會從隔離開始：限制受影響主機對外連線與秘密存取，依團隊取證流程保存磁碟、程序和網路證據，再從可信管理環境操作。避免把新的管理 token 或輪替後的密碼送進仍可能執行載入器的環境。

官方在這次公告建議固定至 `1.106.2` 或此前已發布的明確版本。對可拋棄的容器與 venv，我傾向從乾淨來源重建。重建來源也要排除受污染的 image layer、套件快取與 runner workspace，不能只是沿用同一個快照再重裝依賴。需要保留主機調查時，由事件應變人員依官方指引處理啟動檔、編譯快取與背景程序，取證完成前不以批次刪檔取代調查。

## 輪替範圍沿著主機可讀權限展開

通報者列出的竊取目標包含雲端與開發工具憑證、可讀程序環境變數，以及 proxy 資料庫中的上游 provider key。它也提醒，找到外傳 marker 能確認外傳，找不到不能證明清白，因為暫存檔與容器可能已消失。[Issue #47826 的 payload 與 remediation](https://github.com/BerriAI/litellm/issues/47826)

這會改變輪替工單的寫法。只列 LiteLLM master key 太窄；建議依每個執行位置的權限建立清單：

- Proxy 能讀的模型供應者 key、資料庫登入資訊與管理憑證，分別找出擁有者及撤銷方式。
- 雲端 instance／task role 與 CI 身分，確認可用權限、既有 session 的處理方式，以及相關稽核紀錄。
- 同機工具或掛載目錄中的秘密，依可讀範圍納入，並追查它們是否又能取得下一層秘密。

輪替應由乾淨環境執行。先安排撤銷與服務切換順序，避免新秘密剛建立就又被舊工作負載讀走。無法立即撤銷的權限要有臨時限制、負責人與到期時間，不宜藏在「已更新設定」這種完成註記裡。

復原驗收要能回答：舊憑證是否失效、新工作負載跑在哪個 digest、誰確認重建來源乾淨，以及還有哪些身分的調查未完成。服務恢復回應只是可用性結果，和這幾項安全結果分開記錄。

## 官方簽署仍要核對來源與發布授權

維護者表示，官方 Git tag 乾淨，污染產物由正式工作流從外觀相似的 repository 建置並簽署。內部部署如何遭存取仍未確認。[官方初步調查](https://docs.litellm.ai/blog/security-incident-oct-21-2026#how-this-happened)

因此我會把「簽署有效」與「允許發布」拆成兩個驗收。[SLSA 的 artifact 驗證規格](https://slsa.dev/spec/v1.2/verifying-artifacts)要求檢查 artifact digest、可信 builder、canonical source repository、build type 與外部參數是否符合預期。這提供了可操作的審查方向，沒有替這次事件承諾某個工具一定能攔下攻擊。

發布流程可以補一項明確的拒絕條件：來源 repository、建置設定或核准過的 commit 與既定契約不同，就停止 promotion。契約本身也要受獨立審查，否則攻擊者若能同時改工作流和放行政策，新增的一層檢查仍會跟著被改掉。

固定 digest 的價值在於留下可查證的部署身分。它不會替一份已遭投毒的產物背書。站內的 [GitHub Actions 鎖檔與共用工作流審查](/blog/github-actions-lockfile-review-boundary/)也討論了固定參照之後，來源與權限審查仍要承接的責任。

## 把「服務已恢復」拆成可以交接的證據

今天的下一步，是從部署與安裝紀錄找出 `1.107.0` 及上述可變 tag 的使用位置。每個位置交付一份暴露與復原紀錄：歷史產物身分、隔離與取證狀態、乾淨重建來源、秘密撤銷結果，以及未解決事項的負責人。

等這份清單能交接，再把來源契約驗證補進後續發布流程。先消除仍在使用的污染環境與憑證，再讓下一次 artifact 驗收更嚴格，才不會讓一份漂亮的供應鏈改造計畫掩蓋眼前尚未結案的暴露。
