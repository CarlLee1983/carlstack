---
title: "npm Trusted Publishing 支援 dist-tag：把標籤維運權限另行驗收"
description: "npm Trusted Publishing 新增 opt-in dist-tag 權限。拆開平台授權與自訂 tag 白名單，規劃 OIDC 標籤維運、備援憑證盤點及發布管線的驗收。"
publishDate: 2026-10-01T12:20:00+08:00
updatedDate: 2026-10-12T10:13:00+08:00
draft: false
featured: false
tags:
  - 安全架構
  - 系統設計
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 45
cover: ../../assets/covers/npm-trusted-publishing-dist-tag-permissions.jpg
coverAlt: "重型金庫大門前，金屬鑰匙轉變為透明晶光構成的短效虛擬鑰匙，連向三條分流軌道，象徵發布身分與不同維運工作。"
---

在過去幾年，開源生態為了抵禦供應鏈攻擊，積極推動「可信發布（Trusted Publishing）」：透過 GitHub Actions 等 CI/CD 平台的短效 OIDC 憑證向 npm Registry 換取發布授權，讓開發者不再需要在儲存庫中存放長效的 `NPM_TOKEN`。

然而，許多嚴謹維護 release 流程的團隊卻發現了一個尷尬的破綻：專案中的長效 Token 依然拔不掉。原因在於，當套件完成發布後，若需要調整發布標籤（例如將 Canary 升級為 Latest、或透過 `npm dist-tag` 管理 Next/Beta 版本通道），先前的 Trusted Publishing 並不支援這項操作，團隊仍被迫在 GitHub Secrets 保留一組具備讀寫權限的長效 Token。

