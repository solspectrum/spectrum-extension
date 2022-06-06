"use strict";

// HELPER FUNCTIONS
const showPage = (()=> {
  let currentPage = "start"; // private vsriable
  return async (page_id, props={}) => {
    document.getElementById(currentPage).style.display = "none";
    currentPage = page_id;
    document.getElementById("loading").style.display = "flex";
    await PAGES[page_id].render(props);
    document.getElementById("loading").style.display = "none";
    document.getElementById(page_id).style.display = "flex";
  };
})()

// functions beginning with fetchUser
// will later on get data from external
// API rather than localStorage
const fetchUserSeed = async () => {
  return localStorage.getItem("seed");
};

const fetchUserAccounts = async () => {
  return JSON.parse(localStorage.getItem("accounts"));
};

const createSeed = () => {
  return fetch(`${API_DOMAIN}/create`)
    .then(r=>r.json())
    .then(j=>j.seedphrase);
};

const getAddress = async (seed, index) => {
  return fetch(`${API_DOMAIN}/account` + new URLSearchParams({seed, index}))
    .then(r=>r.json())
    .then(j=>j.address);
};

const renderAccountsPage = async (props) => {
  const createAccountButton = (name, color, index) => {
    const btn = document.createElement("button");
    btn.dataset.index = index;
    btn.className = "account-btn";
    btn.setAttribute("type", "button");
    btn.innerText = name;
    btn.style.background = color;
    return btn;
  };

  const accountListContainer = document.getElementById('account-list');
  accountListContainer.innerHTML = "";
  const accounts = await fetchUserAccounts();
  accounts.forEach(({name, color}, i) => {
    const button = createAccountButton(name, `#${COLORS[color]}`, i);
    accountListContainer.append(button);
  });

};

const renderPaymentPage = async ({seed, index}) => {
  document.getElementById('wallet-address').innerHTML = await getAddress(seed, index);
};

const staticRender = async (props) => {};

// initialize localStorage with values for dummy API calls
const initLocalStorage = async () => {
  if (localStorage.getItem("seed") === null ||
      localStorage.getItem("accounts") === null) {
    const seed = await createSeed();
    localStorage.setItem("seed", seed);
    localStorage.setItem("accounts", JSON.stringify(INIT_ACCOUNTS));
  }
};

const initialize = async () => {
  Object.keys(PAGES).forEach(
    (page) => (document.getElementById(page).style.display = "none")
  );
  await showPage("loading");

  await initLocalStorage();

  document
    .querySelector(".logo-container")
    .addEventListener("click", async () => showPage("start"));
  document
    .getElementById("wallet-btn")
    .addEventListener("click", async () => showPage("accounts"));
  document
    .getElementById("settings-btn")
    .addEventListener("click", async () => showPage("settings"));
  document
    .querySelectorAll(".account-btn")
    .forEach(btn=> {
      btn.addEventListener("click", async (e) => {
        const seed = await fetchUserSeed();
        const index = e.target.dataset.index;
        await showPage("payment", {seed, index});
      });
    });


  await showPage("start");
};

// GLOBALS
const API_DOMAIN = "http://localhost:5000";//"https://test.privatespectrum.xyz";
const PAGES = {
  "start": {render: staticRender},
  "accounts": {render: renderAccountsPage},
  "settings": {render: staticRender},
  "payment": {render: renderPaymentPage},
  "loading": {render: staticRender},
};
const COLORS = ["cd6ccd", "6492bd", "dddd66", "b9485b"];
const INIT_ACCOUNTS = [
  {name: "Family 1", color: 0},
  {name: "Family 2", color: 0},
  {name: "Trading Acc", color: 1},
  {name: "NFT Collection", color: 2},
  {name: "Personal", color: 3},
];

// INITIALIZATION
initialize();
