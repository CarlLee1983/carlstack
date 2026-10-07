# Django 十月安全更新：來源與驗收紀錄

- 核對日期：2026-10-07，Asia/Taipei
- 正式文章：`src/content/blog/django-october-security-patch-regression.md`
- 主來源：[Django 2026-10-06 安全公告，Sarah Boyce](https://www.djangoproject.com/weblog/2026/oct/06/security-releases/)
- 研究範圍：官方公告、release notes、公開修補 diff 靜態閱讀；未安裝 Django、未跑漏洞重現或服務回歸測試

## 去重與差異化

在 e7163a93ff5b2acd8a9ed4072ce97b809877a2a3 的完整 checkout 搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md`：Django、主來源 URL、Sarah Boyce、84429、87890、87975、77050、15307 無同源文章。站內 OpenWA 與 NetScaler 文章為相鄰安全主題，本篇針對 Django 四種入口與安全更新後的應用回歸，讀者收穫不同；正文連至兩篇既有文章。

系列：現代網路協定與 API 平台架構，17；未修改舊文、queue 或共用設定。

## 事實來源與界線

### 發布範圍

公告確定 6.1.2、6.0.9、5.2.18 修補，支持分支為 main、6.1、6.0、5.2。未宣稱在野利用，正文不把缺少聲明解讀成沒有攻擊。[6.1.2 release notes](https://docs.djangoproject.com/en/dev/releases/6.1.2/)另外包含既有 GIS 緩解補強及 bugfix，因此文章沒有宣稱整版只有四個變更。

### HTTP header

[7ff7fcc0508864a4bc39693128ace38b1e95a890](https://github.com/django/django/commit/7ff7fcc0508864a4bc39693128ace38b1e95a890)：平方級分隔符解析，重複 header 合計不受單次長度限制代表；改 Message parser，保留無參數 fast path，RFC2231 行為差異。正文的負面測試、CPU 預算與代理整合建議為作者設計，不是 upstream 實測數據。

### Raster bytes

[4e77ef1e69c94780006b82795aa7db101996c3af](https://github.com/django/django/commit/4e77ef1e69c94780006b82795aa7db101996c3af)：6.1 分支 CVE-2026-87890 修補，blocked bytes in spatial lookups；valid hex geometry bytes 保留，raster 需要 GDALRaster wrapper。不要把顯式包裝誤說成 untrusted VRT 內容已安全。正文不提供實際敏感端點或攻擊 payload，只建議受控本地測試與出站觀察。

### Formset

[83cbd21be57483e6b3eb6e4688a561c841aff75e](https://github.com/django/django/commit/83cbd21be57483e6b3eb6e4688a561c841aff75e)：可編輯 PK 被補入 newly constructed instance，save_existing_objects 現在同時查 `_state.adding`。正文按官方 release notes 寫預設 BigAutoField 不受此漏洞影響；不是說所有 UUID 模型或所有 formset 都受影響，必須有可由表單設定 PK 條件。A/B 組工單與資料前後比較為作者自創測試案例。

### 語系快取

[c88b304cc2d90fc37d3bd1f5f3829706fa6c13bc](https://github.com/django/django/commit/c88b304cc2d90fc37d3bd1f5f3829706fa6c13bc)：先前長度檢查沒有阻止完整字串先進 lru_cache key；cached helper 移到驗證/截短後。長度門檻 500，low severity。正文的資源預算與量測方法均未聲稱跑過。

## Cover Direction

已檢視昨日三張相鄰封面：ReviewBench 深藍橘木刻橋、Deepagents 奶油白綠紙雕、SubQuery 紫底瓷器。新封面採機械水閘與四顆獨立止擋的隱喻，水彩與鉛筆媒材、斜向俯視構圖、粉橘酒紅與黃銅色、明亮漫射光。媒材、構圖、主色至少三項不同。

內建 imagegen 原創生成，1536×1024 PNG。正式檔 `src/assets/covers/django-october-security-patch-regression.webp`。已看全尺寸與 320×180 裁切卡片，主水閘清楚、四個止擋位於右下可辨，沒有文字、標誌、水印；coverAlt 描述實際資訊，不聲稱畫面為真實漏洞場景。

生成 prompt 核心：original editorial watercolor and graphite illustration; miniature mechanical sluice gate with four independent brass stop pins; coral pink water, dusty burgundy, brass and warm gray; diagonal overhead view, diffuse morning light; no words, numbers, logos, people, shields or padlocks.

## 驗收

- 新文 offset timestamp、draft false、featured false、原創本地 cover 與 alt
- 不包含 Mermaid 或流程圖；採段落與短清單，沒有 Markdown 表格
- 全站 format、content policy、check、tests、production index 與 exact-SHA deploy 於三篇整合後驗收，不在此預先宣稱通過
