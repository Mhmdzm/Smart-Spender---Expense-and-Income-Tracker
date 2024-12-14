
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  const h1 = header.querySelector("h1");

  const scrollY = window.scrollY;
  const scale = Math.max(1 - scrollY / 90, 0);

  h1.style.fontSize = `${1.5 * scale}em`;
  h1.style.opacity = scale;
});

window.onload = function () {
  loadTransactions();
  updateGraph();
  window.scrollTo(0, 0);
};

