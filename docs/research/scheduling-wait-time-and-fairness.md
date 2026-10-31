# 排程等待與公平：查核紀錄

查核日期：2026-10-31。使用者授權基礎分類內容批次。

## 去重與來源

- 原分享：https://www.facebook.com/share/r/19jVhhULWw/
- canonical：https://www.facebook.com/reel/1604584384052031
- 作者：Code Crack。父工作已驗公開字幕／選定畫面，咖啡排隊動畫。未將原片等待數字當真實效能或普遍結論。
- main 5d84b27 搜尋穩定 ID、FCFS 與關鍵詞，無同來源正文。既有 distributed-scheduler-hierarchical-timing-wheel 是時間輪觸發，不與基礎資源排程混為一題。既有 queue-worker-ack-foundations 作入門銜接，distributed-queue-patterns-fifo-priority-delay-dlq 明標延伸。
- OSTEP 作者公開教材原文：https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf ，查首次回應、周轉、FCFS、SJF、RR 與假設。
- MLFQ 原文：https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-mlfq.pdf ，查未知工作長度、歷史行為、飢餓與優先調整。文章未聲稱 Linux 當前採用特定排程器。

## 教學推導與驗證

原創三工作模型，A/B/C=6/2/1 分鐘，均時間0到達，無 I/O、切換成本。2026-10-31 09:59 UTC 用 Python 逐步模擬核對：

- FCFS：等待0/6/8，完成6/8/9；平均等待14/3、周轉23/3。
- SJF：依 C/B/A，等待0/1/3，完成1/3/9；平均等待4/3、周轉13/3。
- RR q=1：首次0/1/2；A/B/C完成9/5/3；平均首次1，周轉17/3。

非壓測，非生產資料。明分首次回應與累計等待、CPU搶佔與應用工作分批；FIFO 起點與保留長工作容量是工程建議，不冒稱教材固定標準。公平規則及門檻需依業務決定。封面與全站驗收由整合工作補記。
