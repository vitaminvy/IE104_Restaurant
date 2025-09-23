Quy tắc viết code (HTML, CSS, JS)
 1. HTML
    - Thụt dòng: 2 hoặc 4 spaces, thống nhất toàn dự án.
    - Tag: luôn viết chữ thường.
    - Thuộc tính: viết trong dấu nháy đôi " ".
2. CSS
    - Đặt tên class: theo chuẩn BEM (Block__Element–Modifier).
    - Sắp xếp rule trong mỗi class:
      + Vị trí (position, top/right/bottom/left, z-index)
      + Box model (display, width, height, margin, padding, border)
      + Typography (font, text-align, color, line-height)
      + Background/animation/others
    - Không viết CSS inline trong HTML.
    - Reset/Normalize: dùng reset.css, không chỉnh sửa.
3.  JavaScript
    - Tên biến & hàm: camelCase.
    - Hằng số: viết in hoa + gạch dưới.
    - Comment:
	    + // cho ngắn
	    + /* ... */ cho nhiều dòng
    - Không viết JS inline trong HTML (dùng file .js riêng).
4. Tổ chức code & file
    - Tên file: viết thường, dùng - nếu nhiều từ (contact-form.js, about-page.css).
5. Git workflow
   - Branch:
	    + feat/ → thêm tính năng
      +	fix/ → sửa lỗi
	    + hotfix/ → fix gấp
      + chore/ → việc lặt vặt (config, format code)
  -  Commit message: Ngắn gọn, rõ ràng
     vd: feat: thêm navbar cho trang chủ
  -  Không commit file thừa (node_modules, file tạm, .DS_Store).
    
     
