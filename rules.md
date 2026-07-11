# đây là file memory dành cho AI giảm sự slop và giúp nó thông minh hơn chút. cứ ném cho nó đọc thì 99% stonk

**LƯU Ý CỐT LÕI CHO AI:** Bất cứ khi nào User yêu cầu "đọc memory" hoặc khi bắt đầu một phiên làm việc, BẮT BUỘC PHẢI DÙNG TOOL view_file ĐỂ ĐỌC TRỰC TIẾP LẠI FILE NÀY. Tự tiện dùng trí nhớ (context) của đầu phiên là CẤM, vì User có thể vừa thêm hàng tá rule mới vào file này từ bên ngoài. Không được cãi "đã đọc rồi".
### NHỮNG ĐIỀU TUYỆT ĐỐI CẤM (PHẢI TRÁNH - MUST AVOID):
1. **CẤM XÓA FILE DATA ĐỘNG:** Tuyệt đối không được xóa bất kỳ file .txt hoặc .jsonl nào (vd: users.txt, queue.jsonl, withdraw_queue.jsonl, acions.txt). Hệ thống sử dụng chúng làm Message Queue và Data Storage tĩnh. Xoá là mất sạch data/queue.
2. **CẤM CHẠY LỆNH SERVER:** Tuyệt đối không tự ý chạy pm2 restart, pm2 start, pm2 stop, 
pm run build, build.bat hay bất cứ lệnh khởi động/dừng server nào trừ khi User CHỈ ĐỊNH ĐÍCH DANH. Để User tự check PM2 và Web.
3. **CẤM XÓA MÙ:** Tuyệt đối không xoá bất cứ file hay đoạn code nào nếu chưa dùng grep_search để rà soát toàn bộ dự án. Đọc code phải đọc sâu, đọc 10 lần để phân tích luồng chạy (data flow, IPC message) xem nó đang làm nhiệm vụ gì, chứ không phải đọc lướt vài dòng đầu để lấy lệ.
4. **CẤM DÙNG GIT:** Tuyệt đối không sử dụng bất kỳ lệnh git nào (add, commit, restore, checkout...) trừ khi User trực tiếp gõ chữ "git" trong prompt.
5. **CẤM XIN LỖI:** Không cần và không được nói xin lỗi suông. Nếu làm sai, yêu cầu bắt buộc là: Đưa ra phân tích (reasoning) cặn kẽ vì sao sai dựa trên phân tích code, và khắc phục hậu quả ngay lập tức.
6. **CẤM DÙNG EMOJI HỆ THỐNG:** Không được dùng các emoji kiểu hệ thống (như cảnh báo, robot...) để tỏ ra máy móc, giữ văn phong xưng hô "tao - mày" hoặc bình thường.
7. **QUY TẮC VIẾT COMMENT CODE:** Tuyệt đối chỉ viết comment kiểu: {dấu comment} đoạn code này sẽ làm gì đó. Không viết hoa bất kỳ chữ nào (kể cả chữ cái đầu dòng). Giải thích ngắn gọn, dễ hiểu, mang tính coder thực tế. Không giải thích chi tiết dài dòng. Không spam comment (viết vừa đủ). Tuyệt đối không dùng icon/emoji trong comment.
8. **CẤM NHÉT EMOJI VÀO CODE:** Tuyệt đối KHÔNG ĐƯỢC thêm bất kỳ emoji nào vào trong source code (bao gồm UI text, logic code, log console, hoặc bất cứ file nào). Giao diện và code phải hoàn toàn sạch emoji.
9. **XỬ LÝ LỖI ENCODING:** Nếu xảy ra lỗi hiển thị (encoding) đối với tiếng Việt (như trong file .bat, console) do giới hạn hệ thống, TUYỆT ĐỐI KHÔNG chuyển sang tiếng Việt không dấu. Phải chuyển toàn bộ nội dung đó sang Tiếng Anh.
10. **CẤM DÙNG AI SLOP UI:** Tuyệt đối không được dùng các hiệu ứng AI slop rỗng tuếch như background gradient lòe loẹt, aurora gradients rẻ tiền, hay các pattern UI công nghiệp chung chung. Thay vào đó, dùng CSS tĩnh hoặc animation có phong cách thực dụng, tinh tế, hoặc làm chính xác theo thiết kế gốc.
11. **BẮT BUỘC ĐỌC MEMORY:** Bất kể hệ thống có nhắc hay không, hành động ĐẦU TIÊN khi vào một phiên làm việc mới phải là dùng view_file đọc lại toàn bộ nội dung file memory.md này để không quên luật.
12. **HỎI TRỰC TIẾP, KHÔNG HỎI TRONG PLAN:** Tuyệt đối không chèn câu hỏi mở (Open Questions) vào file `implementation_plan.md` vì User dùng auto-proceed và không đọc Plan. Bất cứ khi nào cần hỏi ý kiến quyết định, phải dừng lại và chat trực tiếp ra ngoài màn hình để User trả lời.
13. **CẤM TẠO FILE RÁC:** CẤM TẠO FILE RÁC ĐỂ TEST HAY LÀM GÌ BẤT KỂ MỤC ĐÍCH GÌ. Tuyệt đối không tự ý đẻ thêm script linh tinh vào dự án.
