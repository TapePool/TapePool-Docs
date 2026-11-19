# Bản 中文 của TapePool Docs

Nội dung tiếng Trung nằm trong `src/pages.zh.js` (21 trang, cùng id với bản tiếng Anh). Chạy `npm run check:cn` để kiểm tra lại.

---

## 发布备注

**Kết quả checker** (`check-cn.js --mode docs`): 0 lỗi, 4 cảnh báo. Cả 4 cảnh báo đều là "30-day term is not in the MVP" và đều hợp lệ:
- trang 进展与路线图 và 借贷条款与费用: câu nói rõ kỳ hạn 30 ngày **chưa có** (暂缓 / 暂不提供);
- trang 信用规则: câu giải thích vì sao mạch **không** mã hoá kỳ hạn 30 ngày;
- trang 借贷条款与费用: "减半前 30 天" là biên an toàn trước kỳ halving, không phải kỳ hạn vay.

**Thuật ngữ mới, chưa qua người đọc bản ngữ duyệt** (cần reviewer xác nhận):
- 守护者（guardian）: khoá guardian của keeper.
- 兜底份额（backstop）: phần share hạt giống của owner, giới hạn tổng dư nợ.
- 没收窗口: cửa sổ 24 giờ để seize (lấy từ chính app: "没收窗口结束").
- 借款依据 / 已登记的凭证: thay cho "collateral", để tránh 抵押 theo glossary.
- 未登记: trạng thái "not collateral".
- 设计加成: design bonus (câu hỏi mở số 4 trong glossary; app đã dùng từ này).
- 存疑: doubtful (app đã dùng).

**Các câu hỏi mở của glossary mà bản docs đã chọn một phía:**
- Câu 2: dùng 存入 / 提取 cho phía người cho vay (giống nút trong app), không dùng 出借 / 取回.
- Câu 3: giữ 滞纳金 cho late fee.
- Câu 1: không dùng 放款; phía pool nói 发放借款 / 发放 BEM (giống sơ đồ tiếng Trung).

**Claim đã làm mềm hoặc bỏ:**
- Bỏ mọi câu nhắc audit ở cả hai ngôn ngữ (19/11/2026, owner: không nói về audit). README của repo TapePool vẫn có câu "After the hackathon we plan a third-party audit".
- 19/11/2026, theo yêu cầu owner: bỏ câu "智能合约存在风险，您可能损失资金。任何协议都不能排除全部风险。" (khung cảnh báo ở trang 风险), câu mở đầu giống vậy ở khung cảnh báo trang 概述, và nửa câu tương tự ở dòng "内容审阅于" cuối mỗi trang. Bản tiếng Anh bỏ tương ứng.
- Câu hỏi FAQ không dùng chữ 清算 nữa: "BEM 价格下跌会影响我的贷款吗？"; câu trả lời dùng cụm đã duyệt "BEM 价格波动不会触发清算" và nêu ngay đường seize.
- Hạn mức chỉ ghi theo tỷ lệ (70%, 40%, 20% / 5%), không ghi số BEM.

**Owner đã xác nhận** (áp dụng cho cả bản tiếng Anh):
- 19/11/2026, owner xác nhận trong chat: docs ghi "live on mainnet" / "已在 X Layer 主网运行". Hợp đồng chạy từ 16/11/2026, mở vay từ 18/11/2026, khoản vay đầu tiên được trả bằng BEM đào được ngày 24/10/2026 (trên một bản deploy cũ).
- 19/11/2026: docs public cùng lúc với app, nên app đã chạy, không ghi "即将上线". Link app: https://app.tapepool.io ("应用地址", nút "启动应用" theo đúng chữ trên landing). Câu FAQ "应用上线了吗？" trả lời "已上线". Landing hiện vẫn ghi "应用即将上线" và cần đổi cùng lúc docs public.
- 19/11/2026: đăng địa chỉ hợp đồng của TapePool ở trang mới 合约地址 (`#contracts`): chỉ các hợp đồng đang dùng: bộ redeploy 4 trên X Layer, mạch "Tape Pool Policy" (Circuits + Transistors) và reporter trên BSC. Theo yêu cầu owner, không liệt kê các pool và feed đã ngừng, cũng không liệt kê hợp đồng của TapeOut, BEM, LayerZero. Ví owner và guardian chưa đưa vào.
- Thuật ngữ mới ở trang 合约地址 (chưa qua người bản ngữ duyệt): 实现合约 (implementation), 矿机数据源接收合约 / 报告合约, 晶体管合约 (Transistors), 部署者 (deployer).

**Cần owner xác nhận trước khi public** (áp dụng cho cả bản tiếng Anh):
- Ngày keeper tài trợ phí LayerZero đến 15/12/2026 lấy từ bài đăng X ngày 16/11.

**Ảnh minh hoạ:** ảnh UI tiếng Trung được chụp từ fixture của app với `?lang=cn`. Sơ đồ "一笔贷款如何运作" có bản tiếng Trung; ba sơ đồ còn lại (reward paths, repayment release, no price-triggered liquidations) chỉ có bản tiếng Anh, chú thích có ghi "（图为英文）".
