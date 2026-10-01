---
title: "npm Trusted Publishing 支援 dist-tag：CI/CD 徹底淘汰長效 Token 的最後一塊拼圖"
description: "npm 與 GitHub 宣布 Trusted Publishing 新增 opt-in dist-tag 權限。剖析短效 OIDC 憑證如何授權 release 標籤維運、爆炸半徑隔離設計，以及消除專案內最後一組 NPM_TOKEN 的具體配置。"
publishDate: 2026-10-01T12:20:00+08:00
draft: false
featured: false
tags:
  - 安全架構
  - 系統設計
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 45
cover: ../../assets/covers/npm-trusted-publishing-dist-tag-permissions.jpg
coverAlt: "重型金庫大門前，金屬鑰匙轉變為由透明晶光構成的短效虛擬鑰匙，並連向三條分流軌道，象徵以短效 OIDC 憑證精確隔離不同發布通道的標籤權限。"
---

在過去幾年，開源生態為了抵禦供應鏈攻擊，積極推動「可信發布（Trusted Publishing）」：透過 GitHub Actions 等 CI/CD 平台的短效 OIDC 憑證向 npm Registry 換取發布授權，讓開發者不再需要在儲存庫中存放長效的 `NPM_TOKEN`。

然而，許多嚴謹維護 release 流程的團隊卻發現了一個尷尬的破綻：專案中的長效 Token 依然拔不掉。原因在於，當套件完成發布後，若需要調整發布標籤（例如將 Canary 升級為 Latest、或透過 `npm dist-tag` 管理 Next/Beta 版本通道），先前的 Trusted Publishing 並不支援這項操作，團隊仍被迫在 GitHub Secrets 保留一組具備讀寫權限的長效 Token。

[2026 年 9 月 30 日，GitHub 與 npm 正式發布公告，為 npm Trusted Publishing 加入了可選擇性啟用的 dist-tag 權限（Opt-in dist-tag permissions）](https://github.blog/changelog/2026-09-30-opt-in-dist-tag-permissions-for-npm-trusted-publishing/)。此項功能要求使用 **npm CLI 11.21.0+** 或 **12.2.0+**。

我的判斷是：**這項更新補齊了前端供應鏈安全的最後一個死角。npm 沒有偷懶地將 dist-tag 直接併入發布權限，而是堅持採「預設關閉、獨立勾選」的爆炸半徑隔離策略。這讓發布管線真正具備了最小權限（Least Privilege）的實踐條件。**

## 為什麼「發布代碼」與「管理標籤」必須嚴格分離？

在直覺上，有人可能會認為「既然我都能 publish 一個新版本了，為什麼不能順便改個 tag？」這種想法低估了版本指標在現代軟體分發中的資安破壞力：

- **Rollback 劫持與降級攻擊（Downgrade Attack）**：
  如果某個遭到入侵的 CI/CD 工作流擁有了無限制的 dist-tag 權限，攻擊者不需要發布任何新代碼，只需悄悄呼叫 `npm dist-tag add my-pkg@1.0.2 latest`，就能直接將全世界新安裝的使用者「降級」回一個已知存在重大遠端代碼執行漏洞的舊版本。
- **繞過代碼審查的暗渠**：
  許多團隊在 `main` 分支的代碼發布設有嚴格的 Peer Review 與 CI 測試門檻，但日常的 Canary 發布或維運腳本權限較為寬鬆。若權限未分離，攻擊者只需控制一個低權限的預發布腳本，就能將未經審核的預發布包提升為正式的 `latest`。
- **無靜默擴權（No Silent Capability Escalation）**：
  npm 堅持所有既有的 Trusted Publishing 配置必須由管理員手動至後台勾選 **「Allow npm dist-tag」**，確保平台功能演進不會在維護者不知情的情況下擴大現有 CI 的潛在爆炸半徑。

## 短效 OIDC 管理 dist-tag 的運作架構

在全新的機制下，所有標籤維運完全透過短效 JWT 憑證完成：

1. **GitHub Actions 申請 OIDC Token**：工作流透過宣告 `permissions: { id-token: write }`，向 GitHub OIDC Provider 請求一組攜帶儲存庫名稱、觸發事件、Ref 與 Workflow 檔案路徑的短效 JWT。
2. **與 npm Registry 交換臨時權限**：npm CLI 自動截取環境中的 OIDC 憑證並送交 Registry。
3. **宣告比對與授權執行**：npm Registry 檢查該 Token 的來源屬性是否精準匹配 Package 設定中開啟了「Allow npm dist-tag」的條目。驗證通過後，在當次 Session 內授權執行標籤增刪。

### 乾淨無 Token 的 GitHub Actions Workflow 示範

不再需要任何 `NODE_AUTH_TOKEN` 或存放在 Secrets 中的密鑰：

```yaml
name: Release Channel Promotion
on:
  workflow_dispatch:
    inputs:
      version:
        description: "Target package version to promote"
        required: true
      tag:
        description: "Target dist-tag (e.g. latest, next)"
        required: true

permissions:
  contents: read
  id-token: write # 啟動 OIDC 短效憑證必備

jobs:
  promote-tag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      # 確保 npm CLI 符合最低支援版本
      - name: Ensure modern npm CLI
        run: npm install -g npm@^11.21.0

      # 直接執行標籤更新，完全免密鑰
      - name: Promote dist-tag
        run: |
          npm dist-tag add my-awesome-pkg@${{ github.event.inputs.version }} ${{ github.event.inputs.tag }}
```

## 打造三層最小權限的 CI/CD 發布矩陣

配合 npm 在 2026 年推出的多重設定（Multiple Configurations）與 Stage-only 發布功能，團隊應將發布管線解構為三個獨立維度的安全防線：

- **預發布管線（Canary / Prerelease）**：
  綁定 `develop` 或 PR 來源分支，啟用 Publish 權限並設定預設標籤為 `next`，同時允許管理 `next` 與 `beta` 的 dist-tag。
- **正式發布管線（Production Release）**：
  綁定 GitHub Environment `production`（需要人類 Maintainer 批准），啟用直接發布或 Stage 發布權限，嚴格限制僅在打了 Git Tag（`v*`）時觸發。
- **維運與促銷管線（Promotion / Rollback）**：
  專屬的維運 Workflow，**僅勾選「Allow npm dist-tag」並關閉 Publish 權限**。該工作流只能調整現有版本之間的標籤指向，即使發生漏洞，也完全無法向 npm 倉庫注入任何新的惡意程式碼。

## 下一步：盤點與清理你的長效 Token

隨著 npm 官方預告將於 2027 年進一步收緊並全面禁用繞過雙因素驗證的長效 Token，現在是全面檢視的最佳時機：

1. 檢查內部與開源專案的 GitHub Secrets，搜尋名為 `NPM_TOKEN` 或 `NODE_AUTH_TOKEN` 的變數。
2. 前往 `npmjs.com` 的 Package Settings，設定 Trusted Publishing 並依需求勾選「Allow npm dist-tag」。
3. 將 CI 腳本升級為使用 npm 11.21.0+，確認標籤操作順暢，最後將舊有的長效 Token 徹底廢除刪除。

把長效密鑰從 CI/CD 中彻底抹除，是確保開源專案在 AI 自動化與現代 DevOps 協同中不受供應鏈投毒威脅的最堅實基石。