[2026 年 9 月 30 日，GitHub 與 npm 正式發布公告，為 npm Trusted Publishing 加入了可選擇性啟用的 dist-tag 權限（Opt-in dist-tag permissions）](https://github.blog/changelog/2026-09-30-opt-in-dist-tag-permissions-for-npm-trusted-publishing/)。此項功能要求使用 **npm CLI 11.21.0+** 或 **12.2.0+**。

我的判斷是，dist-tag 權限預設關閉、可獨立啟用，讓團隊能分開審查發布與標籤維運。這降低了共用權限的風險；工作流內容、依賴與憑證來源仍需各自驗收。

## 為什麼「發布代碼」與「管理標籤」必須嚴格分離？

在直覺上，有人可能會認為「既然我都能 publish 一個新版本了，為什麼不能順便改個 tag？」這種想法低估了版本指標在現代軟體分發中的資安破壞力：

- **Rollback 劫持與降級攻擊（Downgrade Attack）**：
  如果某個遭到入侵的 CI/CD 工作流擁有了無限制的 dist-tag 權限，攻擊者不需要發布任何新代碼，只需悄悄呼叫 `npm dist-tag add my-pkg@1.0.2 latest`，就可能讓依該 tag 解析版本的新安裝，取得有已知漏洞的舊版本；已鎖定版本的安裝不會因此全部被改寫。
- **繞過代碼審查的暗渠**：
  許多團隊在 `main` 分支的代碼發布設有嚴格的 Peer Review 與 CI 測試門檻，但日常的 Canary 發布或維運腳本權限較為寬鬆。若權限未分離，攻擊者只需控制一個低權限的預發布腳本，就能將未經審核的預發布包提升為正式的 `latest`。
- **無靜默擴權（No Silent Capability Escalation）**：
  npm 堅持所有既有的 Trusted Publishing 配置必須由管理員手動至後台勾選 **「Allow npm dist-tag」**，確保平台功能演進不會在維護者不知情的情況下擴大現有 CI 的潛在爆炸半徑。

## 短效 OIDC 管理 dist-tag 的運作架構

已正確設定且沒有意外備援憑證的工作，可以使用短效 OIDC 身分完成標籤維運：

1. **GitHub Actions 申請 OIDC Token**：工作流透過宣告 `permissions: { id-token: write }`，向 GitHub OIDC Provider 請求一組攜帶儲存庫名稱、觸發事件、Ref 與 Workflow 檔案路徑的短效 JWT。
2. **與 npm Registry 交換臨時權限**：npm CLI 自動截取環境中的 OIDC 憑證並送交 Registry。
3. **宣告比對與授權執行**：npm Registry 檢查該 Token 的來源屬性是否精準匹配 Package 設定中開啟了「Allow npm dist-tag」的條目。驗證通過後，在當次 Session 內授權執行標籤增刪。

### 使用 OIDC 與自訂 tag 白名單的 Workflow 範例

以下是未執行的設定範例，需先為指定套件建立符合工作流的 Trusted Publisher，啟用 `Allow npm dist-tag`，並移除該工作可讀取的靜態發布憑證。`next`／`beta` 白名單由腳本檢查，並非 npm 原生逐 tag 權限；可修改工作流的人也能改這個檢查，仍須分支與審查保護：

```yaml
name: Release Channel Promotion
on:
  workflow_dispatch:
    inputs:
      version:
        description: "Target package version to promote"
        required: true
      tag:
        description: "Target dist-tag (next or beta)"
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

      - name: Promote allowed test tag
        env:
          VERSION: ${{ inputs.version }}
          TAG: ${{ inputs.tag }}
        shell: bash
        run: |
          set -euo pipefail
          case "$TAG" in next|beta) ;; *) exit 1 ;; esac
          [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || exit 1
          npm dist-tag add "my-awesome-pkg@$VERSION" "$TAG"
```

## 打造三層最小權限的 CI/CD 發布矩陣

以下是團隊可採用的工作分工建議。官方公告提供每個 trusted publisher 設定的 dist-tag opt-in，且它獨立於 direct-publish 權限；分支、tag 白名單與核准流程仍由團隊設定：

- **預發布管線（Canary / Prerelease）**：
  使用受保護的預發布工作流；若只允許 `next`／`beta`，在 wrapper 加白名單並保護腳本。不要讓未受信任的 PR 直接取得發布身分。
- **正式發布管線（Production Release）**：
  在 GitHub Environment `production` 設置所需核准，限制可進入的 refs；依團隊選擇，分開驗收直接發布或 staged-release 流程。
- **維運與促銷管線（Promotion / Rollback）**：
  使用獨立工作流並啟用所需 dist-tag 權限。[npm 官方設定文件](https://docs.npmjs.com/trusted-publishers/#for-github-actions)明列 `npm stage publish` 始終允許，因此停用 direct publish 不能把 trusted publisher 變成只有 tag 權限。公開 staged release 仍需獨立審核，也要測試改 tag 是否能把未核准版本推給使用者。

## 下一步：盤點與清理你的長效 Token

先找出標籤維運是否仍依賴靜態憑證，再逐個工作替換與驗收：

1. 檢查內部與開源專案的 GitHub Secrets，搜尋名為 `NPM_TOKEN` 或 `NODE_AUTH_TOKEN` 的變數。
2. 前往 `npmjs.com` 的 Package Settings，設定 Trusted Publishing 並依需求勾選「Allow npm dist-tag」。
3. 將 CI 腳本升級為使用 npm 11.21.0+，確認標籤操作順暢，最後將舊有的長效 Token 徹底廢除刪除。

移除不再需要的靜態憑證，可以減少一類外洩風險，不能保證不受供應鏈攻擊。結案時保留 OIDC 成功與未授權操作被拒絕的證據。

pnpm 使用者可接著讀 [12.12.1 的 audience 檢查與憑證回退驗收](/blog/pnpm-oidc-audience-credential-fallback/)。該文區分 npm 的 opt-in 權限與團隊自行實作的逐 tag 白名單，並驗收 CI 是否真的只使用 OIDC。
