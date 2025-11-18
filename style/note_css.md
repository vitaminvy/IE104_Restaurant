**_CSS Flexbox:_**

flex-direction: column; ⇒ trục chính (main axis) là dọc (top → bottom), còn trục chéo (cross axis) là ngang (left ↔ right).

👉 Ex:

.content-frame {
display: flex;
flex-direction: column; /_ sắp xếp dọc _/
align-items: center; /_ căn giữa theo trục ngang _/
justify-content: center;/_ căn giữa theo trục dọc _/
}

align-items: center; → căn giữa theo chiều ngang (cross axis).
justify-content: center; → căn giữa theo chiều dọc (main axis).

---

📌 Nếu đổi flex-direction: row; thì:

align-items sẽ căn theo dọc.
justify-content sẽ căn theo ngang.

/_ http://meyerweb.com/eric/tools/css/reset/
v2.0 | 20110126
License: none (public domain)
_/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
margin: 0;
padding: 0;
border: 0;
font-size: 100%;
font: inherit;
vertical-align: baseline;
}
/_ HTML5 display-role reset for older browsers _/
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
display: block;
}
body {
line-height: 1;
}
ol, ul {
list-style: none;
}
blockquote, q {
quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
content: '';
content: none;
}
table {
border-collapse: collapse;
border-spacing: 0;
}

**_Responsive Layer_**
40rem (640px)
tablet nhỏ

48rem (768px)
tablet lớn

64rem (1024px)
desktop

80rem (1280px)
xl desktop

96rem (1536px)
2xl

    •	File JS: kebab-case

navigate-menu.js, handle-cart.js
• Biến & hàm: camelCase
updateCart(), renderCheckoutForm()
• Class: PascalCase
class CartPage { ... }

Giải quyết vấn đề về lỗi không thêm logic JS ở thành phần mà sử dụng data-include đó là gắn thêm 1 sự kiện add Event sau khi include hoàn tất để sử dụng sự kiện đó chạy file JS
