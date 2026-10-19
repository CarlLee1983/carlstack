# Sphinx：理解問答與可重跑反例

- 查核日期：2026-10-19（Asia/Taipei）。
- 文章：`src/content/blog/sphinx-understanding-before-push.md`
- 主來源正規化 URL：https://github.com/parthh01/sphinx
- 原始來源：https://github.com/parthh01/sphinx；Show HN https://news.ycombinator.com/item?id=50137950（穩定 ID 50137950，僅發現線索，正文不引用其討論或聲稱熱門）。
- 作者／專案：parthh01 / Sphinx。
- 原始碼查核版本：7485020c1e8784c060d9a616adcb5ddeea6da2fb，公開 clone，只讀原始碼，沒有安裝或執行 Sphinx、沒有連接 reviewer provider。
- 官方網站 https://sphinx-six-theta.vercel.app/ 在 web 工具回傳不可存取；改讀公開 GitHub 完整 README、架構文件、設定文件與 config.js。沒有使用搜尋摘要代替全文，也沒有繞過登入或權限。
- 整合者先前完成來源 URL/ID/作者與主題去重；本稿針對理解缺口→反例驗證，與 AI review 收斂、結構化約束兩篇不同，正文互鏈。AI 系列92由整合者預留，推送前再核對。

## 段落對應

1. 開卷題目、行為/失敗/不變量：README `What a check looks like`（完整原文）。
2. exact Git snapshot、filter、related code/tests、獨立題目audit、回答錯誤換情境、restore Git前revalidate：docs/architecture.md `Checkpoint sequence` 六項。
3. 本機可繞過、外部協助、模型可能錯、skip不算pass：README `Before you install`、`During and after a check`。正文不宣稱安全性、身份證明或無協助理解。
4. 外送code/related files/answers/project context；ignore是path-based不能偵測一般source內secret：README `Before you install`。
5. 模型calls預設null無總上限；其他time/context/output有上限：docs/configuration.md `Model calls, tokens, and limits`，src/config.js L14–15交叉核實。
6. 安裝global hooks影響：README `Before you install`、docs/architecture.md `Repository policy and terminal interaction`。本文不提供會更動全域設定的操作命令。
7. 刪檔版本A/B故事與三題、驗收情境、先決需求、非敏感隔離試用、合併/部署停止規則：作者工程建議或明標虛構，不是 Sphinx 成果，不冒稱親測。
8. 學習成效：沒有建立或引用效果量；明說一次答題不能支持能力提升。

固定版本來源：https://github.com/parthh01/sphinx/tree/7485020c1e8784c060d9a616adcb5ddeea6da2fb

## 視覺

封面矩陣比較：前文poteto為藍白陶瓷分層正面物件；AI review為綠金微縮列車俯視。新文為奶油/琥珀/淡紫手持透明片與檔案盒、近景照片拼貼，媒材、構圖、主色均區別。

- 原創正式 imagegen 生成，無第三方圖、文字、標誌。
- Prompt：Original 16:9 editorial cover, human hand holding translucent amber archival slide revealing file drawer and branching paths above a closed box; cream, terracotta, muted lavender; analog collage/photographic grain, directional morning light, no text/logos/robots/screens. Central focal object for card crop.
- 原始輸出1672×941，WebP quality88，147926 bytes；400×225 card crop檢視焦點保留、無不預期文字。全尺寸亦已檢視。
- 此文沒有需要另做SVG的流程或架構圖；反例用段落描述，不以生圖當技術圖解。
- 來源與文字查核完成，未聲稱執行產品測試。完整repo格式、內容policy、check、test、build、預覽與正式部署驗收由整合發布者針對最終檔案執行並補記。

本次工程紀錄：雲端獨立工作區 / Node 24.19.0 / pnpm 12.1.0，frozen-lockfile install 通過。Astro dev 在 ready 前退出，localhost:4359 無法連線，未完成桌機／320px／深淺色實頁預覽；依使用者預覽例外續行。沒有繞過環境限制。最終格式、內容 policy、check/build、test、正式部署與索引核對以本次提交的執行結果為準。
