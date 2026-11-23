if (typeof customElements !== "undefined") {
  for (const tag of [
    "md-elevation",
    "md-icon",
    "sm-tooltip",
    "sm-plain-tooltip",
    "sm-badge",
    "sm-navigation-rail",
    "sm-navigation-bar",
    "sm-nav-rail-layout",
    "sm-nav-bar-layout",
  ])
    customElements.define(tag, class extends HTMLElement {});
  customElements.define("md-ripple", class extends HTMLElement {
    attach() {}
    detach() {}
  });
  customElements.define("md-focus-ring", class extends HTMLElement {
    attach() {}
    detach() {}
  });
  customElements.define("sm-button", class extends HTMLElement {});
  customElements.define("sm-icon-button", class extends HTMLElement {});
}
