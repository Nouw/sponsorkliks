const checkBox = document.getElementById("redirect");

window.addEventListener("load", async function() {
  const cookie = await chrome.cookies.get({url: "https://usvprotos.nl", name: "sponsorkliks-autoforward"});

  if (cookie) {
    checkBox.checked = true;
  }
})

checkBox.addEventListener("change", async function () {
  if (this.checked) {
    let expr = new Date();

    expr.setFullYear(expr.getFullYear() + 1);

    await chrome.cookies.set({
      url: "https://usvprotos.nl",
      name: "sponsorkliks-autoforward",
      expirationDate: Math.floor(expr.getTime() / 1000),
      value: JSON.stringify({autoForward: true})
    })
  } else {
    await chrome.cookies.remove({url: "https://usvprotos.nl", name: "sponsorkliks-autoforward"});
  }
})


