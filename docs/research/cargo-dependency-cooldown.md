# Cargo 依賴更新等待期研究

查核：2026-11-13，Asia/Taipei。事件日期11/12，Rust1.100正式發布。

## 去重與系列

在main bc76e5f以原始URL、Rust-1.100.0、min-publish-age、Cargo及Rust關鍵字查blog/research/queue，未發現相同核心文章。既有Rust runtime與npm供應鏈文的核心不同。本篇獨立開發工具文章，不硬塞AI或系統設計系列。

## 一手來源

- https://blog.rust-lang.org/2026/11/12/Rust-1.100.0/
- https://doc.rust-lang.org/cargo/reference/config.html#registryglobal-min-publish-age
- https://doc.rust-lang.org/cargo/reference/config.html#resolverincompatible-publish-age
- https://doc.rust-lang.org/cargo/reference/resolver.html#publish-age

公告網頁擷取工具internal error，使用一般HTTP讀公開原文成功200，非存取拒絕。完整公告與兩份Cargo文件已讀取。主要事實：1.100穩定支援，等待期預設0，deny保留lockfile現有版本；pubtime缺失不延後；cargo install忽略此設定；allow配合precise可帶入傳遞依賴。原創建議：更新工作與建置分工、例外審查及測試清單。未安裝Rust1.100、未實測Cargo解析或安全攔截率，正文已明示。

## 封面

正式imagegen生成原創，1672×941，WebP約92KB。陶土包裹與沙漏、奶油暖色實物攝影、側光中央構圖。與相鄰Aspire靛藍版畫在媒材、主色、構圖不同。全圖與480×270卡片裁切已目視，無文字logo。

Prompt: Original 16:9 editorial cover about Cargo dependency minimum publication age. Small warm terracotta ceramic package cube beside a clear hourglass on cream studio tabletop, second package blurred in background. Premium product photography, sparse centered composition, warm side sunlight, cream and terracotta palette. No text, letters, logos, watermark; central 70 percent safe for cropping.

## 驗收

人工作文字與標題去AI味，執行humanize-writing繁體檢查器。程式片段為未執行設定示例。沒有新增圖解。批次format、policy、check/build、test及部署正式頁驗收由整合者完成。
