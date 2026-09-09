const btn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

btn?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav a").forEach(a => {
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    btn?.setAttribute("aria-expanded", "false");
  });
});
