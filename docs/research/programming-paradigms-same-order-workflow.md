# 程式典範：查核紀錄

查核日期：2026-10-31。使用者授權基礎分類內容批次。

## 去重及來源識別

- 原分享：https://www.facebook.com/share/r/1EFnwdEY9P/
- canonical：https://www.facebook.com/reel/1444851567820521
- 作者：UCFYX Learn Networking & Cybersecurity。父工作已驗公開字幕／選定畫面。影片列七種典範，本篇不宣稱互斥或唯一分類，聚焦同訂單需求的五種組織方式。
- main 5d84b27 查穩定 ID、程式典範主題，無同來源成文。既有 design-patterns-object-collaboration-foundations 是物件協作模式；本篇先教流程、狀態、計算、事件、宣告，與其內鏈銜接。

## 段落與一手資料

- Python 官方 HOWTO：https://docs.python.org/3/howto/functional.html ，程序式／宣告式／OOP／函數式、多典範、副作用及測試。僅摘要基本定義，原創例子與建議另行表明。
- Node Events：https://nodejs.org/api/events.html#asynchronous-vs-synchronous ，EventEmitter 依註冊順序同步呼叫。不得推論事件必為非同步、跨服務或可持久重試。
- PostgreSQL 教材：https://www.postgresql.org/docs/current/tutorial-select.html ，SELECT、WHERE、ORDER BY 多欄位。

## 示例及邊界

2026-10-31 09:59 UTC 從正文抽出完整 JS 計價 fence，Node v24.22.1 執行 exit 0，兩函式320元、空輸入0、JSON輸入內容未變。計價案例無稅折扣與小數貨幣，非效能測量。Order class 明標縮寫，SQL 明標概念且未跑資料庫。私有狀態不保證跨伺服器交易；有 reduce 不代表純函式，區域變數更新也不等同外部副作用。封面與全站檢查由整合工作驗收。
