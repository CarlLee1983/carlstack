# Cookie、Session 與 Token 基礎查核

- 查核日期：2026-10-27（Asia/Taipei）。
- 對應文章：`src/content/blog/cookie-session-token-login-foundations.mdx`。
- 授權與範圍：使用者要求基礎知識不限所貼影片例子，由助理安排並今天寫完；新系列「後端工程基礎圖解」第 2 篇。使用虛構文章收藏站，不引用私人資料。
- 核心決策：同站瀏覽器收藏站以伺服器 Session + opaque Cookie 為最小方案；分開討論憑證傳遞與驗證格式。

## 去重與內鏈

查既有 OAuth/OIDC、API 安全與訂單詳情授權文章。既有核心分別為授權協定、防禦全景與物件授權，不以入門登入生命週期為主；新文不重講 PKCE、JWKS 或 OWASP 清單，內鏈三篇深讀。此次不是每日系統設計系列的新一回，與當日篇數分開計。

## 一手來源與段落對應

以下已開啟原頁並閱讀相關正文，非搜尋摘要。

- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies ：Cookie 設定、後續傳送、Cookie 不等於登入。
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie ：Secure、HttpOnly、`__Host-` 前綴、Path=/、無 Domain。前綴保證依瀏覽器支援，不把它當全站安全邊界。
- https://www.rfc-editor.org/rfc/rfc7519.html#section-3 ：JWT claims 格式，可簽章或加密；簽章 payload 不保密。
- https://www.rfc-editor.org/rfc/rfc8725.html#section-3 ：固定可接受演算法、驗證 cryptographic operation、issuer/audience，不把解碼當驗證。
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#renew-the-session-id-after-any-privilege-level-change ：登入權限變更時再生 ID。
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration ：到期與登出須伺服器強制失效。
- https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute ：SameSite 限制與防禦縱深，GET 不改狀態，使用框架 CSRF 防護。

JWT 撤銷取捨是從「只驗簽章與期限」這一明列假設推導的工程判斷，不聲稱所有 JWT 部署都無狀態。標頭為佔位示例，未做真實登入整合測試；沒有量化效能宣稱。

## Cover Direction 與實際產物

- metaphor：寄物圓牌、對應格位、獨立閱讀室門，對應憑證／紀錄／授權。
- medium：立體陶器靜物。
- composition：斜角近景，前方圓牌與後方格位。
- palette：赤陶與鈷藍，少量黃銅。
- lighting：暖色硬光與材質陰影。
- 相較第 1 篇紙雕信封：metaphor、medium、composition、palette、lighting 皆不同。
- 正式內建 `image_gen__imagegen` 生成一次，無 CLI／第三方圖片；提示為上述方向加無字、無 logo、主體保留中央裁切安全區。
- 原始：`/workspace/scratch/d935b46a4408/generated_images/exec-be42a901-3501-4ed8-bf24-ae5f2a777683.png`。
- 發布：`src/assets/covers/cookie-session-token-login-foundations.webp`，1536 × 1024，184722 bytes，WebP quality 86。
- 已直接目視原圖與 720 × 405（16:9）與 640 × 400（16:10）中央卡片裁切；圓牌、格位、門均可辨，無文字錯字；alt 描述實際畫面。

## 圖解與驗收邊界

`src/components/LoginSessionLifecycleDiagram.astro`：原生 SVG 桌面 960 × 580，手機以同義步驟卡重排。全中性色用 `--dg-*`，無硬編碼亮色、無 Mermaid。單一圖把登入→讀取→登出串起來，避免為張數重複資訊。尚未在此子任務做實頁桌機／手機深淺色目視，由整合者執行或如實記錄環境限制。完整工具鏈與正式部署由單一整合者負責。
