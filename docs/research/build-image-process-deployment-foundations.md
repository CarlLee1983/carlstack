# Build、image、行程與正式服務：基礎篇查核

- 日期：2026-10-27 Asia/Taipei。
- 授權：使用者要求當日安排並完成相關基礎知識；六篇「後端工程基礎圖解」第 6 篇，非每日系統設計另增計數。
- 範圍：虛構文章收藏站的版本交付與真實請求，非 Kubernetes 入門大全、進階發布策略或特定產品安全公告。
- 去重：延伸但不重寫 modern-cicd-deployment-strategies-blue-green-canary-rolling、kubernetes-core-architecture-control-plane-etcd、dotnet-oob-patch-deployment 的核心；以內鏈串接。相同官方通用文件不代表相同教學決策。

## 官方原文與段落對應

所有來源已讀取原文，非搜尋摘要。

1. image 與不可變內容：https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/ 。支援第一與第二節。未把容器隔離描述為絕對安全。
2. 容器內行程：https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/ 。支援 image 並非執行中的伺服器。
3. RUN 與 CMD：https://docs.docker.com/build/concepts/dockerfile/ 。前者建置執行，後者容器啟動預設命令；未提供未測試 Dockerfile。
4. tag / digest：https://docs.docker.com/reference/cli/docker/image/pull/#pull-an-image-by-digest-immutable-identifier 。固定 digest 不會自動更新修補。image ID 不混同 registry manifest/index digest。
5. 建立新容器與啟動既有容器、覆寫啟動命令：https://docs.docker.com/reference/cli/docker/container/run/ 。同 image 的 API/worker 為教學設計假設，須 image 包含相應入口。
6. ARG / ENV、secret 風險：https://docs.docker.com/build/building/variables/ 。前端 build-time 公開設定、worker start-time 設定為明示的本例設計，不宣稱所有框架如此。
7. volume 生命週期：https://docs.docker.com/engine/storage/volumes/ 。區別 stop/restart 與 remove/recreate；volume 非備份，應用資料需另外持久化與備份策略。

工程建議：commit→digest→行程紀錄及完整匯出驗收，是本篇推導的最小可行驗證方法，不是 Docker 官方要求。未執行真實 Docker 部署、壓測或虛構收藏站測試；版本 A/B、應用功能皆教學案例，無效能數字或親測宣稱。

## 圖解與封面

- 原生 `src/components/BuildReleaseBoundaryDiagram.astro`：桌面 SVG / 窄版 HTML 有序卡片，五站發布與驗收；所有中性色使用 --dg-* token，唯一 title/desc/marker ID，viewBox、role 與替代描述。
- 封面計畫：陶橘黏土模型、側面立體印刷機／旁放尚未替換的印版與舊圖樣出紙；比喻已製成產物不等於運作機器已換版。圖像是概念隱喻，非 Docker 實際機制圖。
- 與第 5 篇差異：第 5 篇水粉筆觸、淡紫鼠尾草灰、俯視斜角托盤；本篇立體陶土、陶橘暖灰、側面近景、柔和側逆光，媒材／構圖／色盤至少三項不同。
- 正式 imagegen（built-in）生成一次，原始輸出 `/workspace/scratch/d935b46a4408/generated_images/exec-57e73dd3-5411-43ae-a5b2-1b797042b5bf.png`；僅複製轉檔，未刪原圖。
- 最終檔 `src/assets/covers/build-image-process-deployment-foundations.webp`：1672 × 941，WebP quality 84。已目視全尺寸、400 × 225（16:9）與 400 × 250（16:10）置中裁切；圓點出紙與旁置三角浮紋滾筒皆可辨，無文字／logo。coverAlt 依實圖改為替換滾筒，而非平面印版。
- Prompt：original wide editorial tactile clay miniature terracotta-orange printing press, side-on slight perspective, loose replacement plate with triangle relief beside installed roller printing circle-pattern cream sheets, warm gray studio backdrop, soft side-rim light, modern sophisticated clay 3D, central crop-safe focal object, landscape 16:9, no text/numbers/logo/watermark/UI/arrows/cyberpunk. Actual result is a replacement roller; metaphor remains prepared artifact versus running machinery.
- 正文、SVG 與圖片已由作者逐項靜態確認；實頁圖解桌機／320px／深淺色仍由整合者檢查。
- 全站 format / policy / check / test / build 與部署、桌機手機深淺實頁目視由整合者執行，未於本紀錄宣稱通過。
