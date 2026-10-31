# 主機與 Linux 維運專題查核

查核日期2026-10-31。使用者明確同意專題與排障首篇，後續補入基本指令；非每日新聞或系統設計配額，未新增排程。

## 來源與去重

- Securebydefault.io https://www.facebook.com/reel/2100049957275876 ，原分享 https://www.facebook.com/share/r/1CE2S66bf4/ ：主機變慢、load/CPU/memory/disk/process。
- Afzal Web Solutions https://www.facebook.com/reel/1059228207136968 ，原分享 https://www.facebook.com/share/r/1F1jfsmMFP/ ：ls/cd/mkdir/cp/cat/grep/chmod/ps/kill/rm。
- main d52fd8a：依穩定ID、作者、URL與主題查 blog/research/queue，無同來源成文。既有CPU、虛擬記憶體、LinuxIO和網路文章保留原系列日期，只由入口內鏈。
- Trail CLI/cache未提供，精確檔案和literal搜尋作替代。已讀AGENTS、content-guide、schema、部署workflow、copywriting及humanize-writing規範。

## 技術查核

一手手冊完整閱讀與獨立審查已於同日完成，非搜尋摘要。man7是上游專案手冊的HTML呈現，GNU站直讀逾時。

- load：https://man7.org/linux/man-pages/man1/uptime.1.html 、https://man7.org/linux/man-pages/man5/proc_loadavg.5.html 。包括可執行及不可中斷等待，不是CPU百分比。
- free：https://man7.org/linux/man-pages/man1/free.1.html 。available是估計。
- vmstat：https://man7.org/linux/man-pages/man8/vmstat.8.html 。首報速率開機平均，程序/記憶體當下。
- 儲存：https://man7.org/linux/man-pages/man1/df.1.html 、https://man7.org/linux/man-pages/man1/iostat.1.html 。await含排隊，util不能泛化為平行裝置上限。
- PSI：https://docs.kernel.org/accounting/psi.html 。system/cgroup範圍，系統CPU full未定義相容回報0。
- 程序：https://man7.org/linux/man-pages/man1/ps.1.html 、https://man7.org/linux/man-pages/man1/top.1.html 。百分比時間和模式差異。
- 基本命令：https://man7.org/linux/man-pages/man1/cp.1.html 、https://man7.org/linux/man-pages/man1/chmod.1.html 、https://man7.org/linux/man-pages/man1/rm.1.html 、https://man7.org/linux/man-pages/man1/grep.1.html 、https://man7.org/linux/man-pages/man1/kill.1.html 。

## 實作、圖片與恢復紀錄

早次隔離環境已完整實跑基本篇：mktemp、兩目錄、建立/複製、grep第2行、chmod600、自己的sleep/TERM/wait143、rm-i回答y、原檔保留。只讀date/uptime/free/vmstat/df/ps也成功。iostat及/proc/pressure當時未提供，文章明標未跑。無壓測或正式主機資料。

早次local commit1967455未推送，審查基礎設施失敗後等待重試批准；工作區回滾且遠端查無該物件。2026-10-31 09:11UTC新批准後，從相同main重建內容及三張imagegen原創封面，重跑最後檔案驗收，不沿用舊commit測試聲稱。

三張1600×900 WebP全尺寸與320×200中心裁切已視覺驗收：米白/cobalt分層主機、陶土/綠色檔案、靛色/copper資源探測。新圖解為原生SVG、320寬直式編排、既有dg tokens與title/desc，不改站台設定。

本機預覽會依環境可用性嘗試，若無法啟動則記錄限制，不聲稱已完成完整桌手機視覺驗收。其餘policy/check/test/build及正式文章、封面、列表、搜尋、系列仍為發布必要驗收。
