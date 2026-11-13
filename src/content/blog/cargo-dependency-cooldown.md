---
title: "Cargo 的依賴更新等待期"
description: "Rust 1.100 讓 Cargo 可依套件發布時間篩選版本。說明等待期設定、Cargo.lock 的保留行為，以及緊急修補與 CLI 安裝的例外。"
publishDate: 2026-11-13T10:08:04+08:00
draft: false
featured: false
tags:
  - 開發工具
  - 資訊安全
cover: ../../assets/covers/cargo-dependency-cooldown.webp
coverAlt: "奶油色桌面上的陶土色包裹與玻璃沙漏，以等待一段時間再採用套件版本的概念呈現依賴更新等待期。"
---

[Rust 1.100 在 2026 年 11 月 12 日發布](https://blog.rust-lang.org/2026/11/12/Rust-1.100.0/)，Cargo 同時穩定支援依賴版本的最低發布時間 `min-publish-age`。團隊可以要求新版本先等幾天，再讓日常依賴更新選到它，留出觀察撤版、安全通報與社群回報的時間。

這次查核以 11 月 13 日讀取的 Rust 公告及 Cargo 文件為據，沒有安裝 Rust 1.100 或實際解析套件。下列三天設定、CI 安排與驗收案例都是導入建議，並非供應鏈攻擊攔截率的實測結果。

## 設定放在哪裡

等待期是 Cargo 設定，放在專案的 `.cargo/config.toml`。設定示例使用文件語法，尚未在實際專案執行：

```toml
[registry]
global-min-publish-age = "3 days"
```

[設定文件](https://doc.rust-lang.org/cargo/reference/config.html#registryglobal-min-publish-age)列出的預設值是 `"0"`。因此升級 Rust 並不會自動替依賴加上三天等待期。個別 registry 可以用 `registries.<name>.min-publish-age` 覆寫全域值。

對應用團隊，我會先把這個設定交給「更新依賴的工作」使用，再確認開發機與 CI 讀到同一份設定。若從 workspace 根目錄執行 Cargo，要把設定放在能被該執行位置讀到的地方。Cargo 不會因此讀取每個成員 crate 目錄下的設定。環境變數與命令列覆寫也應納入檢查，避免更新機器實際套用不同規則。

三天只是起始假設。更新頻率低的內部服務可以評估較長時間；依賴安全修補頻繁的服務，則需要先定義緊急更新程序。

## 已鎖定的版本仍會保留

[版本解析文件](https://doc.rust-lang.org/cargo/reference/resolver.html#publish-age)說明，`resolver.incompatible-publish-age` 預設為 `deny`，解析器會略過尚未達到等待時間的版本，但已存在 `Cargo.lock` 的版本是例外。

假設更新工作昨天把一個新版本寫入 lockfile，今天才加入三天等待期。這個設定不會回頭把該版本換成舊版。若團隊已懷疑那次更新有問題，仍需辨識實際版本、檢查變更並決定移除或替換，不能把加入設定當成處置完成。

應用的更新流程可以分成兩步。更新工作依等待期產生 lockfile 變更，審查通過後提交；建置工作使用已審查的 lockfile，檢查是否出現非預期變更。等待期負責減少過早採用新版本，lockfile 則讓每次建置的版本選擇可以追查。

## 緊急修補需要明確例外

遇到已確認漏洞，而修補版才剛發布時，機械式等待也會延長暴露時間。依 Rust 公告的一次更新覆寫方式，可設定 `CARGO_RESOLVER_INCOMPATIBLE_PUBLISH_AGE=allow`，搭配 `cargo update` 的 `--precise` 指定目標版本。

這裡應保留一次變更審查。記錄公告、目標套件與版本，再檢查整份 lockfile 差異。Cargo 的 resolver 文件指出，這種組合也可能帶入該版本的傳遞依賴，不能只審查最上層的一行版本號。更新完成後恢復日常等待設定，避免把例外變成永久預設。

新版本通過等待期，也不代表已完成安全審查。若惡意程式未被發現，時間經過後仍可被選中。等待期應配合來源與依賴差異檢查，而不是取代它們。

## CLI 安裝另作管理

Rust 發布公告另外列出兩項容易漏掉的範圍。registry 的版本紀錄若沒有 `pubtime`，Cargo 不會依發布時間擋下該版本；`cargo install` 也忽略最低發布時間，包括欲安裝的 crate 及其依賴。

因此，應用依賴有等待期，不代表 CI 裡臨時安裝的 CLI 也受到相同限制。團隊需要另列工具版本、來源及更新方式。指定 CLI 的版本可限制頂層選擇，但還要確認該工具依賴如何解析，不能把所有安裝路徑都算成同一項保障。

## 導入時驗收什麼

可先在非正式環境安排以下案例，留下 Cargo 版本、設定來源與 lockfile 差異：

- 新發布版本尚未滿三天，例行更新應保留符合條件的較舊版本，或在無解時明確失敗。
- 新版已在 lockfile，加入等待期後應確認它仍被保留，避免誤認為設定會自動降版。
- 指定安全修補版的例外更新，逐項檢查連帶變動的依賴，並確認例外沒有留在常態 CI 設定。
- CLI 安裝與自訂 registry 分開檢查，列明哪些路徑不受時間篩選約束。

從一個應用的依賴更新工作開始試行，先確認團隊能看懂被延後的版本與例外變更，再決定要把等待期擴大到哪些專案。
