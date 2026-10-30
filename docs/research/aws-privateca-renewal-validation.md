# AWS Private CA 續期驗收查核

- 文章：`aws-privateca-renewal-validation.md`。
- 日期：2026-10-30；事件：2026-10-29 09:30 PDT 公告。
- 正規化來源：https://aws.amazon.com/security/security-bulletins/2026-156-aws/
- 穩定識別：CVE-2026-119115、GHSA-hjrh-q6pg-mh82、2026-156-AWS。
- 維護者來源：https://github.com/cert-manager/aws-privateca-issuer/security/advisories/GHSA-hjrh-q6pg-mh82
- 查核讀到兩頁全文，AWS 參考連結顯示文字末尾 mh829，實際可讀公告 ID 是 mh82，正文使用正確連結。
- 全庫實檔去重：在 main f0452c6f 的 blog/research/queue 搜尋上述 URL/ID、aws-privateca、Private CA、ClusterIssuer，新增前無命中。GitHub code search 的零結果不作證據。
- 相關舊文 Octopus OIDC issuer 映射已全文讀；本篇聚焦修補改變 kind/scope 驗證後的合法續期與新憑證載入，非重新講 OIDC。網路系列既有1–22（含draft），本篇23；GEO文章的63屬AI系列，不混算。

## 事實對照

- 開場及版本段：AWS/GHSA共同支持已驗證使用者、特定條件、namespace approval與cluster issuer越權，包括subordinate CA。
- High、CVSS v3 8.5：GHSA。
- 修補1.10.1／EKS1.10.1-eksbuild.1、kind精確驗證、Failed/Pending、Ingress預設Issuer、升級前CertificateRequest/Certificate/Ingress盤點：兩頁一致。
- 緩解名稱＋kind同時限制approval/RBAC：兩頁一致。
- 未知：公告未聲稱active exploitation。不推論未遭利用。
- 測試設計與監控段：作者工程建議、虛構物流API、48小時/8小時教學假設，未執行Kubernetes/漏洞重現/續期測試。

## 封面方向與驗收

- 近鄰Octopus：紙雕雙門、金身分牌、酒紅淡紫、對稱、溫暖光。
- 近鄰LFM3：陶瓷分揀器、斜角桌面、藍珊瑚、柔和日光。
- 本篇：憑證檢查軌道與時鐘、印刷顆粒材質、非對稱近景、炭黑祖母綠、框內局部光。媒材/構圖/色盤/光線差異足夠。
- 正式image_gen原創，prompt：wide16:9 certificate renewal validation, translucent green certificate on inspection track toward illuminated receiver, amber clock, charcoal/emerald screenprint grain, no words/logos。
- 原檔：generated_images/exec-b17dbe72-f10f-4765-aa23-2e63f14ec243.png；輸出本地WebP1672×941。
- 已看全尺寸及480×270卡片裁切，主憑證、接收框與時鐘可辨，沒有品牌logo。圖屬概念封面，不當技術步驟圖。

## 驗收紀錄

- frozen install：pnpm12.1.0，成功。
- 人性化寫作checker：無機械命中，另人工讀稿。
- Astro dev在此雲端環境退出，正常Chrome本機頁Connection refused，尚未完成本機桌面/窄版深淺色目視；不得宣稱已驗。將嘗試production靜態預覽，無可用時依使用者豁免如實保留。
- 格式、policy、check、test、final build及正式部署核驗：由發布收據記錄精確最終版本，不能把此來源筆記當通過證明。

補充目視：依 ArticleCard.astro 的16:9與16:10兩種比例檢查480px縮圖，主體可辨。production靜態預覽亦因雲端Chrome無法連線本機localhost而Connection refused，未完成本機實頁桌面/窄版/深淺色目視；不繞限制，正式頁另採正常Chrome檢查。
