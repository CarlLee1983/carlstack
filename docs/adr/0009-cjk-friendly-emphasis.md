# 0009 Markdown 管線改用 CJK 友善的強調與刪除線規則

- 狀態：accepted
- 日期：2026-10-21

## 脈絡

CommonMark 判斷 `**` 能否開啟或關閉強調時，依靠前後字元是不是空白或標點。中文不用空白分詞，`**單次查詢只需三次 I/O。**後文` 這類「全形標點緊貼收尾 `**`、後面接中文字」的寫法不會被當成粗體，正式站直接顯示星號；兩段粗體夾一個連接詞（`**A**或**B**`）還會被解析成巢狀粗體，把「或」也加粗。2026-10-21 本機 build 量到 74 頁、260 個字面 `**`，以及 11 頁、12 處錯誤巢狀。

同一次比對也發現，remark-gfm 預設把單一波浪號視為刪除線，`3~4 層高 … 3~4 次` 這類數字範圍在 3 篇文章被渲染成 `<del>`，其中一處還切斷了粗體。全站沒有任何刻意使用 `~~` 的地方。

## 決定

- 在 `astro.config.mjs` 的 `markdown.processor` 加入 `remark-cjk-friendly`，固定精確版本 `2.3.2`。它和 remark-gfm 都只註冊 micromark 語法擴充，兩者在清單中的相對順序不影響輸出。`.mdx` 經 `@astrojs/mdx` 的 `extendMarkdownConfig` 繼承同一組外掛。
- remark-gfm 設定 `singleTilde: false`，只有 `~~` 是刪除線。`unified()` 的 `gfm` 只接受布林值，因此設 `gfm: false` 關掉內建的 GFM，改把 `remark-gfm` 列為直接依賴（固定 `4.0.1`，與原本 lockfile 解析到的版本相同）自行掛在 `remarkPlugins`。`.mdx` 同時繼承 `gfm: false` 與這份清單，只會有一個 GFM 實例。目前內建與直接依賴解析到同一個 remark-gfm 函式，unified 會合併重複的 `.use()`，所以單看輸出看不出 `gfm: false` 的作用；它防的是兩邊日後解析到不同版本、變成兩個 GFM 實例。
- 不修改既有文章原文，也不在內容 policy 加寫法檢查：修在管線上，舊文一次修好，作者不必記「標點旁的粗體要加空白」這條規則。
- 不安裝 `remark-cjk-friendly-gfm-strikethrough`；全站沒有 `~~`，等真的需要刪除線時再評估。

考慮過的替代方案是逐篇移動標點、再由 `content-policy` 擋新寫法。它不需要新依賴，但依 ADR 0004 的契約 policy 只檢查本次 diff，擋不住舊文，也讓每位作者都得記住 CommonMark 的 flanking 規則。

## 後果

全站 build 前後比對，除了字面 `**` 變成 `<strong>`、誤判的 `<del>` 消失，HTML 沒有其他差異；RSS 只含 frontmatter、Pagefind 索引來自 build 後的 HTML，兩者自動跟上。文章原始碼在 GitHub 或其他標準 CommonMark 渲染器上仍可能顯示星號，這不在本站範圍內。`remark-cjk-friendly` 由單一維護者維護，README 註明不支援 Rust 解析器。`tests/markdown-cjk-emphasis.test.ts` 以網站同一組管線設定驗證 CJK 粗體、連接詞不被加粗、單波浪號保留字面、`~~` 仍是刪除線。

**Falsified if:** Astro 預設 Markdown 處理器原生支援 CJK 強調，或 `unified()` 的 `gfm` 改為接受選項（屆時應改回內建 GFM），或 `remark-cjk-friendly` 與 CarlStack 解析到的 micromark／unified 主版本不再相容，或 `astro.config.mjs` 改用 Rust Markdown 解析器；`package.json` 移除 `remark-cjk-friendly` 時也必須回頭檢查本決定。
