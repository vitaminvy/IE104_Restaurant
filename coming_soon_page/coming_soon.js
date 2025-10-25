// === Cấu hình ngày đếm ngược (ví dụ 26/11/2025) ===
const launchDate = new Date("2025-11-26T00:00:00").getTime();

// === Cập nhật mỗi giây ===
const timer = setInterval(() => {
  const now = new Date().getTime();
  const distance = launchDate - now;

  // Tính toán thời gian còn lại
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Gán vào DOM (chuẩn BEM selector)
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(
    2,
    "0"
  );
  document.getElementById("seconds").textContent = String(seconds).padStart(
    2,
    "0"
  );

  // Khi đến thời điểm đích
  if (distance < 0) {
    clearInterval(timer);
    document.querySelector(".comingsoon__timer").innerHTML =
      "<p class='comingsoon__expired'>We are now live! 🎉</p>";
  }
}, 1000);
