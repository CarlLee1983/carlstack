# 系統設計每日實戰 14：物流事件的更新順序

## 去重與範圍

2026-10-24 Asia/Taipei，乾淨獨立 checkout 起點 main 3559f81a35bef768249b63caf8d3bc7d9a498c5d。已讀最新 AGENTS、content-guide、schema、兩份 workflow、diagram-guide、carlstack-copywriting、完整 humanize-writing SKILL、zh-tw 及 narrative-zh-tw，另讀 writing-style。Trail 不在 PATH，cache 不存在，依 fallback 查檔。

確認本系列 1–13 課 frontmatter，讀第13課全文及研究紀錄。blog、research、queue 搜尋 2026-10-24、shipping-event-order、物流通知、亂序；沒有同日文章或未完成本題。queue 是多活及共識，與每日單包裹案例不同。既有 Webhook／訊息交付概論未處理物流退件語意與正向進度；本篇延伸固定 dispatch，沒有重寫重試預算、接管租約與地址截止點。main 最近 commit 及5次部署均止於10月23日，無同日重複。

## 一手來源查核（2026-10-24）

- https://docs.easypost.com/guides/tracking-guide ：Tracking Details 明載 carrier 更新可能亂序，細節依收到順序追加，主要工作流程使用 Tracker 頂層 status。沒有把這句擴大成 EasyPost webhook 投遞順序保證，也沒有用時間戳當可靠版本。
- https://docs.easypost.com/docs/trackers ：Tracker 有獨立ID；單號會回收、非全球唯一。列出的 return_to_sender、failure 等是分支，不能硬編成單一完成度。
- https://support.easypost.com/hc/en-us/articles/360044353091-Understanding-Trackers ：Delivery and Status Handling 說退回寄件人後也會是 delivered；不把原始 delivered 直接當顧客收貨。官方文字的 returned_to_sender 與 API 枚舉字串不同，未抄成程式常數。
- https://docs.easypost.com/guides/webhooks-guide ：HMAC、成功回覆與失敗有限重送。教學採本地持久提交後 ACK，不只留記憶體。
- https://docs.easypost.com/docs/events ：事件獨立 ID、鼓勵冪等；未把直接 GET Event 當可取回原 result 的查詢方式，物流現況查 Tracker。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：鎖定讀的排他鎖至提交／回滾釋放。本地列鎖只排列決策，不能自行判定外部資料新舊。

## 設計與編輯審查

模組化單體、單主庫、單包裹。配送資訊與 fulfilling 訂單分開，不自動結案／退款。三種正向事件須介接層有足夠來源語意才能正規化；方向不明 delivered 進 review。明確允許跳過缺漏正向階段。needs_review 是獨立黏著旗標，普通正向通知不能清除。

技術複審發現初稿人工更正後會被晚到送達重新推進，已修正為 manual_control。人工更正、revision 條件及接管旗標同交易；更正後停止普通通知自動推進，首版不提供自動解除。獨立審稿及 parent 全文審閱確認無剩餘技術／來源阻擋問題。

正式文章中的 TypeScript 純函式抽出到暫存檔，以 Node 執行35項斷言：6種正向排列、review在每個位置、直接送達、重送及人工接管。資料庫、物流沙箱與壓測未執行，集中在開頭明示，並列出驗收方案。10,000包裹×8事件、平均2KiB、1%核對與200ms／30分鐘預算均為教學假設。

人工編輯標題、description、開頭、小標及正文，沒有以 checker 無命中代替判斷。去除鋪梗冒號、泛稱與口號式平衡句；不捏造作者親歷。剩餘4項 checker 命中為三個事件名稱欄位冒號及官方章節標題冒號，皆為正當標籤。

## 原創封面

最近兩篇封面已目視。13課為水彩黃銅壓機、斜向俯視、米白靛藍赭黃；12課為木刻深綠包裹、正面低角度、珊瑚紅深綠。新圖為白瓷3D雕塑、階梯斜向構圖、紫橘白冷柔光，媒材、構圖、色系至少三欄不同。

正式 built-in image_gen 原創，1672×941 PNG 轉 WebP，保存 src/assets/covers/order-system-shipping-event-order.webp。原圖 generated_images/exec-bfc6c3ff-531c-4fc2-920d-ef7d92e6ae5e.png。完整與320×180卡片均已目視，無文字／logo，主體未截斷，alt依像素描述。

Prompt：stylized-concept editorial cover, lavender studio isometric porcelain stepped track, orange-banded white parcel at highest stop, two detached violet earlier-stage tiles behind; no text, logos, arrows or UI.

## 驗收與預覽限制

Node24.22.1；預設pnpm11.25不符要求，隔離npm cache安裝pnpm12.1.0後，pnpm install --frozen-lockfile成功，未修改engine或lockfile。XDG config/cache使用可寫tmp路徑。

ShippingEventOrderDiagram為960×600桌面SVG與320×700窄版SVG，48rem互斥切換，title／desc、前綴ID及dg tokens。直接抽取實際SVG與CSS，代入站內淺／深色token，用sharp渲染桌面960px及窄版272px（模擬320px頁面扣除邊距）四張，均已目視，無文字重疊、溢出或截斷。此為靜態SVG像素驗證，不等同實頁瀏覽器通過。

Astro dev在ready前退出（Dev server process exited before becoming ready）。Playwright啟動系統Chromium失敗，完整錯誤包含 process_singleton socket() Operation not permitted；沒有改專案設定或繞過環境限制。實頁桌面／320px深淺色、互斥樣式及全頁捲動仍未驗，依已授權預覽例外不阻擋其餘發布步驟。

初輪 content:policy -- HEAD 1篇通過，Astro check 223檔0 errors／warnings，pnpm test 117/117通過。最終production build、RSS／Sitemap／Pagefind／series及精確main部署／正式站驗證於交付訊息回報，不把建置中途或本地產物當已上線。
