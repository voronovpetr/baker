const usersList = [
  {
    name: "Display Name",
    requestAddress: "https://post_url",
    address: "https://app_domain/",
    credentials: [{}, {}],
  },
  {},
];

chrome.storage.sync.set({
  usersList,
});

(async () => {
  const window = await chrome.windows.getCurrent();
  setInterval(checkReload, 200);
  const tabs = await chrome.tabs.query({ windowId: window.id });
  const url = new URL(chrome.runtime.getURL("transfer-page/index.html"));
  const transferTab = tabs.find((tab) =>
    tab.url.includes(url.hostname.concat(url.pathname))
  );
  if (transferTab) {
    const params = Object.fromEntries(
      new URL(transferTab.url).searchParams.entries()
    );
    chrome.storage.sync.get(["user", "datePoint"], ({ datePoint, user }) => {
      if (user && datePoint.toString() === params.datePoint) {
        authorize(user);
        chrome.storage.sync.set({ datePoint: NaN, user: null });
        chrome.tabs.update(transferTab.id, { url: user.address });
      }
    });
  }
})();

function checkReload() {
  chrome.storage.sync.get(["reload"], ({ reload }) => {
    if (reload) {
      chrome.storage.sync.set({ reload: false }, () => {
        setTimeout(() => {
          chrome.runtime.reload();
        }, 2000);
      });
    }
  });
}

function authorize(user) {
  fetch(user.requestAddress, {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => {
      return r.json();
    })
    .catch((e) => {
      console.warn(e);
    });
}
