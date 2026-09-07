(function () {
  "use strict";

  var header = document.querySelector(
    ".fs-article-header .fs-container, .fs-article-header .fs-container-narrow"
  );

  if (!header || header.querySelector(".fs-article-share")) {
    return;
  }

  var canonical = document.querySelector('link[rel="canonical"]');
  var titleElement = header.querySelector("h1");
  var description = document.querySelector('meta[name="description"]');
  var shareUrl = canonical ? canonical.href : window.location.origin + window.location.pathname;
  var shareTitle = titleElement ? titleElement.textContent.trim() : document.title;
  var shareText = description ? description.content.trim() : "";

  function addIcon(element, text) {
    var icon = document.createElement("span");
    icon.className = "fs-share-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = text;
    element.appendChild(icon);
  }

  function addLabel(element, text) {
    var label = document.createElement("span");
    label.textContent = text;
    element.appendChild(label);
  }

  function makeLink(label, icon, className, href) {
    var link = document.createElement("a");
    link.className = "fs-share-button " + className;
    link.href = href;
    addIcon(link, icon);
    addLabel(link, label);
    return link;
  }

  function makeButton(label, icon, className) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "fs-share-button " + className;
    addIcon(button, icon);
    addLabel(button, label);
    return button;
  }

  function copyFallback(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = document.execCommand("copy");
    document.body.removeChild(field);
    if (!copied) {
      throw new Error("Copy command failed");
    }
  }

  var shareTools = document.createElement("div");
  shareTools.className = "fs-article-share";
  shareTools.setAttribute("aria-label", "Share this article");

  var heading = document.createElement("span");
  heading.className = "fs-share-heading";
  heading.textContent = "Share this article";
  shareTools.appendChild(heading);

  var actions = document.createElement("div");
  actions.className = "fs-share-actions";

  if (navigator.share) {
    var nativeButton = makeButton("Share", "↗", "fs-share-button-native");
    nativeButton.addEventListener("click", function () {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(function (error) {
        if (error && error.name !== "AbortError") {
          window.location.href = "mailto:?subject=" + encodeURIComponent(shareTitle) +
            "&body=" + encodeURIComponent(shareTitle + "\n\n" + shareUrl);
        }
      });
    });
    actions.appendChild(nativeButton);
  }

  var facebook = makeLink(
    "Facebook",
    "f",
    "fs-share-button-facebook",
    "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(shareUrl)
  );
  facebook.target = "_blank";
  facebook.rel = "noopener noreferrer";
  actions.appendChild(facebook);

  var email = makeLink(
    "Email",
    "✉",
    "fs-share-button-email",
    "mailto:?subject=" + encodeURIComponent(shareTitle) +
      "&body=" + encodeURIComponent(shareTitle + "\n\n" + shareUrl)
  );
  actions.appendChild(email);

  var copyButton = makeButton("Copy link", "⧉", "fs-share-button-copy");
  var copyLabel = copyButton.lastChild;
  copyButton.addEventListener("click", function () {
    var copyAction = navigator.clipboard && window.isSecureContext
      ? navigator.clipboard.writeText(shareUrl)
      : Promise.resolve().then(function () { copyFallback(shareUrl); });

    copyAction.then(function () {
      copyLabel.textContent = "Copied!";
      window.setTimeout(function () { copyLabel.textContent = "Copy link"; }, 2000);
    }).catch(function () {
      copyLabel.textContent = "Copy failed";
      window.setTimeout(function () { copyLabel.textContent = "Copy link"; }, 2000);
    });
  });
  actions.appendChild(copyButton);

  shareTools.appendChild(actions);

  var meta = header.querySelector(".fs-article-meta");
  if (meta) {
    meta.insertAdjacentElement("afterend", shareTools);
  } else {
    header.appendChild(shareTools);
  }
})();
