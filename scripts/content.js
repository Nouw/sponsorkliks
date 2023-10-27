window.addEventListener("load", async () => {
  chrome.runtime.sendMessage(
    { type: "get-forward", data: { url: window.location.origin, extra: window.location } },
    function (response) {
      console.log("protos-sponsorkliks res", response);

      if (response) {
        const button = document.createElement("button");
        button.textContent = "Steun Protos";
        button.id = "protos-sponsorkliks";

        button.onclick = () => {
          chrome.runtime.sendMessage("forward");
        };

        button.style =
          "right: 0;top: 0;position: absolute;display: inline-block;border-radius: 4px;background: #d0211c !important;border: none !important;color: #FFFFFF !important;text-align: center;font-size: 28px;padding: 20px;width: 240px;cursor: pointer;margin: 5px;box-shadow: none !important;";

        document.body.appendChild(button);
      }
    },
  );

  // chrome.runtime.sendMessage("get-forward", (res) => {
  //   console.log('res', res);
  //

  // })
});
