# Queue、Worker、ACK：來源與驗收

- 狀態：正文與原創圖片完成，交整合者跑最終 gates / 預覽 / 部署驗證。
- 查核時間：2026-10-27T07:56:00+08:00。
- 新文：`queue-worker-ack-foundations.mdx`，後端工程基礎圖解 5。
- 虛構文章收藏站 CSV 匯出，不公開任何私有資料。教學合約無實際服務、壓測或故障測試聲稱。

## 去重

已核對既有 `distributed-message-delivery-semantics.mdx`、queue patterns、四家 MQ 選型與 `order-system-worker-takeover.mdx`。新讀者收穫是接單/執行分工、job ID、202 與 confirm/ACK 的邊界；不重寫選型、outbox、lease、退避預算。僅內鏈延伸。讀最新 AGENTS/content guide/style/diagram guide；trail 不可用，使用具體路徑與 grep。

## 段落與原文

| 段落          | 一手來源                                                                                                    | 查核事實                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 接受與完成    | https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3                                                  | 202 尚未完成、不保證最後成功、應描述狀態及監看位置                        |
| 工作角色      | https://www.rabbitmq.com/tutorials/tutorial-two-python                                                      | work queue 分派耗時任務給背景 Worker                                      |
| 雙向確認      | https://www.rabbitmq.com/docs/confirms#are-publisher-confirms-related-to-consumer-delivery-acknowledgements | publisher confirm 與 consumer ACK 互相獨立，AMQP 0-9-1 scope              |
| crash/requeue | https://www.rabbitmq.com/docs/confirms#when-consumers-fail-or-lose-connection-automatic-requeueing          | manual ACK 未確認 delivery 在 channel/connection 關閉後重排，偵測可能延遲 |
| 重複          | https://www.rabbitmq.com/docs/reliability#data-safety-on-the-consumer-side                                  | 重送與冪等責任；producer 失去確認亦可能重複                               |

以上全文公開官方原文 open/read，未以搜尋摘要代替。假設 job ID 不變且保留資料庫業務狀態；條件更新為應用程式建議，不聲稱完整租約、檔案原子性或 exactly once。待派送流程明列，未將 DB+MQ 當單一交易。重送同 ID 不等於可無條件重做外部副作用。

## 圖像驗收

正式內建 imagegen，原創 no-reference。提示：editorial gouache, sage-gray three document trays on dusty mauve workbench, first stacked papers, middle paperweight, last folded-corner sheet, overhead-diagonal, matte brushwork and diffuse daylight, no text/logos. 與前篇 cache 在 medium / composition / palette / lighting 不同。

`src/assets/covers/queue-worker-ack-foundations.webp`：1536×1024，187198 bytes，quality 86。已目視全尺寸及中心 16:9、16:10 裁切：三托盤與內容清楚完整；alt 改為實際繪出內容，沒有把 metaphor 畫成正式協定圖。

原生 SVG：`QueueJobJourneyDiagram.astro`、`QueueAckCrashDiagram.astro`。唯一 title/desc、純 --dg-*、無固定寬高、mobile HTML cards、48rem 切換。實頁深淺色/桌機手機預覽仍交整合者驗收，未聲稱已驗。
