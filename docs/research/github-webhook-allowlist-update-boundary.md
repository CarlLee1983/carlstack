# GitHub Webhook allowlist 更新查核

日期：2026-10-30。對應 `src/content/blog/github-webhook-allowlist-update-boundary.md`。

## 去重與角度

基準 main `f0452c6f918e4d51ce1eabfc5ba64bd1de283156`。完整本地 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋公告 URL／slug、三個新增 CIDR、Webhook IP／allowlist／白名單等主題，未有同來源或相同核心決策。

已讀 `webhook-system-architecture-hmac-retry-dlq.mdx` 全文，該文為傳送架構、HMAC、重試、DLQ。本篇聚焦接收端入口的 CIDR 清單更新、最後生效證據與缺收後補送，不重寫同一架構。與舊文互相關聯但不引用其通用重試表當 GitHub 保證。其他命中是 Stripe 金流 webhook／物流事件順序，不是 GitHub 網路範圍。

父任務協調：AWS 新稿使用網路系列 23，本稿暫用 24；最終整合仍須確認所有草稿與最新 main。

## 原文與段落對應

1. [GitHub 2026-10-29 Changelog](https://github.blog/changelog/2026-10-29-webhook-ip-ranges-added-to-the-meta-api/)，已讀完整公告。新增 `9.234.98.160/28`、`9.234.98.176/28`、`9.234.106.48/28` 至 Meta `hooks`。靜態清單需加入既有範圍；已用 Meta 持續同步者不需針對本次另調整。適用 github.com 全方案含 Enterprise Cloud，未延伸至 GHES。沒有捏造切換截止日期。
2. [REST Meta](https://docs.github.com/en/rest/meta/meta#get-github-meta-information)，已讀全文相關節。文件回應僅範例，須查 API 取最新值；端點含 IPv4/IPv6，各功能是否支援另查。`hooks` 與其他服務欄位分開。文中候選驗證／差異審查／保留舊版是工程建議，不是 GitHub 提供的同步功能。
3. [Webhook 最佳實務](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)，已讀全文。定期更新 IP allowlist；補送 X-GitHub-Delivery 與原始值相同。文中「seen 不等於完成」是接收端設計推論。
4. [驗簽文件](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)，已讀原文。secret／payload 與 X-Hub-Signature-256；代理不可改動相關內容。沒有把 Stripe 時間戳格式套在 GitHub 上，也未聲稱單純 signature 能保證業務冪等。
5. [處理失敗投遞](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries)，已讀全文。GitHub 不自動重送失敗投遞，可手動或按官方 API 補送。沒有將 Marketplace／Sponsors 不提供的 delivery API 當所有 webhook 都有；正文使用概括的官方方式，不提供猜測端點。

## 實際唯讀查核

2026-10-30T03:18:05.532295+00:00，以正常 urllib GET `https://api.github.com/meta` 得 HTTP 200。JSON `hooks` 為：

- 9.234.106.48/28
- 9.234.98.160/28
- 9.234.98.176/28
- 192.30.252.0/22
- 185.199.108.0/22
- 140.82.112.0/20
- 143.55.64.0/20
- 2a0a:a440::/29
- 2606:50c0::/32

完整回應 SHA-256 `867a9a7203bad7d64ceb4006cea69b2057fc0b84bc4f35f51bc4cf2e4faa5264`，暫存 `/tmp/github-meta-oct30.json`。這是查核時快照，不是應永久貼入 production 的範圍清單。未修改任何 firewall／WAF／security group，沒有 webhook 重送或測試生產流量。

## 工程推論與限制

- last-known-good 僅短期止損，舊清單可能漏新範圍或保留已刪範圍，所以需告警、陳舊期限與負責人。未假稱官方指定同步間隔。
- 驗證候選後套用、讀回生效規則、部分節點失敗不能報整批成功、回滾後補查漏收，均為工程建議。
- 隔離測試安排沒有實際執行，不宣稱供應商具備原子更新或可回滾保證。
- 無可執行範例、無虛構效能／流量／實測數字。文章範例為虛構部署通知服務。

## 交接

正文與來源檢查完成。繁中機械檢查初有「異常」及冒號命中，已改為自然表述。尚待發布整合者填實際 publishDate、cover/coverAlt、正式狀態，進行 format、policy、check、test、build、視覺與正式頁核驗；不稱完成發布。

## 原創封面與目視

本批AWS為炭黑綠印刷近景、Mistral為鈷藍赭金俯視gouache；本篇選白粉琥珀、玻璃材質側光微距、橫向托盤與候選片。正式image_gen原創prompt：white ceramic tray of rose glass tiles, separate amber candidate tiles, inspection lens, macro studio photograph, no words/logos。原圖exec-cb015d67-608b-430c-83d9-1791e3e25ced.png，WebP1672×941。全尺寸與16:10卡片已目視，兩組主體可辨。圖為概念封面，不當實際API步驟圖。
本機Astrodev退出，production靜態預覽在雲端Chrome亦Connection refused；保留本機桌面/窄版深淺色未驗限制，不繞限制，正式頁另採正常Chrome核實。
