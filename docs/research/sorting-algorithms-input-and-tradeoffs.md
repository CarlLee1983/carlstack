# 排序基礎：查核紀錄

查核日期：2026-10-31。範圍是使用者授權的基礎知識分類批次，不是每日系統設計配額。

## 去重與來源識別

- 原分享：https://www.facebook.com/share/r/1CgkbkgSUw/
- canonical：https://www.facebook.com/reel/1395782485411974
- 作者：Code Crack。選題為排序演算法動畫；父工作已驗可公開字幕與部分畫面，不宣稱聽取音訊。動畫秒數不當普遍效能比較。
- 在 main 5d84b27 起點以上述穩定 ID、排序演算法關鍵字查 src/content/blog、docs/research、docs/article-queue.md，未見相同來源成文。
- 與既有 design-patterns-object-collaboration-foundations 不同：該篇教 Strategy 協作，本篇教排序輸入條件、穩定性及演算法機制。

## 段落與一手依據

- 穩定性：https://docs.python.org/3/howto/sorting.html#sort-stability-and-complex-sorts
- 多欄位排序：https://www.postgresql.org/docs/current/tutorial-select.html
- 插入及合併機制／複雜度：MIT 6.006 第 3 講，讀到實際投影片 PDF，非課程頁摘要。https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/90a37c49b07b105ea7a027abc67eddc6_MIT6_006F11_lec03.pdf
- 計數、基數的輸入假設：MIT 第 7 講實際 PDF。https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/bf7d79105762bf79bbc0925438e1468a_MIT6_006F11_lec07.pdf
- JS 預設字串比較與穩定要求：https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort
- 少量 top-k：https://docs.python.org/3/library/heapq.html#heapq.nsmallest
- Princeton 網頁 403，沒有以其未讀正文作證。

## 示例與限制

2026-10-31 09:59 UTC 擷取文章完整 JS fence，在 Node v24.22.1 執行 exit 0。驗證兩種相同金額規則、原陣列順序保留、預設文字與數字比較差異。沒有壓測或速度宣稱。金額皆教學整數，不涵蓋浮點貨幣、缺值。圖片與最後全站驗收由整合工作紀錄，不在此冒稱已完成。
