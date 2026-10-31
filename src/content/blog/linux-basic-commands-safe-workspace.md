---
title: "Linux 基本指令：在練習目錄完成查找、權限與程序操作"
description: "把 ls、cd、mkdir、cp、cat、grep、chmod、ps、kill、rm 串成可驗證的練習，理解路徑、輸出、權限與訊號，避免把正式機當成試錯環境。"
publishDate: 2026-10-31T17:15:01+08:00
draft: false
featured: false
tags: [Linux, 軟體開發]
series: 主機與 Linux 維運
seriesOrder: 2
cover: ../../assets/covers/linux-basic-commands-safe-workspace.webp
coverAlt: "陶土色桌面上的綠色資料夾、文件、放大鏡與鎖，連起檔案查找、內容檢查和權限操作。"
---

看懂 `ls` 是列檔案，離能安全使用終端機還有一步。你得知道目前在哪個目錄、指令會讀取還是改寫什麼，以及沒有輸出到底代表成功、找不到，還是根本沒有查到正確位置。

這次把十個常見命令串成一個小練習：建立兩份文字檔，搜尋錯誤行，限制副本的讀寫權限，再觀察並結束自己啟動的等待程序。所有檔案都留在新建的暫存目錄，無須 `sudo`。範例以 Linux、Bash、GNU 工具及 procps 為範圍，已在隔離環境執行；其他系統或精簡容器的選項可能不同。

## 先建立只屬於這次練習的目錄

在同一個 Bash 工作階段依序執行。`mktemp` 和 `pwd` 是準備用輔助工具，`mktemp -d` 建立不與既有資料混用的新目錄。暫存目錄不適合保存正式資料。

```bash
lab=$(mktemp -d)
cd "$lab" || exit
pwd
mkdir logs backup
ls -la
```

`cd` 改變目前 shell 的工作目錄。`mkdir` 建立目錄；`ls -la` 顯示長格式及隱藏項目。輸出中應看到 `logs` 與 `backup`，以及代表目前位置的 `.`、上一層的 `..`。`pwd` 顯示所在路徑，用來核對之後的相對路徑會落在哪裡。

`logs/server.log` 從目前目錄開始找，`/var/log/...` 則從檔案系統根目錄開始。路徑用引號包住，可以避免空白被 shell 拆成多個參數。這裡沒有切到系統日誌目錄，也不要求讀取正式服務檔案。

## 產生內容，再確認複製的是哪一份

`printf` 是準備測試資料的輔助命令。這一行的 `>` 會建立或截斷目標檔案，所以只在剛才新建的目錄執行；重新執行也會覆寫這份練習資料。

```bash
printf '%s\n' 'INFO server started' 'ERROR db timeout' 'INFO listening :3000' > logs/server.log
cat logs/server.log
cp -i -- logs/server.log backup/server.log
ls -l logs/server.log backup/server.log
```

`cat` 把檔案內容寫到標準輸出。這個小檔案適合完整顯示，巨大日誌或含秘密的設定檔則不應隨手全部印出、貼到聊天或工單。

