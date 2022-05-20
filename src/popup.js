"use strict";
const pages = ["import-wallet", "accounts", "settings", "payment"];

let showPage = (page_id) => {
  pages.forEach(
    (page) => (document.getElementById(page).style.display = "none")
  );
  document.getElementById(page_id).style.display = "block";
};

showPage("import-wallet");

document
  .getElementById("wallet-btn")
  .addEventListener("click", async () => showPage("accounts"));
document
  .getElementById("settings-btn")
  .addEventListener("click", async () => showPage("settings"));
document
  .querySelector(".payment-btn")
  .addEventListener("click", async () => showPage("payment"));
