---
title: "Optimizely 事件後怎麼查第三方腳本"
description: "從 Optimizely Web Experimentation 事件出發，說明如何定位受影響頁面、核對生產腳本與設計可用的停用流程。"
publishDate: 2026-11-25T10:07:22+08:00
draft: false
featured: false
tags: [資安, Web, JavaScript]
cover: ../../assets/optimizely-web-experimentation-incident.webp
coverAlt: "深紫色背景上疊放半透明紙片，中央有一條珊瑚色圖帶。"
---

網站的結帳程式碼沒有新提交，瀏覽器載入的內容仍可能改變。網站若直接載入供應商託管的 A/B 測試腳本，供應商發佈新的實驗版本時，使用者可能在本站沒有重新部署的情況下執行新的 JavaScript。排查這類事件，先確認哪個專案被改過，再查哪些頁面實際載入它。

[Optimizely 的事件公告](https://support.optimizely.com/hc/en-us/articles/50521849710605-Security-Advisory-Web-Experimentation-Security-Incident-Updated-November-19-2026)記載，11 月 16 日有人利用 Web Experimentation 的註冊流程缺陷，冒用客戶身分，在部分專案寫入惡意 JavaScript。公司說當日已阻斷程式碼交付、關閉漏洞並移除注入內容，受影響客戶不到 5%，範圍限於 Web Experimentation。百分比及修復結果來自廠商。它並未告訴個別網站有多少訪客碰到可疑版本。[CISA 在 11 月 24 日把 CVE-2026-132224 列入已遭利用漏洞清單](https://github.com/cisagov/kev-data/blob/develop/known_exploited_vulnerabilities.json)。

## 從載入腳本的頁面開始查

先對照供應商的客戶通知，把通知中的專案識別碼和生產站的設定接起來。以虛構商店為例，商品頁、購物車與結帳頁看起來像三段路徑，腳本卻可能是共用版型或標籤管理器注入的。兩個地方都要查，再用乾淨的瀏覽器確認各路徑的實際載入清單。若設定還取決於同意條件或地區，驗收也要包含會觸發該設定的瀏覽情境。

調查時留下專案變更、標籤管理器的發佈版本，以及手上原有的瀏覽器或監控紀錄。現在訪問腳本網址能證明現在取得什麼，不能反推事發當時每位訪客的內容。若當時沒有保存版本、送出範圍或前端紀錄，就把這項缺口列在調查結論內，不用目前的頁面狀態補寫。

## 先驗證可以停用，再決定是否鎖定版本

對結帳或登入一類高敏感頁面，先弄清楚實驗腳本能否獨立停用。可在預備環境把它切掉，再完整走一次正常交易與登入。如果核心流程跟著壞，去拆出必要功能，免得正式事件時只能在阻止腳本和維持營運之間二選一。代價是停用時實驗暫停、報表出現斷點，兩者都應記在值班手冊。

[Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) 能讓瀏覽器比對檔案雜湊，適合可釘住的靜態版本。供應商若會在同一網址更新腳本，雜湊不符就會阻止載入。只允許特定網域的 [CSP `script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src)，也不會辨識該允許網域送來的是正常還是被改過的內容。能固定版本的頁面可以驗雜湊；需要即時發佈實驗的頁面，先縮小腳本的覆蓋範圍，並把停用流程走通。

這裡的商店是示例。未取得任何客戶的流量、腳本紀錄或個資，不能據此判定事件影響了哪家網站或哪些使用者。
