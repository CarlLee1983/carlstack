---
title: "公開 repo 的 HTTPS clone 突然要認證，CI 該補哪一段？"
description: "GitHub 10 月 19 日公告，異常流量期間可能暫時要求部分公開 repo 的 HTTPS clone、fetch 認證。從乾淨 CI 的失敗訊息定位範圍，再區分 GITHUB_TOKEN、GitHub App installation token 與無法認證時的退避重試。"
publishDate: 2026-10-20T10:05:20+08:00
draft: false
featured: false
tags:
  - DevOps 與 CI/CD
  - 開源專案
cover: ../../assets/covers/github-public-https-ci-auth.webp
coverAlt: "深綠紙雕背景中，帶圓形憑證的紙帶通過琥珀色小閘門，其他紙帶停在入口，呈現部分流量暫時需要認證的情境。"
---

想像一條每天重建的 CI：runner 是乾淨的，沒有個人登入紀錄，第一步從 GitHub 用 HTTPS clone 一份公開原始碼。昨天還能跑，今天程式一行沒改，卻在下載階段停住，後面的測試完全沒開始。

你在筆電重跑成功，同事便問：「會不會是 runner 壞了？」但筆電可能早就有 credential helper 幫忙帶入認證。兩邊使用同一個網址，不代表發出去的請求有同一種身分。

