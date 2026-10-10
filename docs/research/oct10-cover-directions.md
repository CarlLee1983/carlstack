# 2026-10-10 原創封面方向與驗收

## 參考檢視

生成前已逐張視覺檢視最近發布的三張 1600 × 900 封面：

- `claude-science-uvmap-provenance.webp`：藍底星圖與半透明手工紙，俯視、藍／赭色、柔光。
- `splunk-mcp-destination-credential-boundary.webp`：沙漠的幾何門與插槽，建築式立體場景、斜向透視、赤陶／薄荷、長陰影。
- `ossscanner-vulnerability-report-triage.webp`：手持放大鏡檢查紙張，炭筆／版畫混合、近距離斜向構圖、黑／米白／朱紅。

## 生成前差異矩陣

### Deno／Cloudflare 遷移

- 視覺隱喻：載著不同模組的渡船，從退役碼頭往新碼頭運送；碼頭上的對照物強調搬運之外還要比對。
- 媒材：厚塗油畫；不沿用昨日紙張、沙漠幾何或炭筆媒材。
- 構圖：遠近分明的橫向港口全景，渡船位於中央安全區。
- 主色：橄欖綠、淡奶油、深梅紫，少量珊瑚色貨物。
- 光線／情緒：曙光下平靜、有計畫的轉移，避免災難逃亡。

### Prime Agent Rust 重寫

- 視覺隱喻：兩台結構不同的小型織機織出可逐線核對的相同圖樣，測試梳橫跨兩條樣帶。
- 媒材：可見纖維與金屬零件的精緻織物裝置攝影。
- 構圖：俯視、兩條橫向平行的織帶與垂直量規，保留四周留白。
- 主色：鈷藍、芥末黃、奶白，灰銀機件。
- 光線／情緒：工作室柔光，精準、有觸感，沒有勝利或速度特效。

### SonicWall 修補與證據分層

- 視覺隱喻：三個相互分離的檢體盤，只有第一盤有少量痕跡；旁邊一塊完整、帶修補金屬片的陶瓷護板，區分修補動作與有限觀測。
- 媒材：釉面陶瓷與金屬的微型實物靜物攝影。
- 構圖：低角度近景，三盤依深度錯開，主體位於中央裁切安全區。
- 主色：淡紫、酒紅、珍珠白，少量深藍痕跡。
- 光線／情緒：冷靜而克制的斜側光，避免災難或已遭攻破的暗示。

三張封面互相比較，在隱喻、媒材、構圖與色盤上均明確區隔；共同錨點僅為 16:9 比例與無文字的工程隱喻。

## 生成紀錄

使用內建 image_gen，每個資產分別呼叫一次；沒有使用 CLI 或 API fallback。完整提示與實際尺寸、檔案與 QA 紀錄如下。

## 完整生成提示

### deno-cloudflare-deploy-migration-exit-plan

```text
Use case: stylized-concept. Asset type: original editorial cover for an engineering publication, wide landscape 16:9.
Create a richly tactile impasto oil painting of a calm harbor at first light. A sturdy small ferry in the middle of the scene carries a deliberate inventory of distinct interlocking objects: a coral cylinder, cream cube, olive gear, and plum arch, secured individually. It is crossing from an old, carefully dismantled timber dock at left toward a solid new dock at right. A few matching silhouettes in a neat open tray on the new dock suggest checking that every component has arrived in the same shape. This is an engineering migration metaphor: moving a platform requires preserving dependencies and proving equivalent behavior. No catastrophe, no flames, no wreck, no people needed. Build the picture from thick palette-knife marks, visible ridges of oil paint, broad expressive yet precise brushwork, unmistakably painted not rendered. Dominant olive green water and deep aubergine shoreline, pale butter sky, selective coral cargo. Horizontal panorama, clear central ferry silhouette, comfortably inside central 75 percent so crop to 16:10 still works. Restrained luminous dawn and confident quiet mood. A beautiful visual editorial image with readable shapes at 320 pixels. Absolutely no text, letters, numbers, logos, recognizable brands, watermark, icons, floating UI, neon, robots or generic AI imagery. Full-bleed edge-to-edge painting.
```

### prime-agent-rust-rewrite-verification-contract

```text
Use case: stylized-concept. Asset type: original engineering editorial cover, wide landscape 16:9.
A handmade kinetic textile artwork photographed straight overhead in a refined studio. Two small distinctly constructed mechanical looms at the left feed two wide parallel woven sample ribbons across a warm ivory background. The upper loom is a small brass-and-wood framework, the lower a compact silver-steel mechanism: different internals, same observable output. Both ribbons repeat exactly the same bold cobalt-blue and mustard-yellow stepped geometric weave, with clearly tactile thick wool fibers, on a cream base. A single slim metallic inspection comb crosses the two sample ribbons perpendicular to them near the center-right, physically checking matching structure. Keep the machinery simple and charming, legible rather than dense; ribbon patterns are big, clean and convincingly identical. The metaphor is behavioral equivalence checked after a software rewrite, not mere speed or the number of agents. Composition is rigorously top-down, horizontal paired ribbons, one vertical comb, generous warm ivory negative space, every essential object within central 75 percent for 16:10 crops. Macro-quality textile fibers, beautiful real soft shadows, muted silver metal, cobalt blue and mustard yellow dominant accents. Elegant playful industrial craftsmanship, realistic studio object photography. No text, letters, numbers, logos, watermarks, computers, robots, glowing circuits, dashboards, arrows or generic AI imagery. No motion blur or celebratory effects.
```

