function toggleDarkMode() {
  // change html data-bs-theme
  const currentTheme = document.documentElement.getAttribute("data-bs-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", newTheme);
  //using local storage to keep it persistent across each page
  localStorage.setItem("theme", newTheme);
}
(function () {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
})();
