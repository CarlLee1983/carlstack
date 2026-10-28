# 系統設計每日實戰 18：未決退款年齡與觀測新鮮度

## 範圍與去重

2026-10-28 Asia/Taipei，獨立工作區從最新 main 222e227964004157da32b5e4fedfc621360322b7 起稿。AGENTS、content-guide、schema、workflow、testing、diagram-guide 及適用 copywriting/humanize skills 已讀。Trail CLI 與 graph cache 不存在，改用全檔案搜尋。系列1–17連續、當日只有指定ub-mode文章（另系列102），沒有本每日系列新稿、未完成稿或 open PR。queue 的多活與共識是其他題目，保留不動。

第9篇重試額度已提到最老待辦但未定義觀測資料與告警新鮮度；本篇聚焦「未完成案件不能只靠完成耗時發現」，不重寫重試或worker接手設計。第17篇處理還原後完整性，本篇明示單靠主庫觀測不能抓遺失操作。

## 官方全文與段落對應

2026-10-28讀取一手來源全文相關段落，沒有以搜尋摘要替代。獨立審核覆核核心技術語義、估算與系列差異。

- https://prometheus.io/docs/practices/histograms/ ：histogram針對實際觀測值。完成時埋點看不到未完成樣本，是本文設計推論，不稱工具失效。
- https://prometheus.io/docs/practices/instrumentation/ ：offline processing、gauge、labels成本；#timestamps-not-time-since 推薦匯出timestamp後由監控端相減。本文另設唯讀主庫快照、有限labels與新鮮度，是案例選擇，不是官方要求每個系統都這樣做。
- https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/ ：for 延後firing；案例10+2+3分鐘僅預算，不是已量到的偵測SLA。
- https://sre.google/sre-book/monitoring-distributed-systems/ ：可採取行動的告警與症狀、診斷分工。

受理十五分鐘仍無終局轉人工沿用第9篇教學設定；人工案件仍未決，不以轉派重置時鐘。終局需供應商可核結果及本地保存，明確失敗與成功分列，不宣稱銀行入帳。數字均教學假設；沒有執行退款、Prometheus整合或壓測；正文是驗證計畫，不提供未跑的可執行程式。

## 封面與圖解

鄰篇17玻璃／側視／酒紅與淡紫；本篇紙雕網印／俯視／鈷藍與赭黃，在媒材、構圖、色盤三項區分。保留橫式尺寸這一系列錨點。正式imagegen生成原創圖1672×941，轉本地WebP，已目視全尺寸與320×180卡片裁切，無文字logo。圖為紙盤中未完成卡片及無數字計時器。

Prompt: Original editorial landscape cover; screenprint and cut-paper collage, top-down cobalt blue tray with cream paper slips and one protruding ochre slip, simple analog timer without numbers, sparse ivory background, crisp ink textures; central crop-safe composition; no letters/numbers/logos/watermarks/UI/charts/arrows.

原生SVG使用960×600寬列卡，窄版重新排HTML卡片，dg tokens與既有主題選擇器；不新增站台設定或全域UI。

## 驗收邊界

Node24.22.1，pnpm12.1.0；npm預設cache不存在，改用本工作/tmp cache後frozen install成功，未更動lock。Astro預設config路徑不存在，使用暫存XDG路徑與關閉telemetry後仍在ready前退出。雲端browser本機預覽ERR_CONNECTION_REFUSED，停止，不繞環境限制。桌面／320px實頁深淺色預覽未完成，不宣稱已驗。

本次任務開始前，同站列表、RSS、sitemap、series、Pagefind資源曾明確403，父端要求不得換途徑繞拒絕。本次不重試那些已拒資源；正式新文章與新封面可核對時另記結果。build包含本篇和全部索引，不等同正式索引已驗。

獨立審核採納：description限定完成時才記錄的埋點方式；15分鐘預算改為不晚於；明示timestamp與空集合判斷，不讓age凍結。沒有阻擋性技術缺陷。
