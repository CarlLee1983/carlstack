# Antigravity Orchestrator 查核紀錄

- 查核：2026-11-13，主來源發布時間2026-11-12T08:00:00Z。
- 主來源：https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/
- 文件：https://antigravity.google/docs/models#orchestrator
- 兩頁均以公開HTTP完整HTML讀取，未使用搜尋摘要代替全文。web工具主來源出現可存取性錯誤，直接公開HTTP成功200，無登入或權限拒絕。
- 以Hydrogen、Orchestrator、主URL搜尋文章、研究與佇列；沒有同一主題，既有同字詞為其他產品。與Gemini Decisions文章互鏈，AI系列116。
- 核實：Carbon或Argon規劃、Hydrogen實作；同一對話內交接、固定推理設定；重新規劃條件包含驗證連續失敗兩次、介面差異與未定設計。沒有將多模型等同多代理平行。
- 官方Terminal-Bench 4.1的24%額度、19%速度均標為廠商結果；沒有重跑模型或測量成本。
- 封面矩陣：紙雕圓規與螺絲起子／左右並列／深藍綠銅／柔和俯視陰影。相鄰Gemini Decisions封面是粉紫油畫托盤，媒材、構圖、色盤不同。
- 內建imagegen生成原創，無第三方Logo與文字；保存src/assets/covers/gemini-hydrogen-orchestrator.webp，1600×900。全圖及320×180卡片已目視，兩個主體可辨識，無文字瑕疵。沒有新增圖解。
- 尚待主工作者統一執行最終format/policy/check/test/build、正式部署及頁面驗證。

## 2026-11-22 補查 CLI 1.5.14（Asia/Taipei）

- [1.5.14 官方發行說明](https://github.com/google-antigravity/antigravity-cli/releases/tag/1.5.14)：11 月 21 日發布。個人方案的本機 Orchestrator 列可選 Planner、Executor 及兩者的 Effort；沒有外推到企業方案或遠端。Auto 模式的工作區外預設讀取行為改變，既有 ask／deny、受保護設定及組織政策仍優先，工作區外寫入仍需核准。Windows 修補僅作版本提醒，未列受影響完整版本範圍、未宣稱在野利用，也未做重現。
- [官方模型文件](https://antigravity.google/docs/models#orchestrator)仍寫 CLI 的 `--effort` 和 `/effort` 不適用於 Orchestrator；正文將這兩個入口與 1.5.14 新版本的 `/model` 本機選單分開描述。
- 最新 main 基線 `ca093863`；在文章、研究及佇列按 Antigravity、Orchestrator、發行 URL 與 1.5.14 查重。更新同題原篇，保留首次發布日、網址、系列 116 與原封面，不另發一篇。
- 使用合成檔案的權限比較、訂單案例及驗收步驟是工程建議。未安裝或執行 Antigravity、未改動實際帳號權限，沒有新的效能或成本量測。