[cp](https://man7.org/linux/man-pages/man1/cp.1.html)複製來源到目的地；`-i` 在覆寫既有檔案前詢問。第一次執行時副本還不存在，通常不會提問。`--` 表示後面的參數不再當成選項，可避免以連字號開頭的檔名被誤讀。完成後兩份檔案都存在，這是複製，不是搬移。

這個副本只用來學指令。它與原檔放在同一台主機，沒有證明具備離機備份或還原能力。

## 搜尋內容時，把行號一起留下

```bash
grep -nF -- 'ERROR' logs/server.log
```

預期得到 `2:ERROR db timeout`。`-n` 顯示行號，`-F` 把模式當成固定文字，而不是正規表示式。[grep 手冊](https://man7.org/linux/man-pages/man1/grep.1.html)也區分結束狀態：一般情況下，0 代表找到符合行，1 代表沒有符合行，2 代表錯誤。

沒有印出結果時，要查是不是找錯檔案或大小寫不同，也要看是否有讀取錯誤。搜尋 `ERROR` 沒找到，只能說這次搜尋範圍內沒有符合文字，不能推論服務沒有故障。

## 看懂權限，再改自己的練習副本

`ls -l` 最左邊的字串包含檔案型態和權限。一般檔案的第一個字元是 `-`，目錄則是 `d`；接下來三組依序是擁有者、群組、其他人的 `r`、`w`、`x`。

對一般檔案，`r` 是讀、`w` 是寫、`x` 是執行。目錄上的 `x` 則是搜尋／穿越目錄的能力，不能直接套成「執行目錄」。實際存取還可能受父目錄、ACL 與其他安全機制影響。

```bash
chmod u=rw,go= -- backup/server.log
ls -l backup/server.log
```

[chmod](https://man7.org/linux/man-pages/man1/chmod.1.html)在這裡把副本設為擁有者可讀寫，群組及其他人沒有一般模式位元權限。預期基本模式是 `-rw-------`，系統也可能顯示額外的 ACL 標記。`chmod` 沒有改變擁有者，也沒有加密內容。

遇到 Permission denied 時，應核對使用者、檔案及父目錄需要的權限。不要把整個應用目錄改成所有人都能寫，更不要把遞迴改權限當成通用修復。

## 程序清單和檔案清單是兩回事

下面啟動的是自己的練習程序，`sleep` 只等待指定秒數。`&` 讓它在背景執行，`$!` 取得這個背景程序的 PID。這一段請連續在同一個 shell 執行，不要把 PID 記下來隔天再用。

```bash
sleep 300 &
lab_pid=$!
ps -p "$lab_pid" -o pid,comm,stat
kill -TERM "$lab_pid"
wait "$lab_pid"
```

`ps` 顯示程序當下狀態，這裡應能看到 `sleep`。`kill` 的功能是送訊號；未指定時通常送 TERM，而不是直接強制刪除程序。TERM 讓支援它的程式有機會處理結束流程，KILL 則不能被攔截來做清理，詳見 [kill 手冊](https://man7.org/linux/man-pages/man1/kill.1.html)。shell 可能提供內建版本，進階選項應查自己的 shell 文件。

`wait` 等待這個子程序結束。Bash 在程序被訊號終止時會回傳非零狀態，可能印出 Terminated；這是本練習的預期，不要把它包進要求每一行都成功的 `set -e` 腳本。

正式服務常由 systemd 或容器管理器管理，終止程序可能立刻觸發重啟。要先確認服務管理方式和處置流程。PID 也會被重用，舊截圖中的數字不能證明現在仍是同一個程序。練習不對 nginx、資料庫或其他既有服務發送訊號。

## 刪除前核對路徑，保留互動確認

這一步只處理剛建立的練習副本。再次列出完整目標，再執行需要逐項確認的刪除：

```bash
ls -l -- "$lab/backup/server.log"
rm -i -- "$lab/backup/server.log"
ls -la -- "$lab/backup"
```

回答 `y` 才刪除，回答 `n` 就保留。一般命令列 [rm](https://man7.org/linux/man-pages/man1/rm.1.html)不會幫你移入桌面垃圾桶，也沒有內建復原步驟。確認文字只能降低誤操作風險，不是備份。

這裡不用 `-r` 遞迴刪目錄，也不用 `-f` 略過確認。來源檔 `logs/server.log` 仍保留，backup 目錄也保留；若回答 `y`，目錄應為空，方便核對操作的影響。離開練習前可以再執行 `pwd` 和 `ls -la`，確認沒有在其他路徑操作。

## 驗收一次完整操作

練習完成時，應能說明五件事：目前工作目錄在哪裡、來源與副本如何區分、錯誤文字位於哪一行、權限改到了誰，以及送出的訊號影響哪個自己建立的程序。最後確認原始檔仍在，副本是否刪除則符合你剛才的選擇。

如果把 `grep -nF 'ERROR'` 換成搜尋不存在的 `WARN`，沒有輸出代表什麼？如果 `cp -i` 詢問是否覆寫，你會怎麼確認目的地？能回答這些問題，再接著讀[主機變慢排查](/blog/linux-slow-host-diagnostic-sequence/)，指令輸出才會成為判斷依據。

主題來源是 Afzal Web Solutions 的[十個 Linux 命令圖卡](https://www.facebook.com/reel/1059228207136968)。這裡把圖卡中的命令改成有範圍、有預期結果的練習；命令語義依工具手冊查核。更多閱讀順序見[主機與 Linux 維運](/blog/linux-operations-reading-path/)。
