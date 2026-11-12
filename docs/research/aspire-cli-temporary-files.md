# Aspire CLI 暫存檔資訊洩漏查核

查核日期：2026-11-12（Asia/Taipei）。基線 main `6cffee0d574700fa6b9d54c84fc4429eaa20f378`。

## 去重與編輯

以 `CVE-2026-120792`、`120792`、`GHSA-q6jf-24jf-m3cg`、`Aspire CLI` 搜尋文章、研究與佇列，沒有既有專文命中。trail 執行檔及 cache 不存在，改用完整檔案搜尋。父任務查核 open PR 與當日發布。

已讀 AGENTS、content-guide、schema、copywriting、humanize-writing 與 zh-tw 規則，對照既有 Outlook 安全文章。標題依使用者最新要求直接說明主題，不套用「標題是主張」舊偏好。這篇聚焦開發工具資產修補，單篇可獨立閱讀，未硬加入 API 或 AI 工作流系列。沿用既有資訊安全、開發工具標籤。

## 一手來源

- https://github.com/dotnet/announcements/issues/518
  - 原始公告 V1.0 November 10, 2026，完整讀取。created_at 為 2026-11-10T21:51:22Z。
  - CVSS 3.1 7.3 High，`AV:L/AC:L/PR:L/UI:R/S:C/C:H/I:L/A:L`。MSRC severity Important，CWE-532，Information Disclosure。
  - Linux、macOS，x64、Arm64。已棄用 MCP configuration scanner 的診斷暫存檔可能包含設定內容，固定路徑在共享暫存目錄中。
  - `Aspire.Cli` >=13.2.0 <13.6.5；NuGet 平台套件 >=13.3.0 <13.6.5；npm 主套件與平台套件 >=13.4.2 <13.6.5。全部修補13.6.5。
  - .NET SDK/runtime更新不代表Aspire已更新；npm平台相依套件也須更新。
- https://github.com/microsoft/aspire/issues/22100
  - 專案 companion 公告完整讀取，版本、條件及修補相同。無實際利用聲明。
- https://github.com/advisories/GHSA-q6jf-24jf-m3cg
  - GitHub reviewed metadata列Published Nov10、Updated Nov11。以更新日期作本日新聞背景，不將Nov11誤寫初次公開。

查核與文章未聲稱漏洞已遭利用，沒有執行PoC、Aspire安裝更新或runner回歸。暴露調查、憑證評估、映像重建和資產驗收是明示的工程建議。沒有提供未驗證的自動修補指令。

## 封面方向與驗收

鄰近Outlook封面已目視：米白／鼠尾草綠、俯視、紙張攝影。新封面為靛藍／琥珀、斜側視角、版畫，共三項主要差異。概念是共用工作檯的外露文件，不是實際漏洞介面。

使用正式內建imagegen，提示：wide 16:9 editorial cover, dark indigo linocut illustration of a terminal workstation at a shared workbench, amber papers exposed in a common tray, small coral warning tab, blank monitor, no text/logos, oblique side view, readable at320px。

交付 `src/assets/covers/aspire-cli-temporary-files.webp`，1672×941，294994 bytes。原始生圖保留。已目視全尺寸及320×180卡片：無文字／Logo，螢幕與外露文件辨識清楚，裁切保留主要資訊。無正文圖解，無SVG項目。

## 驗收交接

只新增本文、封面與本紀錄，未commit/push。父任務統一執行format、content policy、check、test與完整build，發布前校準publishDate；本紀錄不預稱這些檢查完成。文章無可執行示例，必要Aspire整合測試明示未跑。
