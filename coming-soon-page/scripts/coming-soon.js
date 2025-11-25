const launchDate = new Date("2025-11-27T00:00:00").getTime();

// update countdown second
const timer = setInterval(() => {
  const now = new Date().getTime();
  const distance = launchDate - now;

  // Cal remaining time
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

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

  // When the time ends
  if (distance < 0) {
    clearInterval(timer);
    document.querySelector(".comingsoon__timer").innerHTML =
      "<p class='comingsoon__expired'>We are now live!</p>";
  }
}, 1000);
