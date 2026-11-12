# AWS Emulator 本機測試研究

查核日期：2026-11-12（Asia/Taipei）。事件為11/11官方推出，非今日首次發表。

去重：main 6cffee0；原始URL、aws-emulator、作者AWS與主題關鍵字查 blog/research/queue，無既有核心文。open PR空。與Nitro隔離文章不同，本文是API模擬覆蓋，不是執行隔離。獨立文章，不加入AI系列。

## 一手來源

- https://aws.amazon.com/about-aws/whats-new/2026/11/aws-emulator-now-available/
- https://github.com/aws/aws-emulator
- https://docs.aws.amazon.com/emulator/latest/userguide/what-is-service.html
- https://docs.aws.amazon.com/emulator/latest/userguide/fidelity.html
- https://docs.aws.amazon.com/emulator/latest/userguide/check-project.html
- https://docs.aws.amazon.com/emulator/latest/userguide/security.html
- https://docs.aws.amazon.com/emulator/latest/userguide/versioning.html

均讀取原文。501、in-memory、fidelity與安全限制依各頁核對。未安裝或執行模擬器、未呼叫AWS、未跑效能測試；訂單範例是原創教學設計。

## 封面

正式imagegen生成；薄荷玻璃資料中心微縮模型，冷色漫射光，桌面三分之四視角。與鄰近Dependabot橘色實物靜物在主色、媒材及構圖不同。無文字logo，全尺寸及480×270卡片裁切目視。

## 驗收

依父批次最終執行 policy、check/build、test。完整本機預覽是否可用另記批次收據，不把靜態圖像目視當完整頁面驗收。
