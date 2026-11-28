# 图片脱敏与格式转换说明

封装内全部图片按“全文字区域整块打码”策略处理：对 OCR 可检测到的全部文字区域（双切片网格、psm 6/11/12 三模式融合，含低置信中文）做行级马赛克，人员姓名、机构客户名、明文内容与经营数字在识别能力范围内被遮蔽，色块与版式保留；打码后再按实体/金额/百分比/内部域名/多位数字规则复扫补打。

**能力边界（如实披露）**：OCR 对低清小字、艺术字、人像或标识内嵌文字仍可能漏检，本处理不构成数学意义上的零残留保证；封装内图片仅作版式与交互演示用途，不应作为对外分享的唯一脱敏依据。

| 原文件 | 封装内文件 | 处理方式 | 原大小 | 处理后 | 终检残余词数 |
|---|---|---|---|---|---|
| aime-strategy-support.png | aime-strategy-support.png | 运行时图·全文整块打码·1轮复扫·原格式保留（62 区） | 79 KB | 34 KB | 0（仅计数，不回显文本） |
| competitive-radar-move-free.png | competitive-radar-move-free.webp | 全文整块打码·PNG→WebP（1334 区） | 680 KB | 36 KB | 0（仅计数，不回显文本） |
| daily-track.webp | daily-track.webp | 运行时图·全文整块打码·1轮复扫·原格式保留（78 区） | 23 KB | 10 KB | 0（仅计数，不回显文本） |
| ida-daily-dashboard.png | ida-daily-dashboard.png | 运行时图·全文整块打码·1轮复扫·原格式保留（211 区） | 267 KB | 138 KB | 0（仅计数，不回显文本） |
| mcn-weekly.webp | mcn-weekly.webp | 运行时图·全文整块打码·1轮复扫·原格式保留（160 区） | 24 KB | 8 KB | 0（仅计数，不回显文本） |
| mcn-xingtu.webp | mcn-xingtu.webp | 运行时图·全文整块打码·1轮复扫·原格式保留（73 区） | 22 KB | 10 KB | 0（仅计数，不回显文本） |
| opp-bench.webp | opp-bench.webp | 运行时图·全文整块打码·1轮复扫·原格式保留（73 区） | 33 KB | 20 KB | 0（仅计数，不回显文本） |
| q3-quarterly-review.webp | q3-quarterly-review.webp | 运行时图·全文整块打码·1轮复扫·原格式保留（101 区） | 25 KB | 8 KB | 0（仅计数，不回显文本） |
| quality-creator-lab.webp | quality-creator-lab.webp | 运行时图·全文整块打码·2轮复扫·原格式保留（885 区） | 87 KB | 17 KB | 0（仅计数，不回显文本） |
| v20-390.png | v20-390.webp | 全文整块打码·PNG→WebP（6497 区） | 1447 KB | 87 KB | 0（仅计数，不回显文本） |
| v20-base.png | v20-base.jpg | 超长图·全文整块打码·PNG→JPEG（16758 区） | 4373 KB | 781 KB | 0（仅计数，不回显文本） |
| v20-cap.png | v20-cap.webp | 全文整块打码·PNG→WebP（9535 区） | 2526 KB | 170 KB | 0（仅计数，不回显文本） |
| v20-deck.png | v20-deck.webp | 全文整块打码·PNG→WebP（7193 区） | 1802 KB | 113 KB | 0（仅计数，不回显文本） |
| v20-mech.png | v20-mech.webp | 全文整块打码·PNG→WebP（4574 区） | 1182 KB | 71 KB | 0（仅计数，不回显文本） |
| v20-state.png | v20-state.webp | 全文整块打码·PNG→WebP（6052 区） | 1586 KB | 106 KB | 0（仅计数，不回显文本） |
| v21-390-top.jpg | v21-390-top.jpg | 全文整块打码·JPEG重压（419 区） | 84 KB | 42 KB | 0（仅计数，不回显文本） |
| v21-390.png | v21-390.webp | 全文整块打码·PNG→WebP（6822 区） | 1494 KB | 92 KB | 0（仅计数，不回显文本） |
| v21-base.png | v21-base.jpg | 超长图·全文整块打码·PNG→JPEG（17777 区） | 4401 KB | 771 KB | 0（仅计数，不回显文本） |
| v21-btn-all.png | v21-btn-all.webp | 全文整块打码·PNG→WebP（41 区） | 137 KB | 8 KB | 0（仅计数，不回显文本） |
| v21-btn-fb.png | v21-btn-fb.webp | 全文整块打码·PNG→WebP（2 区） | 10 KB | 1 KB | 0（仅计数，不回显文本） |
| v21-btn-l3b.png | v21-btn-l3b.webp | 全文整块打码·PNG→WebP（4 区） | 12 KB | 1 KB | 0（仅计数，不回显文本） |
| v21-btn-top.png | v21-btn-top.webp | 全文整块打码·PNG→WebP（5 区） | 11 KB | 0 KB | 0（仅计数，不回显文本） |
| v21-cap-top.jpg | v21-cap-top.jpg | 全文整块打码·JPEG重压（498 区） | 128 KB | 76 KB | 0（仅计数，不回显文本） |
| v21-cap.png | v21-cap.webp | 全文整块打码·PNG→WebP（9761 区） | 2509 KB | 171 KB | 0（仅计数，不回显文本） |
| v21-deck-mid.jpg | v21-deck-mid.jpg | 全文整块打码·JPEG重压（372 区） | 102 KB | 59 KB | 0（仅计数，不回显文本） |
| v21-deck-top.jpg | v21-deck-top.jpg | 全文整块打码·JPEG重压（321 区） | 106 KB | 62 KB | 0（仅计数，不回显文本） |
| v21-deck.png | v21-deck.webp | 全文整块打码·PNG→WebP（7231 区） | 1832 KB | 116 KB | 0（仅计数，不回显文本） |
| v21-mech.png | v21-mech.webp | 全文整块打码·PNG→WebP（4499 区） | 1177 KB | 70 KB | 0（仅计数，不回显文本） |
| v21-state.png | v21-state.webp | 全文整块打码·PNG→WebP（6033 区） | 1595 KB | 104 KB | 0（仅计数，不回显文本） |
| v_confirm.png | v_confirm.webp | 全文整块打码·PNG→WebP（802 区） | 270 KB | 17 KB | 0（仅计数，不回显文本） |
| v_state.png | v_state.webp | 全文整块打码·PNG→WebP（572 区） | 213 KB | 11 KB | 0（仅计数，不回显文本） |
| wk-analysis.webp | wk-analysis.webp | 运行时图·全文整块打码·1轮复扫·原格式保留（76 区） | 33 KB | 21 KB | 0（仅计数，不回显文本） |
| thumb-quality-creators.png | thumb-quality-creators.webp | 全文整块打码·PNG→WebP（844 区） | 300 KB | 23 KB | 0（仅计数，不回显文本） |

合计：27.90 MB → 3.18 MB，共 33 张。