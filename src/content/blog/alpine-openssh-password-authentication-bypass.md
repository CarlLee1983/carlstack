---
title: "Alpine 的 key-only 帳號仍可能被密碼登入，修補要驗收到 sshd 重啟"
description: "Alpine 11 月 5 日公告 OpenSSH 密碼驗證繞過。核對 musl、PAM、帳號欄位與密碼登入條件，辨識回補版本，並把套件更新、sshd 重啟及登入紀錄調查分開驗收。"
publishDate: 2026-11-06T10:01:21+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 事件應變
  - 系統設計
series: 現代網路協定與 API 平台架構
seriesOrder: 28
cover: ../../assets/covers/alpine-openssh-password-authentication-bypass.webp
coverAlt: "薄荷綠山景前的白色紙雕城門，門閂出現星形缺口，旁邊懸著尚未裝上的紅色修補片"
---

Alpine Linux 在 2026 年 11 月 5 日要求執行 `sshd` 的管理者更新 OpenSSH，並重啟服務。這次最容易誤判的是只用 SSH key 的帳號：帳號沒有設定密碼，不代表伺服器已關閉密碼驗證。符合公告條件時，這類帳號仍可能被繞過登入。

我會把修補工單拆成套件版本、執行中的服務，以及可疑登入三項證據。`apk` 更新成功只完成第一項；舊的 `sshd` 還在執行，或機器在修補前已遭入侵，都不能結案。

