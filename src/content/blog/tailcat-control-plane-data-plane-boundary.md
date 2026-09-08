---
title: "Tailcat 的工程判斷：拆掉控制平面後，安全連線的責任去哪裡？"
description: "從 Tailscale 新開源的 Tailcat 出發，拆解 WireGuard、NAT traversal 與 DERP 資料平面可被獨立使用的條件，以及身分、ACL、金鑰輪替與事故復原為何不能一起消失。"
publishDate: 2026-09-08T12:00:00+08:00
draft: false
featured: false
cover: ../../assets/covers/tailcat-control-plane-data-plane-boundary.png
coverAlt: "兩台伺服器以發光加密通道穿越半透明邊界，中央是一枚一次性能力憑證"
tags:
  - "網路架構"
  - "NAT 穿透"
  - "WireGuard"
  - "零信任"
  - "開源專案"
series: 現代網路協定與 API 平台架構
seriesOrder: 11
repositoryUrl: https://github.com/tailscale/tailcat
---

Tailcat 在 2026 年 8 月底開源。它把 Tailscale 的資料平面抽出來：保留 WireGuard 加密、NAT traversal 與 DERP relay，卻不需要 Tailscale 帳號、tailnet、管理者權限或控制平面。官方把它描述為「沒有 Tailscale 的 Tailscale」，更精確的說法是：它是用 Tailscale 資料平面做成的 netcat。[官方公告](https://tailscale.com/blog/tailcat)

這個設計很適合一個窄而真實的需求：兩台位在不同網路的機器，只需要安全地傳一次檔、轉發一個 port，或在短時間內建立 SSH 連線。它不要求先把機器納入既有 VPN，也不改動系統路由表或 DNS。

但把控制平面拿掉不是「少一個 SaaS 依賴」而已。控制平面原本承接的身分、裝置發現、ACL、金鑰生命週期與故障復原，會一起回到使用者或應用程式手上。本文的結論是：**Tailcat 可以取代一次連線的協調，但不能取代長期存取的治理。**

## Tailcat 保留了什麼，又刻意移除了什麼

Tailcat 以使用者空間程式運作，利用 Tailscale 的 `magicsock` 尋找直連路徑；連線初期可經由 DERP relay 建立，再在可行時升級為端對端 UDP。資料仍以 WireGuard 加密，且不需要 root 權限。

| 能力       | Tailcat 的做法                                 | 不再由 Tailcat 處理的事       |
| ---------- | ---------------------------------------------- | ----------------------------- |
| 兩端連線   | 用短期 tailcat address 在帶外交換連線資訊      | 使用者與裝置的集中註冊        |
| 加密與穿透 | WireGuard、NAT traversal、DERP fallback        | 組織層的網路政策              |
| 服務暴露   | CLI 或 Go library 建立 listener 與 client      | 可搜尋的裝置名稱與服務目錄    |
| 身分       | address 可作為連線憑證，也可用 client key 限制 | 自動化的帳號、群組與 ACL 管理 |

最小的傳檔或 TCP 服務看起來會像這樣：

```bash
# Server：啟動本機 8080，取得一次性的 tc... address
tailcat serve 8080

# Client：透過安全管道取得 tc... address 後連線
tailcat tcEXAMPLE_ADDRESS 8080
```

這段流程省掉的不是加密，而是「先建立共同控制面」的前置工作。這也是它比傳統 VPN 設定更適合臨時任務的原因。

## 真正的產品邊界：資料平面不是完整 VPN 體驗

Tailscale 社群在發布討論裡很快指出一個容易被忽略的差別：WireGuard 是傳輸層，完整 VPN 體驗還包括裝置身分、服務發現、ACL、金鑰輪替與壞掉時的復原能力。[r/Tailscale 的發布討論](https://www.reddit.com/r/Tailscale/comments/1w3ht5j/announcement_tailcat_tailscale_without_tailscale/) 也出現了相反但同樣重要的訊號：有使用者只想從 Proxmox 快速把檔案送到 MacBook，不想查 IP、改 `rsync` 或先配置 VPN。

這兩種需求不衝突，它們只是處在不同的生命週期。

| 場景                                        | 選擇                              | 停止規則                                     |
| ------------------------------------------- | --------------------------------- | -------------------------------------------- |
| 一次性診斷、短期檔案交換、臨時 port forward | Tailcat                           | address 不應被長期保存或公開                 |
| 團隊共享內網服務、跨環境操作、持續 SSH 存取 | 有控制平面的 Tailscale 或同類系統 | 需要可審計身分與撤銷能力時，不要自行補控制面 |
| 要把穿透能力嵌入產品                        | Tailcat Go library                | 先設計應用自己的授權、address 分發與撤銷模型 |

社群已經開始驗證第三種用法。TailSocks v1.5 把 Tailcat 接到 SOCKS5、HTTP 與 TCP proxy，使單一應用程式可走指定出口，而不必讓整台電腦加入 tailnet。另一個使用者則把它放進 Minecraft modpack，讓朋友安裝後直接看見私有 server。[TailSocks 討論](https://www.reddit.com/r/Tailscale/comments/1w0gthe/tailsocks_now_supports_tailcat_socks5_and_http/) 與 [Minecraft 實作](https://www.reddit.com/r/Tailscale/comments/1w7jphd/i_made_a_private_minecraft_server_using_tailcat/) 的共同點是：Tailcat 被當成產品內的安全 transport，而不是另一個需要使用者理解的網路管理介面。

## Address 是能力憑證，不是可公開的 URL

Tailcat 的預設 address 內含伺服器公開金鑰與獨立的 WireGuard pre-shared key。知道 address 的人，就具備嘗試連線的能力。因此一次性 address 是很好的短期協作工具，卻不是可以貼進 issue、文件或公開 DNS 的 URL。[README 的安全說明](https://github.com/tailscale/tailcat#security) 對這點說得直接：若把 address 發布在 DNS TXT，服務端必須額外要求 client key 或 SSH public key。

這裡的工程決策不能只看「資料有沒有加密」。加密保護傳輸中的內容，不能回答誰能連、何時失效、成員離開後如何撤銷、事故後如何追查。若連線存活時間超過一次任務，或 address 開始被複製到自動化設定，能力憑證模式就已經越界。

> [!WARNING]
> 不要公開 `no-auth-ssh` 的 address。它等同把可登入的 shell 交給看到該值的人。公開 DNS 只適合已用 `--allow` 或 `--ssh-authorized-keys` 加上第二層身分驗證的服務。

## 對應用開發者的最小責任清單

若要把 Tailcat 當成 transport，至少要先回答四個問題：

1. **誰取得 address？** 把 address 放在既有的 authenticated API、邀請流程或端對端加密訊息內，不要放進可被搜尋的記錄。
2. **多久失效？** 預設使用 ephemeral key；只有真的需要穩定 endpoint 時才保存 key，並定義輪替與撤銷程序。
3. **誰能連上？** 對長期服務使用 `--allow` 限制 client key；對 SSH 再使用 `--ssh-authorized-keys`，不要把 address 當成唯一驗證。
4. **失敗時怎麼看見？** 記錄 address 的發放、使用者授權與連線失敗，但不要把 secret-bearing address 寫進一般 log。

最新的 [v0.2.0 release](https://github.com/tailscale/tailcat/releases/tag/v0.2.0) 已提供 Linux、Windows 的預編譯套件與 container image，macOS 可透過 Homebrew 安裝。這降低了嘗試門檻，但專案也明確表示 CLI、Go API 與 wire format 尚未承諾穩定性。把它接進正式產品前，應把 version pin、相容性測試與撤回方案寫進交付流程。

## 下一步：先選擇你要省掉的是什麼

Tailcat 最值得學的不是一條新指令，而是一個模組邊界：資料平面可以獨立提供「讓兩端安全地通起來」的能力；控制平面則負責讓這種能力在組織裡可理解、可撤銷、可治理。

下一次遇到「我只想讓兩台機器現在通一次」的需求，可以先用 Tailcat 驗證 transport 是否足夠。當需求變成「讓一群人持續安全地存取一組服務」時，停止補洞，回到有身分與政策的控制平面。
