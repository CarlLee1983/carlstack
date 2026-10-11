# GenOffice HTTP MCP 暫存權限

## 去重與來源

2026-10-11查詢blog/research/queue的GenOffice、genspark-ai/genoffice、CVE-2026-108582、GHSA-29j6-3xvc-79ff、原始/正規化URL及HaiND；無同源文章。LMCache舊文涉及pickle與程序邊界，不同失敗機制，正文已內鏈。本篇不列系列：現有AI系列以工作流為核心，此篇是特定部署安全公告，獨立閱讀完整。

- 主來源：https://www.vulncheck.com/advisories/genoffice-through-0.11.505-insecure-permissions-in-http-mcp-server-file-store
- CNA：https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/108xxx/CVE-2026-108582.json
- 研究者：https://hackmd.io/@haind/genoffice-http-mcp-temp-file-disclosure ，HaiND，Post and Telecommunication Institute of Technology。
- 原碼：https://github.com/genspark-ai/genoffice/blob/v0.11.505/packages/cli/src/mcp/files.ts 與同目錄http.ts。
- Node：https://nodejs.org/api/fs.html#fsmkdirsyncpath-options 、https://nodejs.org/api/fs.html#fscreatewritestreampath-options 。

## 已核事實與限制

CVE record 2026-10-10T15:57:50.632Z發布、datePublic為2026-10-09；不是10/10首度揭露。≤0.11.505 affected，CVSS4 6.8Medium、CVSS3.1 5.5Medium，LOCAL/LOW privileges，機密性HIGH。無可核實修補版，GHSA unreviewed不能當patched證據。未找到在野利用證據。

研究者Linux Node22獨立FileStore lab，用nobody讀canary；umask022得0755/0644可讀，077得0700/0600拒讀。研究者未測完整packaged HTTP server、未調查常見launcher umask；本文沒有獨立重跑。原碼確認mkdirSync recursive未設mode、createWriteStream未設mode、tmpdir的PID/random根目錄；原码TTL1h、5min sweep、get更新touched。

重要校正：umask只移除權限，不能擴大顯式mode；PrivateTmp主要提供namespace隔離不能保證mode；既有檔案不因新umask自動收權。0700/0600只隔離不同UID，不能隔離同UID agents/租戶。容器需看共享掛載與UID映射，不一概判安全或無效。本文canary驗收是工程建議，標未執行，不提供讀取其他使用者文件的利用步驟。

## Cover Direction

本篇：前門有鎖、側面露出文件的檔案櫃與私有布袋／毛氈縫製材質／側前近景／鼠尾草綠、粉桃、灰與白／柔和日光。相鄰Rollup為木紙模型、斜俯單環、靛藍珊瑚、戲劇光，兩圖至少媒材、構圖、主色、光線四項不同。已用正式imagegen生成原創本地cover，無文字logo。

## 視覺驗收

封面1672×941 WebP，全尺寸與卡片中央裁切已看像素。Rollup圖已用SVG靜態渲染檢視桌面/320px、深/淺色四版；文字可讀無重疊。雲端本機Chromium受socket與sandbox掛載限制，未完成整頁互動preview；此限制依本次授權記錄，不宣稱browser驗收通過。

獨立事實複核已通過，另核對drop只對uploads下檔案做實體刪除，其他exposed output不保證刪檔。正文已區分TTL過期項目與磁碟清除。
