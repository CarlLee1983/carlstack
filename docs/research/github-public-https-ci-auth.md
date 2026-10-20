# GitHub HTTPS 認證稿查核與封面交付

查核日期：2026-10-20。主公告日期：2026-10-19。此文件供文章來源查核，不加入公開正文。

## 交付

- 全文：github-public-https-ci-auth.md；父已親讀通過。draft、發布時間、標籤由整合最後確認。
- 封面：github-public-https-ci-auth.webp（1672 × 941，近16:9），建議放 src/assets/covers/github-public-https-ci-auth.webp。
- 卡片驗收：github-public-https-ci-auth-card.png（384 × 216）。全尺寸與卡片已目視，無意外文字、logo，圓形憑證／局部閘門仍可辨識。
- 原圖：/workspace/scratch/d935b46a4408/generated_images/exec-b51c6120-1c40-428a-8dc9-c76aae04b4d8.png。
- 未執行文章 YAML／CI，不曾建立憑證，未改任何帳戶設定。未commit/push。

## 一手來源與範圍

1. https://github.blog/changelog/2026-10-19-some-git-over-https-may-temporarily-require-authentication/
   已讀完整公告。異常流量期間、部分public HTTPS clone/fetch暫需認證；非全面要求；受影響訊息表明認證需求。authenticated HTTPS、SSH、push、unrelated web/API不受此措施影響。未公布固定完整錯誤字串、特定HTTP code或解除時間。Actions推薦GITHUB_TOKEN，外部CI優先installation token，可用PAT，不能認證則等解除後再試。
2. https://github.com/actions/checkout/tree/v4
   已讀README。token預設github.token、contents read、persist-credentials false、當前repo token不能讀另一private repo。正文刻意指定v4已查文件作示例，不稱最新，不鼓勵為此次事件更換版本；正式需相容／已審SHA。
3. https://docs.github.com/en/actions/tutorials/authenticate-with-github_token
   已讀全文。permissions可在workflow/job縮限；action即使未顯式傳token亦能從github.token存取。
4. https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
   已讀全文。installation token支援HTTP Git、Contents權限、一小時到期、可縮限repo/permissions且不能擴大原installation授權。正文額外指出長期私鑰管理與第三方repo無法任意安裝的部署前提。
5. https://git-scm.com/docs/gitcredentials
   已讀認證與helper機制。支撐筆電與乾淨CI認證來源不同；安全注入／避免URL保存屬本文建議。
6. https://docs.github.com/en/repositories/creating-and-managing-repositories/troubleshooting-cloning-errors
   已讀全文。Repository not found可能repo不存在或沒有權限；一般403不能直接當新政策證據。舊版Git建議未採入本文。

## Cover matrix

- 最近同題材封面：github-actions-lockfile-review-boundary.webp。木製框與插銷／立體實物攝影感／俯看幾何堆疊／奶油白、藍、珊瑚／明亮硬陰影。
- 本篇：紙帶經部分認證閘門／紙雕編輯插圖／水平斜向流動／深綠、象牙、琥珀／柔和層疊陰影。
- 至少在隱喻、媒材、構圖、主色與光線五維不同。工具：built-in imagegen，單次生成，未重產。Pillow僅轉WebP與卡片縮圖。

## 完整生成prompt

Use case: stylized-concept. Asset type: original editorial cover for a Traditional Chinese engineering blog article about temporary authentication for some anonymous Git HTTPS downloads. Wide 16:9 landscape, no text. A sophisticated handcrafted paper-cut editorial illustration: several pale cream paper ribbons flowing toward a single small amber swing gate, one ribbon with a simple stamped circular credential token passes smoothly through a narrow opening while other ribbons wait. Plenty of visible open space around the small gate, suggesting selective temporary control rather than a locked world. Flat frontal diagonal composition, bold forest green background, ivory paper and amber accents, tactile cut-paper edges, restrained soft layered shadows. Minimal 3-4 primary forms readable at 320px card size. Avoid computers, padlocks, chains, brand logos, octopus, lettering, numbers, watermarks, blue wooden frames, photorealism. Do not render any words.
