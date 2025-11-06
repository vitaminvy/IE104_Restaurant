// Logic: hiện hint của phương thức thanh toán
document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll(".payment__radio");

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      // Ẩn toàn bộ các hint trước
      document
        .querySelectorAll(".payment__hint")
        .forEach((hint) => (hint.style.display = "none"));

      // Hiển thị hint tương ứng với radio được chọn
      const option = radio.closest(".payment__option");
      const hint = option?.querySelector(".payment__hint");
      if (hint) hint.style.display = "block";
    });
  });
});
