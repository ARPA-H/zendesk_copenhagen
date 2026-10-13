(function () {
  'use strict';

  // Key map
  const ENTER = 13;
  const ESCAPE = 27;

  function toggleNavigation(toggle, menu) {
    const isExpanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", !isExpanded);
    toggle.setAttribute("aria-expanded", !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute("aria-expanded", false);
    toggle.setAttribute("aria-expanded", false);
    toggle.focus();
  }

  // Collapsible elements track their expanded state on the toggle button only;
  // aria-expanded is not valid on the wrapping div/nav, so a class is used for styling
  function toggleCollapsible(toggle, element) {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !isExpanded);
    element.classList.toggle("expanded", !isExpanded);
  }

  function closeCollapsible(toggle, element) {
    toggle.setAttribute("aria-expanded", false);
    element.classList.remove("expanded");
    toggle.focus();
  }

  // Navigation

  window.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".header .menu-button-mobile");
    const menuList = document.querySelector("#user-nav-mobile");

    if (menuButton && menuList) {
      menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleNavigation(menuButton, menuList);
      });

      menuList.addEventListener("keyup", (event) => {
        if (event.keyCode === ESCAPE) {
          event.stopPropagation();
          closeNavigation(menuButton, menuList);
        }
      });
    }

    // Toggles expanded aria to collapsible elements
    const collapsible = document.querySelectorAll(
      ".collapsible-nav, .collapsible-sidebar"
    );

    collapsible.forEach((element) => {
      const toggle = element.querySelector(
        ".collapsible-nav-toggle, .collapsible-sidebar-toggle"
      );

      element.addEventListener("click", () => {
        toggleCollapsible(toggle, element);
      });

      element.addEventListener("keyup", (event) => {
        if (event.keyCode === ESCAPE) {
          closeCollapsible(toggle, element);
        }
      });
    });

    // If multibrand search has more than 5 help centers or categories collapse the list
    const multibrandFilterLists = document.querySelectorAll(
      ".multibrand-filter-list"
    );
    multibrandFilterLists.forEach((filter) => {
      if (filter.children.length > 6) {
        // Display the show more button
        const trigger = filter.querySelector(".see-all-filters");
        trigger.setAttribute("aria-hidden", false);

        // Add event handler for click
        trigger.addEventListener("click", (event) => {
          event.stopPropagation();
          trigger.parentNode.removeChild(trigger);
          filter.classList.remove("multibrand-filter-list--collapsed");
        });
      }
    });
  });

  const isPrintableChar = (str) => {
    return str.length === 1 && str.match(/^\S$/);
  };

  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains("dropdown-menu-top"),
      end: menu.classList.contains("dropdown-menu-end"),
    };

    this.toggle.addEventListener("click", this.clickHandler.bind(this));
    this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
    this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
    document.body.addEventListener("click", this.outsideClickHandler.bind(this));

    const toggleId = this.toggle.getAttribute("id") || crypto.randomUUID();
    const menuId = this.menu.getAttribute("id") || crypto.randomUUID();

    this.toggle.setAttribute("id", toggleId);
    this.menu.setAttribute("id", menuId);

    this.toggle.setAttribute("aria-controls", menuId);
    this.menu.setAttribute("aria-labelledby", toggleId);

    if (!this.toggle.hasAttribute("aria-haspopup")) {
      this.toggle.setAttribute("aria-haspopup", "true");
    }

    if (!this.toggle.hasAttribute("aria-expanded")) {
      this.toggle.setAttribute("aria-expanded", "false");
    }

    this.toggleIcon = this.toggle.querySelector(".dropdown-chevron-icon");
    if (this.toggleIcon) {
      this.toggleIcon.setAttribute("aria-hidden", "true");
    }

    this.menu.setAttribute("tabindex", -1);
    this.menuItems.forEach((menuItem) => {
      menuItem.tabIndex = -1;
    });

    this.focusedIndex = -1;
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.toggle.getAttribute("aria-expanded") === "true";
    },

    get menuItems() {
      return Array.prototype.slice.call(
        this.menu.querySelectorAll("[role='menuitem'], [role='menuitemradio']")
      );
    },

    dismiss: function () {
      if (!this.isExpanded) return;

      this.toggle.setAttribute("aria-expanded", "false");
      this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
      this.focusedIndex = -1;
    },

    open: function () {
      if (this.isExpanded) return;

      this.toggle.setAttribute("aria-expanded", "true");
      this.handleOverflow();
    },

    handleOverflow: function () {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add("dropdown-menu-end");
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add("dropdown-menu-top");
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove("dropdown-menu-top");
      }
    },

    focusByIndex: function (index) {
      if (!this.menuItems.length) return;

      this.menuItems.forEach((item, itemIndex) => {
        if (itemIndex === index) {
          item.tabIndex = 0;
          item.focus();
        } else {
          item.tabIndex = -1;
        }
      });

      this.focusedIndex = index;
    },

    focusFirstMenuItem: function () {
      this.focusByIndex(0);
    },

    focusLastMenuItem: function () {
      this.focusByIndex(this.menuItems.length - 1);
    },

    focusNextMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      const currentIndex = this.menuItems.indexOf(currentItem);
      const nextIndex = (currentIndex + 1) % this.menuItems.length;

      this.focusByIndex(nextIndex);
    },

    focusPreviousMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      const currentIndex = this.menuItems.indexOf(currentItem);
      const previousIndex =
        currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.focusByIndex(previousIndex);
    },

    focusByChar: function (currentItem, char) {
      char = char.toLowerCase();

      const itemChars = this.menuItems.map((menuItem) =>
        menuItem.textContent.trim()[0].toLowerCase()
      );

      const startIndex =
        (this.menuItems.indexOf(currentItem) + 1) % this.menuItems.length;

      // look up starting from current index
      let index = itemChars.indexOf(char, startIndex);

      // if not found, start from start
      if (index === -1) {
        index = itemChars.indexOf(char, 0);
      }

      if (index > -1) {
        this.focusByIndex(index);
      }
    },

    outsideClickHandler: function (e) {
      if (
        this.isExpanded &&
        !this.toggle.contains(e.target) &&
        !e.composedPath().includes(this.menu)
      ) {
        this.dismiss();
        this.toggle.focus();
      }
    },

    clickHandler: function (event) {
      event.stopPropagation();
      event.preventDefault();

      if (this.isExpanded) {
        this.dismiss();
        this.toggle.focus();
      } else {
        this.open();
        this.focusFirstMenuItem();
      }
    },

    toggleKeyHandler: function (e) {
      const key = e.key;

      switch (key) {
        case "Enter":
        case " ":
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();

          this.open();
          this.focusFirstMenuItem();
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();

          this.open();
          this.focusLastMenuItem();
          break;
        }
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();

          this.dismiss();
          this.toggle.focus();
          break;
        }
      }
    },

    menuKeyHandler: function (e) {
      const key = e.key;
      const currentElement = this.menuItems[this.focusedIndex];

      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      switch (key) {
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();

          this.dismiss();
          this.toggle.focus();
          break;
        }
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();

          this.focusNextMenuItem(currentElement);
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        }
        case "Home":
        case "PageUp": {
          e.stopPropagation();
          e.preventDefault();
          this.focusFirstMenuItem();
          break;
        }
        case "End":
        case "PageDown": {
          e.stopPropagation();
          e.preventDefault();
          this.focusLastMenuItem();
          break;
        }
        case "Tab": {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            this.toggle.focus();
          } else {
            this.dismiss();
          }
          break;
        }
        default: {
          if (isPrintableChar(key)) {
            e.stopPropagation();
            e.preventDefault();
            this.focusByChar(currentElement, key);
          }
        }
      }
    },
  };

  // Drodowns

  window.addEventListener("DOMContentLoaded", () => {
    const dropdowns = [];
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      const menu = toggle.nextElementSibling;
      if (menu && menu.classList.contains("dropdown-menu")) {
        dropdowns.push(new Dropdown(toggle, menu));
      }
    });
  });

  // Share

  window.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".share a");
    links.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(anchor.href, "", "height = 500, width = 500");
      });
    });
  });

  // Vanilla JS debounce function, by Josh W. Comeau:
  // https://www.joshwcomeau.com/snippets/javascript/debounce/
  function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }

  // Define variables for search field
  let searchFormFilledClassName = "search-has-value";
  let searchFormSelector = "form[role='search']";

  // Clear the search input, and then return focus to it
  function clearSearchInput(event) {
    event.target
      .closest(searchFormSelector)
      .classList.remove(searchFormFilledClassName);

    let input;
    if (event.target.tagName === "INPUT") {
      input = event.target;
    } else if (event.target.tagName === "BUTTON") {
      input = event.target.previousElementSibling;
    } else {
      input = event.target.closest("button").previousElementSibling;
    }
    input.value = "";
    input.focus();
  }

  // Have the search input and clear button respond
  // when someone presses the escape key, per:
  // https://twitter.com/adambsilver/status/1152452833234554880
  function clearSearchInputOnKeypress(event) {
    const searchInputDeleteKeys = ["Delete", "Escape"];
    if (searchInputDeleteKeys.includes(event.key)) {
      clearSearchInput(event);
    }
  }

  // Create an HTML button that all users -- especially keyboard users --
  // can interact with, to clear the search input.
  // To learn more about this, see:
  // https://adrianroselli.com/2019/07/ignore-typesearch.html#Delete
  // https://www.scottohara.me/blog/2022/02/19/custom-clear-buttons.html
  function buildClearSearchButton(inputId) {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("aria-controls", inputId);
    button.classList.add("clear-button");
    const buttonLabel = window.searchClearButtonLabelLocalized;
    const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
    button.innerHTML = icon;
    button.addEventListener("click", clearSearchInput);
    button.addEventListener("keyup", clearSearchInputOnKeypress);
    return button;
  }

  // Append the clear button to the search form
  function appendClearSearchButton(input, form) {
    const searchClearButton = buildClearSearchButton(input.id);
    form.append(searchClearButton);
    if (input.value.length > 0) {
      form.classList.add(searchFormFilledClassName);
    }
  }

  // Add a class to the search form when the input has a value;
  // Remove that class from the search form when the input doesn't have a value.
  // Do this on a delay, rather than on every keystroke.
  const toggleClearSearchButtonAvailability = debounce((event) => {
    const form = event.target.closest(searchFormSelector);
    form.classList.toggle(
      searchFormFilledClassName,
      event.target.value.length > 0
    );
  }, 200);

  // Search

  window.addEventListener("DOMContentLoaded", () => {
    // Set up clear functionality for the search field
    const searchForms = [...document.querySelectorAll(searchFormSelector)];
    const searchInputs = searchForms.map((form) =>
      form.querySelector("input[type='search']")
    );
    searchInputs.forEach((input) => {
      appendClearSearchButton(input, input.closest(searchFormSelector));
      input.addEventListener("keyup", clearSearchInputOnKeypress);
      input.addEventListener("keyup", toggleClearSearchButtonAvailability);
    });
  });

  const key = "returnFocusTo";

  function saveFocus() {
    const activeElementId = document.activeElement.getAttribute("id");
    sessionStorage.setItem(key, "#" + activeElementId);
  }

  function returnFocus() {
    const returnFocusTo = sessionStorage.getItem(key);
    if (returnFocusTo) {
      sessionStorage.removeItem("returnFocusTo");
      const returnFocusToEl = document.querySelector(returnFocusTo);
      if (returnFocusToEl && returnFocusToEl.focus) {
        returnFocusToEl.focus();
      }
    }
  }

  // Forms

  window.addEventListener("DOMContentLoaded", () => {
    // In some cases we should preserve focus after page reload
    returnFocus();

    // show form controls when the textarea receives focus or back button is used and value exists
    const commentContainerTextarea = document.querySelector(
      ".comment-container textarea"
    );
    const commentContainerFormControls = document.querySelector(
      ".comment-form-controls, .comment-ccs"
    );

    if (commentContainerTextarea) {
      commentContainerTextarea.addEventListener(
        "focus",
        function focusCommentContainerTextarea() {
          commentContainerFormControls.style.display = "block";
          commentContainerTextarea.removeEventListener(
            "focus",
            focusCommentContainerTextarea
          );
        }
      );

      if (commentContainerTextarea.value !== "") {
        commentContainerFormControls.style.display = "block";
      }
    }

    // Expand Request comment form when Add to conversation is clicked
    const showRequestCommentContainerTrigger = document.querySelector(
      ".request-container .comment-container .comment-show-container"
    );
    const requestCommentFields = document.querySelectorAll(
      ".request-container .comment-container .comment-fields"
    );
    const requestCommentSubmit = document.querySelector(
      ".request-container .comment-container .request-submit-comment"
    );

    if (showRequestCommentContainerTrigger) {
      showRequestCommentContainerTrigger.addEventListener("click", () => {
        showRequestCommentContainerTrigger.style.display = "none";
        Array.prototype.forEach.call(requestCommentFields, (element) => {
          element.style.display = "block";
        });
        requestCommentSubmit.style.display = "inline-block";

        if (commentContainerTextarea) {
          commentContainerTextarea.focus();
        }
      });
    }

    // Mark as solved button
    const requestMarkAsSolvedButton = document.querySelector(
      ".request-container .mark-as-solved:not([data-disabled])"
    );
    const requestMarkAsSolvedCheckbox = document.querySelector(
      ".request-container .comment-container input[type=checkbox]"
    );
    const requestCommentSubmitButton = document.querySelector(
      ".request-container .comment-container input[type=submit]"
    );

    if (requestMarkAsSolvedButton) {
      requestMarkAsSolvedButton.addEventListener("click", () => {
        requestMarkAsSolvedCheckbox.setAttribute("checked", true);
        requestCommentSubmitButton.disabled = true;
        requestMarkAsSolvedButton.setAttribute("data-disabled", true);
        requestMarkAsSolvedButton.form.submit();
      });
    }

    // Change Mark as solved text according to whether comment is filled
    const requestCommentTextarea = document.querySelector(
      ".request-container .comment-container textarea"
    );

    const usesWysiwyg =
      requestCommentTextarea &&
      requestCommentTextarea.dataset.helper === "wysiwyg";

    function isEmptyPlaintext(s) {
      return s.trim() === "";
    }

    function isEmptyHtml(html) {
      // Parse with DOMParser (rather than assigning to innerHTML) so the
      // untrusted comment text is never reinterpreted as live, renderable HTML.
      const doc = new DOMParser().parseFromString(html, "text/html");
      const hasImg = doc.querySelector("img") !== null;
      const text = doc.body.textContent || "";
      return !hasImg && isEmptyPlaintext(text);
    }

    const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

    if (requestCommentTextarea) {
      requestCommentTextarea.addEventListener("input", () => {
        if (isEmpty(requestCommentTextarea.value)) {
          if (requestMarkAsSolvedButton) {
            requestMarkAsSolvedButton.innerText =
              requestMarkAsSolvedButton.getAttribute("data-solve-translation");
          }
        } else {
          if (requestMarkAsSolvedButton) {
            requestMarkAsSolvedButton.innerText =
              requestMarkAsSolvedButton.getAttribute(
                "data-solve-and-submit-translation"
              );
          }
        }
      });
    }

    const selects = document.querySelectorAll(
      "#request-status-select, #request-organization-select"
    );

    selects.forEach((element) => {
      element.addEventListener("change", (event) => {
        event.stopPropagation();
        saveFocus();
        element.form.submit();
      });
    });

    // Submit requests filter form on search in the request list page
    const quickSearch = document.querySelector("#quick-search");
    if (quickSearch) {
      quickSearch.addEventListener("keyup", (event) => {
        if (event.keyCode === ENTER) {
          event.stopPropagation();
          saveFocus();
          quickSearch.form.submit();
        }
      });
    }

    // Submit organization form in the request page
    const requestOrganisationSelect = document.querySelector(
      "#request-organization select"
    );

    if (requestOrganisationSelect) {
      requestOrganisationSelect.addEventListener("change", () => {
        requestOrganisationSelect.form.submit();
      });

      requestOrganisationSelect.addEventListener("click", (e) => {
        // Prevents Ticket details collapsible-sidebar to close on mobile
        e.stopPropagation();
      });
    }

    // If there are any error notifications below an input field, focus that field
    const notificationElm = document.querySelector(".notification-error");
    if (
      notificationElm &&
      notificationElm.previousElementSibling &&
      typeof notificationElm.previousElementSibling.focus === "function"
    ) {
      notificationElm.previousElementSibling.focus();
    }
  });

  /*
   * Global DOM fix-ups that were previously inline <script> blocks in
   * templates/document_head.hbs. Kept here so they live in the built script.js
   * (source of truth) instead of the template head.
   *
   * ES2015 only (no async/await) — this file is bundled into script.js.
   */

  // ---------------------------------------------------------------------------
  // 1. Neutralize the current-page breadcrumb link.
  //    Zendesk renders the active breadcrumb as <a href="#" aria-current="page">;
  //    clicking it navigates to "#", which blanks the page. It represents the
  //    page you are already on, so it should not navigate at all. Removing the
  //    href makes navigation impossible for both mouse and keyboard; the matching
  //    `pointer-events: none` rule in _breadcrumbs.scss is a visual backstop.
  //
  //    (Replaces the former inline version, which ran a body-wide
  //    MutationObserver forever on every DOM mutation.)
  // ---------------------------------------------------------------------------
  (function () {
    var SEL = 'nav[aria-label="Breadcrumb"] a, .breadcrumbs a';

    function isDead(a) {
      if (!a) return false;
      var href = a.getAttribute("href");
      return (
        a.getAttribute("aria-current") === "page" ||
        href === "#" ||
        href === "" ||
        href === null
      );
    }

    function neutralize() {
      var links = document.querySelectorAll(SEL);
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        if (!isDead(a)) continue;
        if (a.hasAttribute("href")) {
          a.setAttribute("data-dead-href", a.getAttribute("href"));
          a.removeAttribute("href");
        }
        a.setAttribute("role", "link");
        a.setAttribute("aria-disabled", "true");
      }
    }

    if (document.readyState !== "loading") {
      neutralize();
    } else {
      document.addEventListener("DOMContentLoaded", neutralize);
    }
  })();

  // ---------------------------------------------------------------------------
  // 2. Hide any element whose only text is literally "empty".
  //    This is a placeholder that can leak into the rendered page. Adding the
  //    `.svc-empty-hidden` class (styled in _svc-tokens.scss) hides it without an
  //    inline style.
  //    TODO: find and fix the source that emits "empty" so this can be removed.
  // ---------------------------------------------------------------------------
  (function () {
    function hideEmpty() {
      var els = document.querySelectorAll("a, li, div");
      for (var i = 0; i < els.length; i++) {
        if (els[i].textContent.trim().toLowerCase() === "empty") {
          els[i].classList.add("svc-empty-hidden");
        }
      }
    }

    if (document.readyState !== "loading") {
      hideEmpty();
    } else {
      document.addEventListener("DOMContentLoaded", hideEmpty);
    }
  })();

  // ---------------------------------------------------------------------------
  // 3. Wire the pink search-pill button (templates/search_results.hbs) to
  //    submit the native search, matching native <button type="submit"> behavior.
  //    Previously an inline <script> in that template; moved here per the
  //    "don't re-add inline scripts" rule documented in document_head.hbs.
  // ---------------------------------------------------------------------------
  (function () {
    function wireSearchPillButton() {
      var btn = document.getElementById("svc-search-pill-btn");
      if (!btn || btn.dataset.svcWired === "1") return;
      var pill = btn.closest(".svc-search-pill");
      if (!pill) return;
      btn.dataset.svcWired = "1";
      btn.addEventListener("click", function () {
        var input = pill.querySelector(
          'input[type="search"], input[type="text"], input:not([type])'
        );
        if (!input) return;
        var form = input.form || input.closest("form");
        if (form) {
          if (typeof form.requestSubmit === "function") form.requestSubmit();
          else form.submit();
        } else {
          input.focus();
          input.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13,
              bubbles: true,
            })
          );
        }
      });
    }

    if (document.readyState !== "loading") {
      wireSearchPillButton();
    } else {
      document.addEventListener("DOMContentLoaded", wireSearchPillButton);
    }
  })();

  // ---------------------------------------------------------------------------
  // 4. Keep the footer copyright year current. The template renders the year it
  //    was last edited so the notice is complete without JavaScript; this swaps
  //    in the visitor's current year.
  // ---------------------------------------------------------------------------
  function setFooterYear() {
    var years = document.querySelectorAll("[data-footer-year]");
    var year = String(new Date().getFullYear());
    for (var i = 0; i < years.length; i++) {
      years[i].textContent = year;
    }
  }

  if (document.readyState !== "loading") {
    setFooterYear();
  } else {
    document.addEventListener("DOMContentLoaded", setFooterYear);
  }

  // ---------------------------------------------------------------------------
  // 5. Let a table that is wider than its column scroll sideways inside its own
  //    region. Without this the page either widens or, where it is clipped, the
  //    last columns cannot be reached. Each table in an article body gets a
  //    wrapper; the wrapper becomes a focusable region only while the table
  //    actually overflows, so keyboard users can scroll it and tables that fit
  //    add no tab stop. The region is named by the table's caption, which is the
  //    article's own text. A table without one gets a fixed English name, and it
  //    is numbered when several tables need it so the regions stay
  //    distinguishable. On an English page that name is the region's aria-label.
  //    On any other page it comes from a hidden element marked lang="en"
  //    (aria-labelledby), so the region still has a name and a role there, and
  //    the English words are not passed off as the page's own language.
  // ---------------------------------------------------------------------------
  var SCROLLABLE_TABLE_LABEL = "Scrollable table";
  var SCROLLABLE_LABEL_ATTR = "data-table-scroll-label";
  var scrollableLabelCount = 0;

  function isEnglishPage() {
    var lang = document.documentElement.getAttribute("lang") || "en";
    return /^en(-|$)/i.test(lang);
  }

  function findFallbackLabel(wrapper) {
    for (var i = 0; i < wrapper.children.length; i++) {
      if (wrapper.children[i].hasAttribute(SCROLLABLE_LABEL_ATTR)) {
        return wrapper.children[i];
      }
    }
    return null;
  }

  function removeFallbackLabel(wrapper) {
    var label = findFallbackLabel(wrapper);
    if (label) {
      wrapper.removeChild(label);
    }
    wrapper.removeAttribute("aria-labelledby");
  }

  function setFallbackLabel(wrapper, text) {
    var label = findFallbackLabel(wrapper);
    if (!label) {
      label = document.createElement("span");
      label.hidden = true;
      label.setAttribute("lang", "en");
      label.setAttribute(SCROLLABLE_LABEL_ATTR, "");
      label.id = "table-scroll-label-" + ++scrollableLabelCount;
      wrapper.insertBefore(label, wrapper.firstChild);
    }
    label.textContent = text;
    wrapper.setAttribute("aria-labelledby", label.id);
  }

  function wrapWideTables(root) {
    var scope = document;
    var tables = scope.querySelectorAll(".article-body table");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (
        table.parentNode &&
        table.parentNode.classList.contains("table-scroll")
      ) {
        continue;
      }
      var wrapper = document.createElement("div");
      wrapper.className = "table-scroll";
      var caption = table.querySelector("caption");
      var captionText = caption && caption.textContent.trim();
      if (captionText) {
        wrapper.setAttribute("data-label", captionText);
      }
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
    updateScrollableTables(scope);
  }

  function updateScrollableTables(root) {
    var scope = root || document;
    var wrappers = scope.querySelectorAll(".table-scroll");
    var overflowing = [];
    var unnamed = [];
    for (var i = 0; i < wrappers.length; i++) {
      var wrapper = wrappers[i];
      if (wrapper.scrollWidth > wrapper.clientWidth) {
        overflowing.push(wrapper);
        if (!wrapper.getAttribute("data-label")) {
          unnamed.push(wrapper);
        }
      } else {
        wrapper.removeAttribute("role");
        wrapper.removeAttribute("tabindex");
        wrapper.removeAttribute("aria-label");
        removeFallbackLabel(wrapper);
      }
    }

    var english = isEnglishPage();
    for (var j = 0; j < overflowing.length; j++) {
      var scroller = overflowing[j];
      var label = scroller.getAttribute("data-label");
      var captioned = !!label;
      if (!captioned) {
        label =
          unnamed.length > 1
            ? SCROLLABLE_TABLE_LABEL +
              " " +
              (unnamed.indexOf(scroller) + 1) +
              " of " +
              unnamed.length
            : SCROLLABLE_TABLE_LABEL;
      }
      scroller.setAttribute("tabindex", "0");
      scroller.setAttribute("role", "region");
      if (captioned || english) {
        scroller.setAttribute("aria-label", label);
        removeFallbackLabel(scroller);
      } else {
        scroller.removeAttribute("aria-label");
        setFallbackLabel(scroller, label);
      }
    }
  }

  if (document.readyState !== "loading") {
    wrapWideTables();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      wrapWideTables();
    });
  }
  window.addEventListener("load", function () {
    updateScrollableTables();
  });
  window.addEventListener("resize", function () {
    updateScrollableTables();
  });

  /*
   * Disclosure behavior for the USWDS "official government website" banner
   * (templates/header.hbs, styles/_usa-banner.scss). It mirrors the USWDS banner
   * script (packages/usa-banner/src/index.js in @uswds/uswds): the button flips
   * aria-expanded, the panel it controls is shown or hidden, and the header gets
   * the expanded modifier class that hides the "Here's how you know" prompt.
   *
   * ES2015 only (no async/await); this file is bundled into script.js.
   */

  var BUTTON_SELECTOR = ".usa-banner__button";
  var HEADER_SELECTOR = ".usa-banner__header";
  var EXPANDED_CLASS = "usa-banner__header--expanded";

  function setBannerExpanded(button, expanded) {
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    var header = button.closest(HEADER_SELECTOR);

    button.setAttribute("aria-expanded", expanded ? "true" : "false");
    if (panel) panel.hidden = !expanded;
    if (header) header.classList.toggle(EXPANDED_CLASS, expanded);
  }

  function toggleBanner(button) {
    setBannerExpanded(button, button.getAttribute("aria-expanded") !== "true");
  }

  // document_head.hbs sets "js" before this script loads, so the collapsed banner
  // never flashes open, and drops it again after five seconds unless "js-ready" is
  // there. Marking the page only after the handlers are installed means a blocked or
  // failed script leaves the explanation readable instead of behind an inert button.
  function markScriptReady() {
    var classes = document.documentElement.classList;

    classes.add("js");
    classes.add("js-ready");
  }

  function initGovBanner(root) {
    var scope = document;
    var buttons = scope.querySelectorAll(BUTTON_SELECTOR);

    for (var i = 0; i < buttons.length; i++) {
      (function (button) {
        setBannerExpanded(
          button,
          button.getAttribute("aria-expanded") === "true"
        );
        button.addEventListener("click", function () {
          toggleBanner(button);
        });
      })(buttons[i]);
    }

    markScriptReady();
  }

  if (document.readyState !== "loading") {
    initGovBanner();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initGovBanner();
    });
  }

  /**
   * Restrict a URL to a safe scheme before it is inserted via innerHTML.
   * Defense in depth per the OWASP DOM-based XSS Prevention Cheat Sheet
   * (https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html):
   * entity-escaping neutralizes markup breakout but not a `javascript:` URI, so
   * the scheme itself must also be validated. Relative URLs (no scheme, e.g.
   * "/hc/en-us/services/123") are always allowed; absolute URLs are allowed
   * only for http:/https:. Anything else (javascript:, data:, vbscript:, etc.)
   * falls back to `fallback` (default "#").
   */
  function safeHref(url, fallback) {
    var fb = fallback || "#";
    if (url == null) return fb;
    var str = String(url).trim();
    if (!str) return fb;
    // Strip control/whitespace characters that can be used to smuggle a scheme
    // past naive checks (e.g. "java\tscript:").
    // eslint-disable-next-line no-control-regex
    var stripped = str.replace(/[\x00-\x1f\x7f]/g, "");
    var schemeMatch = stripped.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    if (!schemeMatch) return str; // no scheme => relative URL, safe
    var scheme = schemeMatch[1].toLowerCase();
    return scheme === "http" || scheme === "https" ? str : fb;
  }

  // service_page.hbs reads this from `window` for the training button and the
  // suggested-article links. script.js is a classic script, so a page's inline
  // <script> cannot import it.
  if (typeof window !== "undefined") {
    window.svcSafeHref = safeHref;
  }

  /*
   * Service-catalog list-page enhancements that used to be two separate inline
   * <script> blocks in templates/service_list_page.hbs ("Catalog enhancements"
   * and "Category-swap skeleton hiding"). Neither depends on server-rendered
   * Curlybars data, so — same rationale as src/domFixups.js — they belong here
   * instead of inline in the template.
   *
   * Both sections no-op on any page without #service-catalog-main-content, so
   * this file is safe to include globally (bundled into script.js for every
   * page) rather than only on the service list page.
   *
   * ES2015 only — this file is bundled into script.js.
   */

  // ---------------------------------------------------------------------------
  // 1. Tooltips for truncated card descriptions and category description text.
  //    (This used to also strip the Zendesk service-catalog widget's own
  //    "search within services" field so it wouldn't duplicate the page's hero
  //    search. PR #69 intentionally restored that native in-catalog search box,
  //    so this module no longer removes it — see PR description "Added native
  //    search back into services page list to search within services".)
  // ---------------------------------------------------------------------------
  (function () {
    const main = document.getElementById("service-catalog-main-content");
    if (!main) return;

    const safeClosest = (el, sel) =>
      el && el.nodeType === 1 && typeof el.closest === "function"
        ? el.closest(sel)
        : null;
    const inSidebar = (el) =>
      !!safeClosest(el, '[data-test-id^="sidebar-category"]');

    const tip = document.createElement("div");
    tip.className = "svc-tooltip";
    // A visual copy of the card description, which describeCards() ties to the
    // card for assistive technology.
    tip.setAttribute("aria-hidden", "true");
    tip.style.left = "-9999px";
    tip.style.top = "-9999px";
    document.body.appendChild(tip);
    let hideTimer = null;

    function getCard(el) {
      if (!el || el.nodeType !== 1) return null;
      if (inSidebar(el)) return null;
      const card =
        safeClosest(el, 'a[href*="/services/"]') ||
        safeClosest(el, '[data-testid="service-catalog-list-item-container"]');
      if (!card || inSidebar(card)) return null;
      if (
        !safeClosest(card, 'a[href*="/services/"]') &&
        !card.querySelector('a[href*="/services/"]')
      )
        return null;
      return card;
    }
    function findDescEl(card) {
      if (!card || inSidebar(card) || typeof card.querySelectorAll !== "function")
        return null;
      const leaves = Array.from(card.querySelectorAll("div, p, span")).filter(
        (el) =>
          el &&
          !el.querySelector(
            "a, h1, h2, h3, h4, h5, h6, svg, img, button, div, p, span"
          ) &&
          (el.textContent || "").trim().length > 0
      );
      if (leaves.length < 2) return null;
      const heading = card.querySelector("h1,h2,h3,h4,h5,h6");
      const titleText = heading
        ? heading.textContent.trim()
        : leaves[0].textContent.trim();
      return (
        leaves.find((l) => {
          const t = l.textContent.trim();
          return t && t !== titleText;
        }) || null
      );
    }
    function descText(card) {
      const el = findDescEl(card);
      if (!el) return "";
      const t = el.textContent.trim();
      if (/^\d+$/.test(t)) return "";
      return t;
    }

    function hideDescriptions() {
      main
        .querySelectorAll(
          'a[href*="/services/"], [class*="card"], [class*="Card"]'
        )
        .forEach((card) => {
          if (inSidebar(card)) return;
          const el = findDescEl(card);
          if (el && !el.classList.contains("svc-desc-hidden"))
            el.classList.add("svc-desc-hidden");
        });
    }
    // The description is hidden by CSS (a hover tooltip shows it), which also
    // hides it from assistive technology, so each card is described by it
    // explicitly; aria-describedby may point at hidden content. Where the
    // description is shown inside the card (a device that cannot hover) it is
    // already read as part of the link, so nothing is added there.
    const cannotHover = window.matchMedia
      ? window.matchMedia("(hover: none)")
      : null;
    let describedCount = 0;
    function describeCards() {
      const shownInCard = !!cannotHover && cannotHover.matches;
      main.querySelectorAll('a[href*="/services/"]').forEach((card) => {
        if (inSidebar(card)) return;
        const el = findDescEl(card);
        if (!shownInCard && el && descText(card)) {
          if (!el.id) el.id = "svc-card-desc-" + ++describedCount;
          card.setAttribute("aria-describedby", el.id);
        } else if (
          /^svc-card-desc-/.test(card.getAttribute("aria-describedby") || "")
        ) {
          card.removeAttribute("aria-describedby");
        }
      });
    }
    if (cannotHover) {
      if (cannotHover.addEventListener)
        cannotHover.addEventListener("change", describeCards);
      else if (cannotHover.addListener) cannotHover.addListener(describeCards);
    }
    function positionTip(card) {
      const rect = card.getBoundingClientRect();
      tip.style.maxWidth = Math.max(180, Math.min(240, rect.width + 20)) + "px";
      const t = tip.getBoundingClientRect(),
        gap = 8;
      let left = Math.min(
        Math.max(rect.left, 12),
        window.innerWidth - t.width - 12
      );
      tip.style.setProperty(
        "--svc-arrow-left",
        Math.max(
          10,
          Math.min(t.width - 18, rect.left + rect.width / 2 - left - 4)
        ) + "px"
      );
      let top;
      if (window.innerHeight - rect.bottom > t.height + gap + 12) {
        top = rect.bottom + gap;
        tip.classList.add("svc-tooltip-below");
        tip.classList.remove("svc-tooltip-above");
      } else {
        top = rect.top - t.height - gap;
        tip.classList.add("svc-tooltip-above");
        tip.classList.remove("svc-tooltip-below");
      }
      tip.style.left = Math.round(left) + "px";
      tip.style.top = Math.round(top) + "px";
    }
    function showTip(card) {
      if (!card || inSidebar(card)) return;
      const d = descText(card);
      if (!d) return;
      clearTimeout(hideTimer);
      tip.textContent = d;
      tip.style.left = "-9999px";
      tip.style.top = "0px";
      requestAnimationFrame(() => {
        positionTip(card);
        requestAnimationFrame(() => tip.classList.add("svc-tooltip-visible"));
      });
    }
    function hideTip() {
      tip.classList.remove("svc-tooltip-visible");
      hideTimer = setTimeout(() => {
        tip.style.left = "-9999px";
      }, 200);
    }

    let userInteracted = false;
    ["pointerdown", "keydown", "mousemove"].forEach((evt) =>
      window.addEventListener(
        evt,
        () => {
          userInteracted = true;
        },
        { once: true, passive: true }
      )
    );

    main.addEventListener("mouseover", (e) => {
      const c = getCard(e.target);
      if (c) showTip(c);
    });
    main.addEventListener("mouseout", (e) => {
      const c = getCard(e.target),
        to = e.relatedTarget ? getCard(e.relatedTarget) : null;
      if (c && c !== to) hideTip();
    });
    main.addEventListener("focusin", (e) => {
      if (!userInteracted) return;
      const c = getCard(e.target);
      if (c) showTip(c);
    });
    main.addEventListener("focusout", (e) => {
      const c = getCard(e.target),
        to = e.relatedTarget ? getCard(e.relatedTarget) : null;
      if (c && c !== to) hideTip();
    });
    window.addEventListener("scroll", hideTip, { passive: true });
    window.addEventListener("resize", hideTip);

    const DESCRIPTIONS = {
      "all services":
        "Browse every service available from the Service Desk, or pick a category to narrow things down.",
      accessibility:
        "Request accessibility reviews and support to ensure content and tools work for everyone.",
      "account services":
        "Manage your accounts, access, passwords, and identity credentials like PIV cards.",
      "apps & tools":
        "Get access to, install, or troubleshoot the software applications and tools you use day to day.",
      aurora: "Support and requests related to the AURORA platform.",
      collaboration:
        "Tools and support for working together — chat, meetings, file sharing, and team spaces.",
      "devices & equipment":
        "Request, return, or get help with laptops, peripherals, and other hardware.",
      "event and room support":
        "Book and get technical support for conference rooms, events, and presentations.",
      "get help":
        "Report an issue or get support — outages, hardware and software problems, lost devices, security incidents, and more.",
      grace: "Support and requests related to the GRACE platform.",
      "help me learn":
        "Find training, certifications, and learning resources to build your skills.",
    };
    const DEFAULT_DESC =
      "Browse the services in this category and submit a request to the Service Desk.";
    function applyCategoryDescription() {
      const heading = Array.from(main.querySelectorAll("h1, h2, h3")).find(
        (h) => !inSidebar(h)
      );
      if (!heading) return;
      const text =
        DESCRIPTIONS[(heading.textContent || "").trim().toLowerCase()] ||
        DEFAULT_DESC;
      let desc = heading.parentElement
        ? heading.parentElement.querySelector(":scope > .svc-cat-description")
        : null;
      if (!desc) {
        desc = document.createElement("p");
        desc.className = "svc-cat-description";
        heading.insertAdjacentElement("afterend", desc);
      }
      if (desc.textContent !== text) desc.textContent = text;
    }

    function enhance() {
      [hideDescriptions, describeCards, applyCategoryDescription].forEach(
        (fn) => {
          try {
            fn();
          } catch (e) {
            console.warn("enhance step failed:", e);
          }
        }
      );
    }
    enhance();
    new MutationObserver(enhance).observe(main, {
      childList: true,
      subtree: true,
    });
  })();

  // ---------------------------------------------------------------------------
  // 2. Category-swap skeleton hiding: tag catalog grid cells that haven't
  //    rendered their real link yet as skeletons so the CSS shimmer applies.
  // ---------------------------------------------------------------------------
  (function () {
    const main = document.getElementById("service-catalog-main-content");
    if (!main) return;

    const inSidebar = (el) =>
      !!(
        el &&
        el.nodeType === 1 &&
        typeof el.closest === "function" &&
        el.closest('[data-test-id^="sidebar-category"]')
      );

    function tagSkeletons() {
      const cells = main.querySelectorAll(
        '[data-testid="service-catalog-list-item-container"], [data-garden-id="grid.col"]'
      );
      cells.forEach((cell) => {
        if (cell.nodeType !== 1) return;
        if (inSidebar(cell)) return;
        const link = cell.querySelector('a[href*="/services/"]');
        const isSkeleton = !link || (link.textContent || "").trim().length === 0;
        cell.classList.toggle("svc-skeleton", isSkeleton);
      });
    }

    try {
      tagSkeletons();
    } catch (e) {
      console.warn("skeleton tag failed:", e);
    }
    new MutationObserver(() => {
      try {
        tagSkeletons();
      } catch (e) {
        console.warn("skeleton tag failed:", e);
      }
    }).observe(main, { childList: true, subtree: true });
  })();

})();
