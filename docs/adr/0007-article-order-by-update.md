# 0007 時序文章清單依更新時間排序

- 狀態：accepted
- 日期：2026-10-04

## 脈絡

既有文章更新會保留原始 `publishDate` 並寫入 `updatedDate`，但共用 collection 入口仍只按發布日排序，導致更新文章不會出現在首頁與文章列表前方。

## 決定

- 共用 `getVisiblePosts` 依 `updatedDate ?? publishDate` 倒序排列；同時間先比發布日倒序，再以穩定文章 ID 升序，避免分頁受 collection 載入順序影響。
- 首頁最新文章、文章分頁、標籤文章、文章頁前後篇與 RSS 項目順序共用這份清單；精選的自動補位也使用同一排序。人工有效精選仍優先。
- 系列頁與系列閱讀導覽保留 `seriesOrder`，未指定篇章仍按原發布順序，避免更新打亂學習路徑。
- 發布日期、RSS `pubDate` 與 SEO `datePublished` 不改寫；更新日期繼續由 `dateModified` 表達。搜尋保留 Pagefind 關聯性排序，Sitemap 保留 URL 索引用途，兩者不是時序清單。
- 文章卡片與搜尋結果顯示同一有效日期（台北時區），有更新標示「更新」，無更新標示「發布」；卡片 `time.datetime` 與 Pagefind 日期也使用同一時間。文章內文的發布日期與 SEO 發布語義不變。
- 不改動文章 frontmatter、草稿可見性或新增日期排程規則。

## 後果

更新舊文會使其移到第一頁，其他文章的分頁位置跟著改變，但文章 URL 不變。`tests/content.test.ts` 驗證更新／發布日 fallback、穩定同時間順序、跨頁與草稿過濾、系列順序不變。

**Falsified if:** `getVisiblePosts` 不再使用 `sortByUpdatedDate`，或 RSS 將更新日當成 `pubDate`，或系列不再保留 `seriesOrder`。