[GitHub 2026 年 10 月 19 日公告](https://github.blog/changelog/2026-10-19-some-git-over-https-may-temporarily-require-authentication/)增加了一個需要納入排查的條件：異常流量期間，部分公開 repository 的 HTTPS clone、fetch 可能暫時被要求認證。對無人值守的 CI，我會把「checkout 靠誰的身分完成」寫進工作流，而不是等下一次匿名下載碰到限制才臨時找憑證。

以下以假設案例說明診斷與修改方式，查核截至 10 月 20 日。本文沒有重現這項保護、執行示例工作流或建立 token；文中的驗收是建議測試，沒有宣稱已在真實 CI 跑綠。

## 公告涵蓋部分匿名下載，不能拿來解釋所有 403

官方說明，保護會盡量限縮到與異常流量相關的訊號，但正常請求可能共用這些訊號而被波及。受影響的操作會收到要求認證的訊息；可以認證後重試，也可以等保護解除後再匿名重試。這項措施適用 github.com 各方案，並非公開 repo 一律改成必須登入。

已認證的 HTTPS Git 操作、SSH Git 操作、push，以及無關的 GitHub 網頁與 API 流量，不在這項措施的影響範圍。公告沒有提供可拿來判定命中的固定 HTTP 狀態碼、完整錯誤字串或解除時間。

所以我會保留失敗步驟的完整 stderr，再確認它是不是「公開 repo、HTTPS、clone 或 fetch、當次沒有認證」這個組合。只看到 `403`，證據還不夠。若出現 `Repository not found`，也應回頭檢查網址、repo 是否存在與存取權限；[GitHub 的 clone 排錯文件](https://docs.github.com/en/repositories/creating-and-managing-repositories/troubleshooting-cloning-errors)列出這些不同原因，不能全歸到新措施。

另外兩種情況也要分開處理：已經帶認證仍失敗，要查 token 有效性與權限；DNS、TLS、代理伺服器或服務事故造成的連線問題，要沿著網路與服務狀態查。補一顆 token 不會替它們提供共同解答。

## 找到失敗的是哪一次下載，才知道憑證要放哪裡

同事說「我們已經用 actions/checkout」，仍值得追問：紅燈真的出在那一步嗎？常見的另一種路徑是主 repo checkout 成功，後面的 shell 再匿名 clone 工具 repo；或者 Docker build 裡另跑一次 Git。主流程有認證，不表示新程序或另一個執行環境已接到它。

我會在失敗紀錄旁補上四項資料：實際執行 clone／fetch 的步驟、目標 host 與 repo、使用的傳輸協定，以及該步驟預期從哪裡取得憑證。紀錄憑證來源名稱即可，不要把 token、認證標頭或含密碼的 URL 貼進工單。

[Git 的 credential 文件](https://git-scm.com/docs/gitcredentials)說明，Git 能透過 helper 或 askpass 等機制取得認證。這也解釋了為什麼「我電腦可以」不足以替乾淨 runner 排除問題。排查時應比較憑證來源，無須為了模擬 CI 去清掉開發者的全域設定。

## Actions 先用內建 token，不必多發一顆個人 PAT

對 GitHub Actions 的主 repository checkout，官方公告推薦內建 `GITHUB_TOKEN`。[checkout 文件](https://github.com/actions/checkout/tree/v4)的 token 輸入預設就是 `github.token`，並建議給 `contents: read`。若原本已使用預設 token，這次公告本身不足以構成更換憑證的理由。

下面是只下載本次工作流 repo、之後不再執行遠端 Git 操作的示例，本文未執行。為了讓認證行為可核對，使用已查閱的 checkout v4 文件；正式專案應沿用團隊審核過、與 runner 相容的版本，並固定完整 commit SHA，不必因為本文順便更動 action 版本。

```yaml
name: checkout-read-only
on: workflow_dispatch

jobs:
  inspect:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ github.token }}
          persist-credentials: false
      - name: Confirm downloaded commit
        run: git rev-parse HEAD
```

這裡明寫 `token` 是為了讓審查者看得見來源，並不是漏寫就會變成匿名。`persist-credentials: false` 也不會取消 checkout 當下的認證；它讓憑證不留給後續 Git 指令使用。假如下一步還要 `git fetch`，就必須另行設計那一步的認證，不能照抄後假設它也已涵蓋。

權限只給讀取內容即可。依 [GITHUB_TOKEN 文件](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)，權限能在 workflow 或 job 層級縮限；解決下載失敗，不需要順手加入 push、issue 或套件發布權限。

還有一條邊界：內建 token 的權限限於該工作流 repository，不能據此取得另一個私有 repo 的讀取權。若失敗的是跨 repo 下載，應回到目標 repo 的授權安排，而不是把主 repo 的權限一口氣開大。

## 外部 CI 的 App token，要連同生命週期一起設計

對其他 CI 系統，公告優先建議 GitHub App installation access token。[GitHub App 文件](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation)確認，它可用於 HTTP Git 存取，需有 Contents 權限；一般 installation token 一小時到期，申請時還能縮小 repo 與權限範圍。

我的導入方式會是由受保護的 CI 認證元件，在需要下載前取得短效 token，限制到必要 repository 與 Contents 讀取權限，再交給該次 Git 操作。App 私鑰留在受控的 secrets 系統，不能塞進建置映像或交給任意 PR 程式讀取。取得短效 token 並沒有消除長期私鑰的管理責任。

具體要驗證的是：工作排隊太久時是否重新取得 token、後續 fetch 發生在有效期外怎麼處理、job 結束後暫存憑證如何清理。單純把今天產生的 token 存成永久 CI secret，下一次排程仍可能失敗。

這也有適用前提：團隊必須能取得涵蓋目標 repo 的適當授權，不能假設自己的 App 可以安裝到任意第三方 repo。若當下無法合法配置適合的認證，就保留等待後匿名重試的路徑。公告也允許 PAT，但我不會把維護者的個人 PAT 複製到每個 runner 當成預設修法。

官方文件用含 token 的 URL 示意協定用法；實際 CI 我會優先採用平台的安全憑證注入或 Git credential 機制，避免認證值留在 remote URL、shell trace 與建置紀錄。這是本文的部署建議，不代表所有 CI 平台都有同一個設定按鈕。

## 驗收要看乾淨 runner，也要看後面的 fetch

第一輪驗證我會選沒有正式部署權限的測試 job，使用乾淨 runner，確認 checkout 成功，並將 `git rev-parse HEAD` 與預期 commit 比對。這只能證明該次下載正確，不能證明 GitHub 永遠不會再失敗，也不能單憑成功反推先前一定命中這項保護。

若工作流還包含其他 repo、submodule 或容器內下載，就逐項驗證，不以第一個 checkout 綠燈代表全部完成。再檢查日誌與產物沒有 token、帶認證的 URL 或私鑰，並確認短效憑證與暫存檔的清理路徑。這些檢查應放在測試環境完成，不能為了驗證清理而把秘密印出來。

無法認證的工作，我會設有限次數、帶退避的重試，把總等待時間限制在該建置可接受的範圍；用完預算就清楚失敗。這是工程上的重試策略，GitHub 公告並未承諾等待幾秒便能解除保護。密集重跑只會讓值班者更難看清原始錯誤。

回到開頭那條 CI，現在就能做的一步，是找出所有實際執行 `git clone`、`git fetch` 的位置，在每一處旁邊寫清楚憑證來源與失敗後的處理方式。主 repo 用內建 token、外部 CI 管理短效身分、無法認證的來源有等待上限，下一次下載突然被攔下時，工單就能直接指向要修的那一步。

若同一條 CI 後面還有套件發布，可接著看 [pnpm OIDC audience 與憑證回退](/blog/pnpm-oidc-audience-credential-fallback/)，確認發布步驟實際用了哪條認證路徑。下載與發布需要分開授權；這不構成替 clone 增加發布權限的理由。