### sonicwall-sma1000-patch-and-exploitation-evidence

```text
Use case: stylized-concept. Asset type: original engineering security editorial cover, wide landscape 16:9.
Create a carefully art-directed physical still-life photograph about limited evidence and careful repair, with no hacking clichés. Three small shallow pearl-white glazed porcelain specimen trays are separated and staggered at different depths on a dusty lavender tabletop against a dark burgundy seamless studio background. In only the nearest tray is a modest sparse group of tiny cobalt-blue ceramic specks, each clearly a collected specimen, not spilling anywhere. The other two trays remain visibly empty. Beside the trays sits a small intact smooth porcelain protective tile with a neat brushed-steel reinforcement patch fastened onto its face; it has no hole and no shattered parts. This is a metaphor for separating a small observed signal from unproven broader claims, while carrying out a patch. It must not imply that a break-in succeeded, nor that patching proves absence of compromise. A low three-quarter camera angle, asymmetric balanced composition, tray group and reinforced tile comfortably in central 75 percent, dimensional quiet shadows. Materials should be gorgeous tactile real ceramics with slight hand-made variation, brushed metal, velvet-like burgundy backdrop, restrained side light. Clear simple silhouettes readable as a small article card. Palette pearl white, dusty lilac and burgundy with few dark cobalt specks; no neon. No text, letters, numbers, logos, watermark, screens, padlocks, shields, magnifying glasses, doors, broken barriers, intruders, danger signs, red alert graphics or generic AI imagery.
```

## 最終交付與 coverAlt

### Deno／Cloudflare

- 圖片：`src/assets/covers/deno-cloudflare-deploy-migration-exit-plan.webp`
- frontmatter 路徑：`../../assets/covers/deno-cloudflare-deploy-migration-exit-plan.webp`
- 尺寸：1600 × 900，WebP，520,456 bytes。
- coverAlt：`厚塗油畫中的渡船載著形狀各異的模組，從舊碼頭駛向擺有對照零件的新碼頭，象徵遷移前盤點相依並核對行為。`
- 語意限制：畫面是遷移／驗證的編輯隱喻，不是 Deno 或 Cloudflare 的實際設施。

### Prime Agent

- 圖片：`src/assets/covers/prime-agent-rust-rewrite-verification-contract.webp`
- frontmatter 路徑：`../../assets/covers/prime-agent-rust-rewrite-verification-contract.webp`
- 尺寸：1600 × 900，WebP，307,150 bytes。採稍偏上方的裁切以保留織機頂部螺絲。
- coverAlt：`兩台內部結構不同的織機織出相同的藍黃圖樣，一把金屬檢驗梳跨過兩條織帶，象徵重寫後逐項核對可觀測行為。`
- 語意限制：相同織帶表達應驗證的目標，不能當作 Prime Agent 已通過所有驗證的證據；畫面不把供應商的代理數量或速度聲稱可視化為已證明成果。

### SonicWall

- 圖片：`src/assets/covers/sonicwall-sma1000-patch-and-exploitation-evidence.webp`
- frontmatter 路徑：`../../assets/covers/sonicwall-sma1000-patch-and-exploitation-evidence.webp`
- 尺寸：1600 × 900，WebP，107,020 bytes。
- coverAlt：`三個分開的陶瓷檢體盤中，只有前方一盤留有少量藍色觀測物，旁邊是加裝金屬補片的完整護板，象徵有限證據與修補工作需分別判讀。`
- 語意限制：觀測物只是稀疏證據的隱喻，不代表事件數量，空盤也不代表已排除入侵；完整護板不宣稱設備安全或修補必定有效。畫面沒有破門、入侵者、破碎防線或誇大攻擊規模。

## 實際驗收

- 已逐張檢視最終 WebP 全尺寸成品；確認為 1600 × 900，不含文字、品牌、浮水印或無關 UI。
- 已並排檢視三張的 320 × 180 縮圖與 320 × 200 中央裁切。Deno 的渡船和四個模組、Prime 的兩個織機與檢驗梳、SonicWall 的有限觀測與補片仍可辨識。
- 已把 10 月 9 日與 10 月 10 日六張封面排列比較。三張新圖在媒材、空間結構、色彩、物件與敘事上明顯不同，不是替換符號的同模板。
- Deno 的裁切保留中央主體；16:10 會減少右側碼頭邊缘，但不影響遷移主題。
- Prime 的兩條樣帶只作隱喻，不以生成圖的針腳一致性充當技術上的 differential test 結果。
- SonicWall 保留克制的靜物視覺，沒有把少量觀測變成大規模成功入侵。
- 本次僅新增三個 cover 與本研究記錄；未修改文章、git index、提交或發布狀態。文章 frontmatter 的實際接線與全站 gate 由發布任務執行。
- 生成 PNG 原檔保留在本次工作區；WebP 是唯一須納入網站 repository 的圖像資產。縮圖與接觸表只作本機 QA，不納入 repository。

## 文章頁預覽限制

2026-10-10 雲端工作區的 Astro dev 曾回報啟動，隨後 status 顯示無持續執行的 server；雲端瀏覽器無法開啟 127.0.0.1:4321，回報 ERR_CONNECTION_REFUSED。未宣稱文章頁桌面／320 px／深淺色視覺驗收完成，未繞過瀏覽器或環境限制。封面全尺寸和卡片裁切如上已完成；內容 policy、type check、測試、最終 production build 及正式站驗證仍另外執行。
