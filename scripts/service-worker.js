import shops from "./shops.js";
const clubId = 6458;
const excluded = ["sponsorkliks.com", "ideal"];

async function getTab() {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);
  return tabs[0].url;
}

function extractDomain(url) {
  // Find and remove protocol (http, ftp, etc.) and get domain
  var domain = url.indexOf("://") > -1 ? url.split("/")[2] : url.split("/")[0];

  // Find and remove port number
  domain = domain.split(":")[0];

  return domain;
}

async function redirect(skip = false) {
  const url = await getTab();

  const domain = extractDomain(url);

  const cookie = await chrome.cookies.get({
    url: url,
    name: `protos-${domain}`,
  });

  // If the cookie exists then don't auto-forward
  if (cookie && !skip) {
    return;
  }

  if (excluded.some((excl) => url.indexOf(excl) !== -1)) {
    return;
  }

  const match = shops.filter((shop) =>
    url.indexOf(`.${shop.domain.toLowerCase()}`) !== -1 ||
    url.indexOf(`://${shop.domain}`) !== -1
  );

  if (match.length === 0) {
    return;
  }

  const bestMatch = match.sort((a, b) => a.domain.length - b.domain.length);
  const shop = bestMatch.pop();

  const redirectUrl =
    `http://www.sponsorkliks.com/link.php?club=${clubId}&shop_id=${shop.id}&shop=${shop.name}`;

  let expr = new Date();

  expr.setMinutes(expr.getMinutes() + 5);

  await chrome.cookies.set({
    url: url,
    name: `protos-${domain}`,
    expirationDate: Math.floor(expr.getTime() / 1000),
  });

  await chrome.tabs.update({ url: redirectUrl });
}

chrome.webNavigation.onCompleted.addListener(async () => {
  const cookie = await chrome.cookies.get({
    url: "https://usvprotos.nl",
    name: "sponsorkliks-autoforward",
  });

  if (cookie) {
    redirect();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async function () {
    if (message.type === "get-forward") {
      const url = await getTab();
      const domain = extractDomain(url);
      const shopExists = shops.find((shop) =>
        shop.domain === domain.replace("www.", "")
      );
      
      if (shopExists === undefined) {
        return;
      } 

      const cookie = await chrome.cookies.get({
        url: "https://usvprotos.nl",
        name: "sponsorkliks-autoforward",
      });

      if (cookie) {
        sendResponse(false);
      } else {
        const clicked = await chrome.cookies.get({
          url: url,
          name: `protos-${domain}`,
        });
        // If the user clicked recently don't show popup
        if (clicked) {
          sendResponse(false);
        }

        sendResponse(true);
      }
    } else if (message === "forward") {
      // Add cookie to stop redirecting
      await redirect(true);
    }
  })();

  return true;
});

chrome.runtime.onMessage.addListener(
  function (request, sender) {
    return new Promise((resolve, reject) => {
      if (request == "get-forward") {
        // Perform your async task here
        // Once the task is complete, call resolve() to send the response
        resolve({ data: "This is the response" });
      }
    });
  },
);

// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   if (message === "get-forward") {
//     const cookie = await chrome.cookies.get({url: "https://usvprotos.nl", name: "sponsorkliks-autoforward"});
//
//     let res;
//
//     if (cookie) {
//       res = {show: false};
//     } else {
//       res = {show: true};
//     }
//
//     console.log(res);
//
//     sendResponse(res);
//
//     return true;
//   } else if (message === "forward") {
//     redirect();
//   }
//
// })