以下依 11 月 6 日查閱的 [Alpine 官方公告](https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/)與 [OpenSSH 10.6p2 release notes](https://www.openssh.org/releasenotes.html#10.6p2)整理。官方 CVE 紀錄已登錄為 [CVE-2026-123158](https://www.cve.org/CVERecord?id=CVE-2026-123158)，因此不沿用 Alpine 初版公告的「尚無 CVE」狀態。指令供管理者在自己獲授權的 Alpine 主機操作，未在讀者的主機上執行，也沒有重現攻擊。

## 盤點對象是開著 sshd 的主機

OpenSSH 將這次問題列為 critical security workaround，範圍是使用 musl libc、且沒有使用 PAM 的 Linux 系統。Alpine 預設的 `openssh-server` 就是非 PAM 組建。使用 `openssh-server-pam` 但設定 `UsePAM no`，同樣不能排除。

依 Alpine 公告，還要同時檢查下列條件：

- `PasswordAuthentication yes`，且攻擊者能連到 SSH 服務。
- 可登入目標帳號的密碼欄位是 `*`。
- 主機至少有另一個本機帳號，密碼雜湊以 `$5$` 或 `$6$` 開頭。

因此，「我們只發 SSH key」不足以排除風險。管理者後來替別的帳號設定密碼，也可能改變整台主機的暴露條件。相反地，沒有執行 `sshd` 的 Alpine 容器，不在這個遠端 SSH 攻擊入口內；不能看見 Alpine base image 就宣告整個容器平台遭到影響。

關閉密碼驗證的系統，以及確實使用 PAM 的 `openssh-server-pam`，是官方列出的不受影響情況。`*` 與 `!` 也不能混為一談：公告指出 `!` 鎖定帳號無法以密碼或 key 登入。不要為了消除掃描結果，直接把所有 key-only 帳號改成鎖定，造成管理通道中斷。

## 錯誤字串剛好等於帳號的密碼欄位

Alpine 對機制的說明是：非 PAM 路徑以 `crypt()` 計算輸入密碼的雜湊，再與儲存欄位比較。目標欄位過短、無法提供 salt 時，sshd 會借用另一個帳號的 salt。特定超長輸入使 musl 回傳錯誤指示字串 `*`，結果又與目標帳號儲存的 `*` 相等。

這個案例適合補進驗證函式的測試清單。當函式把「失敗」與「合法結果」都包在字串裡，呼叫端必須先辨認失敗，再做相等比較。密碼雜湊強度沒有變弱，問題出在錯誤結果被當成驗證成功的材料。

OpenSSH 與 musl 維護者對責任歸屬有不同表述：[musl 維護者的公告](https://www.openwall.com/lists/musl/2026/11/05/4)認為是呼叫端使用錯誤，OpenSSH release notes 則認為根因在 sshd 外部，但可以在 sshd 避免。維運決策不需要等這項分歧結束，10.6p2 與 Alpine 回補套件已有處置路徑。

## 回補版本要按 Alpine 分支核對

單看 SSH banner 是否低於 10.6p2，會把有回補的穩定分支也列成未修補。Alpine 公告列出的修復套件如下，判斷時要保留 `_p` 與 `-r` 的完整版本：

- edge：`10.6_p2-r0`。
- 3.24：`10.3_p1-r2`；3.23：`10.2_p1-r1`。
- 3.22：`10.0_p1-r11`；3.21：`9.9_p2-r1`。
- 3.20：`9.7_p1-r6`；3.19：`9.6_p1-r3`。
- 3.18：`9.3_p2-r4`；3.17：`9.1_p1-r7`；3.16：`9.0_p1-r6`。

這次舊分支也取得緊急回補，不代表恢復一般維護。Alpine 公告指出 3.21 已於 2026 年 11 月 1 日結束支援；仍在這些分支上的主機，修補後還要安排版本遷移。

以下為主機上的唯讀盤點，不會輸出密碼雜湊。執行 `sshd` 檢查可能需要 root 權限：

```sh
cat /etc/alpine-release
apk info -v openssh openssh-server openssh-server-pam
sshd -T | grep -E '^(passwordauthentication|usepam|permitrootlogin) '
```

沒有安裝的套件可能顯示查無項目，應記錄實際安裝的是哪一種 server。`sshd -T` 是讀取設定後的結果，不是查詢舊行程目前採用的設定；若服務使用自訂 `-f` 檔案，檢查時也必須指定相同檔案。

若設定有 `Match`，還要以實際帳號及來源條件檢查。例如下列是範例值，須換成要驗收的管理帳號、客戶端主機名稱及來源 IP：

```sh
sshd -T -C user=deploy,host=admin.example,addr=192.0.2.10 \
  | grep -E '^(passwordauthentication|usepam|permitrootlogin) '
```

`-T`、`-C` 的用途可對照 [sshd 手冊](https://man.openbsd.org/sshd)。一份全域輸出不能代表每個 `Match` 分支，驗收紀錄應列出檢查過哪些登入條件。

## 套件更新後，要讓新服務接手

Alpine 公告提供的更新方式如下，適用使用 OpenRC 管理 sshd 的 Alpine 主機，需以 root 執行。這會升級套件，不只 OpenSSH，應先依團隊變更流程評估其他服務的影響：

更新前先確認另一條可用的 key 登入及主控台／救援通道，重啟後從新終端開一個新的 SSH 連線，確認指定帳號可以使用 key 登入，再關閉原本連線。

```sh
apk upgrade -U -a && sshd -t && rc-service sshd restart
```

**升級或設定檢查任一步失敗，就停止重啟，保留管理連線並處理錯誤。**

若暫時不能更新，官方替代措施是設定 `PasswordAuthentication no`，檢查設定並重啟。要處理主設定、Include 與 Match 規則，不能只在檔案末尾加一行便假設生效。Alpine 3.19 之前的預設設定也不會自動讀取目前常見的 drop-in 目錄；實作前應依該版本及實際 Include 配置處理。完整修改範例與還原方式保留在官方公告，避免把有版本前提的修改腳本直接套進所有主機。

我建議工單記錄四個結果：完整套件版本、`sshd -t` 成功、重啟時間與服務狀態，以及重啟後新連線的驗證結果。若採用暫時關閉密碼登入，再附上各必要 `Match` 條件的 `passwordauthentication no` 輸出。這些證據比「掃描器變綠」更能解釋服務現在處於什麼狀態。

## 雲端映像與正在執行的實例要分開處理

Alpine 特別提醒官方 tiny-cloud 映像：部分舊映像的 `alpine` 帳號使用 `*` 欄位，且可免密碼執行 `doas`。初次啟動時未必滿足利用條件，但管理者之後新增密碼帳號，可能讓原本的 key-only 使用者成為入口。預設 `PermitRootLogin prohibit-password` 保護 root 的直接密碼登入，無法阻止已登入的其他帳號再依既有權限提升為 root。

公告指出 3.21.10、3.22.8、3.23.8、3.24.4 的映像已含修補套件。更新建機模板不會替換已經啟動的服務，因此要各自列出新建實例的映像版本與現役實例的修補結果。這項檢查也能接到 [NetScaler 修補與事件調查分開驗收](/blog/netscaler-cve-2026-88779-saml-kev-remediation/)的處置方式。

## 修補完成後，仍要檢查異常登入

Alpine 建議在 `/var/log/messages` 查找原本沒有密碼的帳號出現 `Accepted password for`，並檢查 `doas` 使用、新帳號、檔案及 authorized keys。下列命令只找候選紀錄，不能單獨證明或排除入侵：

```sh
grep 'Accepted password for' /var/log/messages
```

還要依自己的 log 保留方式檢查輪替檔案與集中式紀錄，並和帳號設定及變更時間對照。找不到紀錄，可能只是日誌已輪替或未收集。若無法排除不明登入，依事件應變流程保全證據、隔離與重建，不能把打上修補程式當作清除入侵者。

下一步可以把現有 Alpine 資產清單加上「是否執行 sshd」「完整套件版本」「最後重啟時間」「新 key 連線驗收」四欄。先完成對外暴露主機，再補建機映像與內網管理節點；缺少重啟或登入證據的項目繼續保持未結案。
