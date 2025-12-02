# IE104_Restaurant - WowWraps

Chào mừng đến với **WowWraps** - Dự án website nhà hàng hiện đại, tập trung vào trải nghiệm người dùng mượt mà và giao diện tương tác cao.

## Tác giả & Thành viên nhóm 5

*   **Giảng viên hướng dẫn:** ThS Võ Tấn Khoa
*   **Thành viên:**
    *   23521827 – Hồ Vương Tường Vy
    *   23521500 – Ngô Văn Thịnh
    *   23521497 – Dương Phước Thịnh
    *   23521647 – Phan Hữu Trí

---

## Giới thiệu

Dự án được xây dựng bằng các công nghệ web thuần (Vanilla), không phụ thuộc vào framework, nhằm tối ưu hóa hiệu suất và hiểu sâu về bản chất của web:
*   **HTML5** (Semantic)
*   **CSS3** (Variables, Flexbox, Grid, Animations)
*   **JavaScript** (ES6+, Modules)

Mục tiêu: Xây dựng một hệ thống đặt bàn và quản lý nhà hàng hoàn chỉnh phục vụ môn học IE104.

---

## Các chức năng chính

### 1. Hệ thống Đặt bàn & Đặt món (Core)
*   **Đặt bàn trực tuyến:** Form đặt bàn thông minh, chọn giờ, số lượng khách và nhận phản hồi tức thì.
*   **Thực đơn tương tác (Dynamic Menu):**
    *   Lọc món ăn theo danh mục (Sáng, Trưa, Tối...).
    *   Hệ thống **Cart (Giỏ hàng)** hoạt động thời gian thực (lưu trữ LocalStorage).
    *   Trang **Checkout** chi tiết với tính toán thuế, phí vận chuyển.
*   **My Dining (Lịch sử hoạt động):** Trang quản lý cá nhân cho phép người dùng xem lại lịch sử đặt bàn và các đơn hàng đã đặt, lọc theo trạng thái (Chờ xác nhận, Hoàn thành...).

### 2. Hệ thống Xác thực (Authentication)
*   **Đăng nhập / Đăng ký:** Giao diện hiện đại, hỗ trợ validate dữ liệu thời gian thực.
*   **Smart Redirect:** Tự động chuyển hướng người dùng về trang cũ sau khi đăng nhập thành công.
*   **Quên mật khẩu & OTP:** Luồng khôi phục mật khẩu đầy đủ với mã xác thực (mô phỏng).
*   **User Menu:** Menu người dùng tích hợp trên Header cho phép truy cập nhanh giỏ hàng và đăng xuất.

### 3. Trải nghiệm người dùng & Tiện ích (UX/UI)
*   **Đa ngôn ngữ (i18n):** Chuyển đổi mượt mà giữa Tiếng Anh và Tiếng Việt cho toàn bộ nội dung website.
*   **Chế độ Sáng/Tối (Dark/Light Mode):** Giao diện thích ứng hoàn hảo với sở thích người dùng.
*   **Allergy Settings (Cảnh báo dị ứng):** Tính năng độc đáo cho phép người dùng chọn các thành phần dị ứng, hệ thống sẽ tự động cảnh báo trên thực đơn.
*   **Centralized Asset Management:** Sử dụng `base-assets.js` để quản lý và tối ưu hóa việc tải tài nguyên (CSS/JS) tập trung, giúp trang tải nhanh và dễ bảo trì.

---

## Cấu trúc thư mục

Dự án tuân thủ cấu trúc **Multi-page Static Site**, với các trang nằm ở thư mục gốc để đảm bảo URL thân thiện.

```text
/
├── index.html              # Trang chủ (Homepage)
├── auth/                   # Module xác thực (Login, Register, OTP...)
├── activity-history/       # Trang lịch sử hoạt động (My Dining)
├── menupage/               # Trang thực đơn
├── cartpage/               # Trang giỏ hàng
├── checkout-page/          # Trang thanh toán
├── aboutpage/              # Trang giới thiệu
├── contact-us-page/        # Trang liên hệ
├── blogpage/               # Trang tin tức
├── product-detail-page/    # Trang chi tiết món ăn
├── assets/                 # Tài nguyên tĩnh (Images, Icons, Scripts chung)
│   └── script/base-assets.js  # Core script quản lý tài nguyên tập trung
├── partials/               # Các thành phần giao diện tái sử dụng (Header, Footer)
└── style/                  # CSS dùng chung (Global styles)
```

---

##  Cách cài đặt & Chạy dự án

1.  **Clone repository:**
    ```bash
    git clone https://github.com/vitaminvy/IE104_Restaurant.git
    ```
2.  **Chạy dự án:**
    *   Cách đơn giản nhất: Cài đặt Extension **Live Server** trên VS Code.
    *   Chuột phải vào file `index.html` -> Chọn **"Open with Live Server"**.

---

## Đóng góp

Dự án luôn hoan nghênh các đóng góp để hoàn thiện hơn. Vui lòng tạo **Pull Request** hoặc báo lỗi qua mục **Issues**.

© 2025 WowWraps Team.
