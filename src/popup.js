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
// API rather than localStorage (probably?)
const fetchUserSeed = async () => {
  return localStorage.getItem("seed");
};

const fetchUserAccounts = async () => {
  return JSON.parse(localStorage.getItem("accounts"));
};

const saveUserAccounts = async (accounts) => {
  localStorage.setItem("accounts", JSON.stringify(accounts));
};

const createSeed = () => {
  return fetch(`${API_DOMAIN}/create`)
    .then(r=>r.json())
    .then(j=>j.seedphrase);
};

const getAddress = async (seed, index) => {
  return fetch(`${API_DOMAIN}/account?` + new URLSearchParams({seed, index}))
    .then(r=>r.json())
    .then(j=>j.address);
};

const renderAccountsPage = async (props) => {
  const createAccountButton = (label, color, index) => {
    const btn = document.createElement("button");
    btn.dataset.index = index;
    btn.className = "account-btn";
    btn.setAttribute("type", "button");
    btn.innerText = label;
    btn.style.background = color;
    btn.addEventListener("click", async (e) => {
      const seed = await fetchUserSeed();
      const index = e.target.dataset.index;
      await showPage("payment", {seed, index});
    });
    return btn;
  };

  const accountListContainer = document.getElementById('account-list');
  accountListContainer.innerHTML = "";
  const accounts = await fetchUserAccounts();
  accounts.forEach(({label, color}, i) => {
    const button = createAccountButton(label, `#${COLORS[color]}`, i);
    accountListContainer.append(button);
  });

};

const renderCreatePage = async (props) => {
  const seed = await createSeed();
  localStorage.setItem("seed", seed);
  localStorage.setItem("accounts", JSON.stringify(INIT_ACCOUNTS));
  document.getElementById('passphrase').innerHTML = seed;
};

const renderAddPage = async (props) => {
  const createRadio = (color, idx) => {
    const rdo = document.createElement("input");
    rdo.setAttribute("type", "radio");
    rdo.setAttribute("name", "color");
    rdo.setAttribute("value", idx);
    rdo.checked = idx===0;
    const spn = document.createElement("span");
    spn.style.backgroundColor = `#${color}`;
    spn.style['font-family'] = "monospace";
    spn.style.border = "1px solid black";
    spn.innerHTML =  "&nbsp;&nbsp;&nbsp;&nbsp;";
    const lbl = document.createElement("label");
    lbl.append(rdo);
    lbl.append(spn);
    const dv = document.createElement("div");
    dv.append(lbl);
    return dv;
  };
  const container = document.getElementById('colors');
  container.innerHTML = "";
  COLORS.forEach((color, i) => container.append(createRadio(color, i)));
};

const renderPaymentPage = async ({seed, index}) => {
  document.getElementById('wallet-address').innerHTML = await getAddress(seed, index);
};

const staticRender = async (props) => {};

const handleCopyEvent = async (e) => {
  const copyElement = document.getElementById(e.target.dataset.text_id);
  try {
    await navigator.clipboard.writeText(copyElement.innerText);
  } catch (err) {
    console.error("Failed to copy!", err);
  }
};

const handleAddAccountSubmit = async (e) => {
  const label = document.querySelector('input[name=label]').value;
  const color = parseInt(document.querySelector('input[name=color]:checked').value);
  const accounts = await fetchUserAccounts();
  await saveUserAccounts([...accounts, {label, color}]);
  await showPage("accounts");
};

const initialize = async () => {
  Object.keys(PAGES).forEach(
    (page) => (document.getElementById(page).style.display = "none")
  );
  await showPage("loading");

  document
    .querySelector(".logo-container")
    .addEventListener("click", async () => showPage("start"));
  document
    .getElementById("wallet-btn")
    .addEventListener("click", async () => showPage("create"));
  document
    .querySelectorAll(".accounts-btn")
    .forEach(node =>
      node.addEventListener("click",
                            async () => showPage("accounts")));
  document
    .getElementById("account-add")
    .addEventListener("click", async () => showPage("add"));
  document
    .getElementById("add-account-btn")
    .addEventListener("click", handleAddAccountSubmit);
  document
    .getElementById("settings-btn")
    .addEventListener("click", async () => showPage("settings"));
  document
    .querySelectorAll('.copy-to-clipboard')
    .forEach(node => node.addEventListener("click", handleCopyEvent));


  await showPage("start");
};

// GLOBALS
const API_DOMAIN = "http://localhost:5000";//"https://test.privatespectrum.xyz";
const PAGES = {
  "start": {render: staticRender},
  "add": {render: renderAddPage},
  "create": {render: renderCreatePage},
  "accounts": {render: renderAccountsPage},
  "settings": {render: staticRender},
  "payment": {render: renderPaymentPage},
  "loading": {render: staticRender},
};
const COLORS = ["cd6ccd", "6492bd", "dddd66", "b9485b"];
const INIT_ACCOUNTS = [
  /*
  {label: "Family 1", color: 0},
  {label: "Family 2", color: 0},
  {label: "Trading Acc", color: 1},
  {label: "NFT Collection", color: 2},
  {label: "Personal", color: 3},
  */
];

// INITIALIZATION
initialize();
