# SonicOS SSLVPN 封面研究

## Cover matrix（生成前，已實際開啟最近三張封面）

依文章 updatedDate／publishDate 選取；trail CLI 不可用，直接讀取 frontmatter 與圖片。每列依序記錄隱喻、媒材、構圖、主色、光線。

- order-system-partial-refund-allocation：圓餅與拆分扇形；纖維紙拼貼；正面中央大圓；淡紫／靛藍／珊瑚／黃綠；柔和漫射。
- alpine-openssh-password-authentication-bypass：異形鎖孔與不匹配方塊；紙雕；城門右側、山景左側的斜向景深；薄荷綠／米白／橘；明亮柔光。
- order-system-rollout-budget-slots：四槽金屬座與容量籌碼；寫實金屬靜物；斜向橫列、前景一枚籌碼；深藍／金黃；戲劇性側光。
- 本篇預定：兩條入口的檢查層數不一致，替代入口仍需匹配的實體鑰匙；霧面陶瓷建築微縮雕塑；寬幅正面略俯視、兩條縱深通道；暖白／陶土紅；日光長陰影。與鄰篇至少在隱喻、媒材、構圖與色盤不同。

## 原創生成 prompt

Use case: stylized-concept. Asset type: original editorial blog cover, wide 16:9, no typography. Create an elegant architectural ceramic miniature as a metaphor for inconsistent checks across two login entrances, NOT a real cybersecurity diagram. A warm off-white sculptural block has two parallel short passages toward the same rear courtyard. The left passage contains two intact closed terracotta checkpoint panels in succession. The right passage has a single intact terracotta door with a prominent keyhole, a matching terracotta physical key visibly inserted in its lock, and the door partially open. It is crucial that the alternate passage visibly requires this fitting key; no entry without credentials, no broken lock, no smashed barriers. Minimal still life on warm ivory ground, front-facing slightly elevated camera, generous negative space, matte hand-glazed ceramic material, hard warm daylight making crisp long shadows, refined art-gallery architectural model photography. Strong clean silhouettes understandable at 320 pixels wide. Palette warm ivory and terracotta, no blue, no gold, no paper collage. No people, no hackers, no arrows, no flowchart, no labels, no text, no letters, no numbers, no logos, no watermark. The two closed panels stay intact; the image must not suggest all MFA is broken.

## 語意界線

僅比喻不同驗證路徑的政策一致性。鑰匙表示替代驗證仍需要有效憑證；兩層門板不是 SonicOS 實際部署拓樸或 MFA 因子的數學對應。不得以封面推論完全無憑證攻擊或所有 MFA 皆失效。

## 生成與視覺驗收

- 使用 built-in image_gen，單次原創生成；未使用 CLI／API fallback 或外部素材。
- 原圖 1672 × 941；僅縮放／轉檔為 1600 × 900 WebP（16:9），88,716 bytes；沒有內容重繪或拼接。
- 最終資產：`src/assets/covers/sonicos-sslvpn-saml-authentication-bypass.webp`。
- 已開啟原圖與最終 WebP 大圖，以及 320 × 180 卡片與四張封面卡片比較圖。
- 大圖：左右入口與完整門板清楚，右側鑰匙插在鎖孔；沒有文字、logo、水印、破鎖或入侵者。背景裝飾盆栽不承擔技術意義。
- 卡片：左側雙門、右側插鑰匙的開門仍可分辨；暖白／陶土色、陶瓷材質與正面縱深構圖，和最近三張並排不重複模板。
- 此為資產視覺驗收，不是瀏覽器實頁、響應式 layout 或正式部署驗收；文章 frontmatter 由主工作接入檢查。

## coverAlt

米白陶瓷模型的兩條入口通往同一庭院：左側設兩道閉門，右側僅有一道插著鑰匙的開門，比喻替代驗證仍需有效憑證，卻可能未套用相同的登入政策。
