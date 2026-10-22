# 介面文案

適用於首頁、產品說明頁、按鈕、連結文字、介面標題、空狀態、錯誤訊息，以及嵌在 HTML、程式碼字串、設定檔裡的介面文字。使用者標明某段是介面文案時也適用。中英文共用。

語言規則檔（`zh-tw.md`、`en.md`）照樣全部適用，這份是額外的。文章裡的小標不適用這份，照語言規則檔的標題規則（`zh-tw.md` 第 12 節、`en.md` 第 13 節），要講出本節內容。

## 1. 介面標題可以當招牌

介面標題不必是全文摘要。一句有立場的口號，常比「名稱＋冒號＋一句解釋」更能讓人停下來。

這是允許，不是要求。原本就是清楚的摘要式標題可以留著，不必為了求新而改成口號。值得改的情況有兩種。一是標題只是把名稱和說明用冒號並排，而且說明那半句讀者本來就看得懂。二是「動詞＋名詞＋的完整指南」這種文章標題的套版，它既不是招牌，也沒說出內容。

- ❌ 打造高效部署流程的完整指南
- ❌ The Complete Guide to Streamlining Your Deployments

- ❌ ForgePilot：一個為 AI 開發設計的工程控制平面
- ✅ 讓「做完了」這句話變貴
- ❌ Orbit: A Deployment Management Platform
- ✅ Ship when the checks say so

## 2. 按鈕與連結講動作，不講位置

按鈕和連結文字要讓人知道點下去會讀到什麼、做什麼。不用「了解更多」「點擊這裡」這類泛稱或位置指示。

- ❌ 了解更多／點擊這裡／深入探索
- ✅ 讀使用手冊／看指令速查表
- ❌ Learn more / Click here / Explore
- ✅ Read the setup guide / See the command cheat sheet

## 3. 好處要能被查證

介面文案最容易滑進「更快、更簡單、更安全」這種誰都能寫的形容。改成一句可以被證偽的話：省掉哪個步驟、擋掉哪種錯誤、跑出什麼數字。原文沒有可查證的內容時，直接刪掉這句，不要編造數字或功能。

- ❌ 讓你的開發流程更順暢、更可靠。
- ✅ 測試通過的如果不是你正在看的那一版，它不讓你標記完成。
- ❌ Faster, simpler, and more secure deployments.
- ✅ It blocks a release when the tests passed on a different commit than the one you are viewing.

## 4. 嵌在 HTML、程式碼字串、設定檔裡的文案

這些文案一樣要受檢，但只改使用者看得到的文字。標籤、屬性、class、變數名、設定鍵都不動；字串裡的佔位符（`{name}`、`%s`）照原樣保留。改寫後的長度盡量接近原文，避免按鈕或版面被撐開。
