let curWindow;

const mainContainer = document.getElementById("main-container");

chrome.storage.sync.get(["usersList"], async ({ usersList }) => {
  curWindow = await chrome.windows.getCurrent();

  usersList.forEach((app) => {
    const appContainer = document.createElement("div");
    appContainer.className = "app";
    mainContainer.appendChild(appContainer);

    const appHeader = document.createElement("h1");
    appHeader.textContent = app.name;
    appContainer.appendChild(appHeader);

    const usersContainer = document.createElement("div");
    usersContainer.id = "users-container";
    appContainer.appendChild(usersContainer);

    app.credentials.forEach((cred) => {
      renderUser(
        { ...cred, address: app.address, requestAddress: app.requestAddress },
        usersContainer
      );
    });
  });
});

const renderUser = (user, container) => {
  const userItem = document.createElement("div");
  userItem.className = "user";

  const login = document.createElement("span");
  login.textContent = user.login;
  login.className = "user-element";
  userItem.appendChild(login);

  const loginBtn = document.createElement("button");
  loginBtn.textContent = "Login";
  loginBtn.className = "user-element";
  loginBtn.addEventListener("click", (event) => {
    handleLogin(user);
  });
  if (curWindow.incognito) {
    loginBtn.setAttribute("disabled", "");
  }
  userItem.appendChild(loginBtn);

  const incognitoBtn = document.createElement("button");
  incognitoBtn.textContent = "Incognito";
  incognitoBtn.className = "user-element";
  incognitoBtn.addEventListener("click", (event) => {
    handleLogin(user, { incognito: true });
  });
  userItem.appendChild(incognitoBtn);

  const userRow = document.createElement("div");
  userRow.className = "user-row";
  userRow.appendChild(userItem);
  container.appendChild(userRow);
};

async function handleLogin(user, { incognito = false } = {}) {
  const datePoint = new Date().getTime();
  const url = `transfer-page/index.html?datePoint=${datePoint}`;
  chrome.storage.sync.set({ datePoint, user, reload: true });
  if (curWindow.incognito !== incognito) {
    chrome.windows.create({ url, incognito });
  } else {
    chrome.tabs.create({ windowId: curWindow.id, url });
  }
}
