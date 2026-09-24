---
title: "Claude 不能用時，先分類故障：額度、帳單、登入、網路與帳號停用"
description: "把 Claude 與 Claude Code 的五類常見故障分開，依官方文件建立排查順序，避免把額度用完或本地登入失效誤認為封號。"
publishDate: 2026-09-24T14:22:11+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
cover: ../../assets/covers/claude-account-failure-triage.png
coverAlt: "五條不同顏色的線接入故障分流盤，一隻手選擇要檢查的路徑"
---

Claude Code 突然不能用，第一個反應常是「帳號是不是被封了？」但同一個表面症狀，可能來自訂閱額度、API 帳單、登入狀態、網路，或真正的帳號停用。若未先分類就清除本機資料、換節點、升級方案，會讓證據消失，也不一定能解決問題。

[@leo_xiaolei 的長文](https://x.com/leo_xiaolei/status/2102734958473236546) 涵蓋 Claude 入門、網路設定與停用後申訴，並提醒讀者不要把個人經歷當成 Anthropic 的風控規則。我想把其中最能移植到工程工作流的部分縮成一個判斷：**先找出出錯的服務邊界，再動手修復。**以下是截至 2026 年 9 月 24 日可由 Anthropic 官方文件確認的路徑；它無法替個別帳號判定停用原因。

## 第一步：保留原始訊號，確認哪個入口失敗

先記錄錯誤原文、發生時間、使用的是 `claude.ai`、Claude Code 還是 Console API，以及當時登入的帳號或組織。不要在截圖中暴露 API key、登入連結或代理憑據。

若多個入口同時出現一般性錯誤，先查 [Claude 服務狀態](https://status.claude.com/)；Anthropic 的[錯誤排查說明](https://support.claude.com/en/articles/12466728-troubleshoot-claude-error-messages)也將服務事故列為可能原因。服務尚未恢復時，先保留錯誤與時間，不急著改本機認證或網路。

若是 Console API 或 API key 認證失敗，直接確認該 key 所屬 Console 組織、額度與帳單；另一個網頁訂閱帳號的登入結果不能當作 API 存取證據。

若使用的是 Claude 訂閱或帳號登入，再用**同一個帳號**打開 `claude.ai` 比對：

- 網頁可正常登入並對話，只有 Claude Code 失敗：先查本機認證與網路。
- 網頁顯示用量限制：查用量與重置時間，不以「封號」處理。
- 網頁明確顯示停用或組織受限：保留通知，走官方申訴或審查入口。

這是排查順序，不是自動診斷器。網頁正常也不能證明終端的連線一定正常；某個介面顯示失敗，也未必代表整個 Anthropic 帳號停用。

## 第二步：把額度與計費分開

Anthropic 的 [Pro／Max 使用說明](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) 指出，Claude 與 Claude Code 會共用訂閱的使用額度。達到上限後，可等待重置；若選用額外用量或 Console API，則要確認相應的計費方式。Anthropic 另有[訂閱與 API 分開計費的說明](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console)。

因此，看到「用量已達上限」時，先看用量頁或 Claude Code 的 [`/usage`](https://code.claude.com/docs/en/commands)，記下限制類型與重置時間。`/status` 用於查看帳號、模型和連線狀態，不是額度頁。若是 API 請求失敗，則到 Console 檢查實際使用的組織與帳單。**停止規則：在確認是哪一套額度之前，不升級方案，也不開啟可能產生額外費用的用量。**

## 第三步：網頁正常時，再查 Claude Code 的認證

同一份 [Claude Code 官方說明](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) 特別指出：若終端設定了 `ANTHROPIC_API_KEY`，Claude Code 會用 API key 認證，可能產生 API 費用，而不是使用訂閱內含額度。這解釋了「我有 Max，為什麼終端卻走 API 帳單」的一種情況，但不能用來推定每個登入故障的原因。

先用 `/status` 核對目前的帳號、模型與連線狀態，再確認環境變數**是否存在、由哪個設定檔提供**；不要把變數值、憑據檔或完整終端輸出貼到工單。若打算使用訂閱額度，先依 [Anthropic 的環境變數指引](https://support.claude.com/en/articles/12304248-manage-api-key-environment-variables-in-claude-code)移除目前工作階段及設定來源中的 `ANTHROPIC_API_KEY`，再重新啟動終端。若只有本機登入失效，依官方指引使用 `/logout`、`/login` 切換正確帳號，然後再用 `/status` 驗證；只重新登入而保留 API key，仍可能走 API 計費。不要把刪除整個 `~/.claude` 當成第一步：設定與工作紀錄可能也在裡面，而清理本地資料無法解除伺服器端停用。

## 第四步：網頁與終端走不同路時，查實際連線

瀏覽器能開啟 Claude，只能證明瀏覽器當下的路徑可用。Claude Code 的[網路設定文件](https://code.claude.com/docs/en/network-config) 列出 `HTTPS_PROXY`、`HTTP_PROXY`、`NO_PROXY` 的支援與優先順序，並說明不支援 SOCKS 代理。這份文件也指出，環境變數在 Claude Code 啟動時讀取；改完 shell 設定後，舊工作階段不會自動更新。

因此要分別檢查瀏覽器、桌面端與終端的代理設定和連線紀錄。只核對變數名稱、來源與代理客戶端的實際命中路徑；不要以瀏覽器的 IP 查詢結果替代 Claude Code 的連線紀錄。若需要改網路設定，先記下目前配置與回復方式，再做單一變更、重啟 Claude Code、重現同一請求。網路出口的變化也不能單獨證明帳號被停用或解釋停用原因。

## 第五步：收到停用通知，走官方入口

Anthropic 的[安全措施與申訴文件](https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals) 列出可能的停用原因，包括反覆違反使用政策、從不支援地區建立帳號，以及違反服務條款；文件沒有公開「住宅 IP 純淨度」或「改時區」的帳號評分公式。服務地區應以[官方支援名單](https://www.anthropic.com/supported-countries)為準，代理出口不會替使用者取得地區資格。

若頁面明確顯示帳號停用，用原帳號登入 `claude.ai`，依受限頁面的表單提出申訴。若顯示的是某個組織暫停，則對該組織使用「Request a review」。先保存停用通知、時間、頁面訊息與帳單資料；可匯出的資料先依頁面提供的選項處理。申訴陳述可寫已知事實與不確定之處，不要為了湊出原因而臆測內部風控。重裝電腦、換線路或清除登入檔，都不能代替官方審查。

下一次遇到 Claude 失敗，先寫下一行紀錄：**哪個入口、哪個帳號或組織、錯誤原文、發生時間、服務狀態、下一個要查的邊界**。這些欄位能幫你決定先等服務恢復，或繼續查額度、帳單、認證、網路與申訴；若仍無法分類，保留原始訊號向官方支援求助。
