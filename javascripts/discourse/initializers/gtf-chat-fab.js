import { apiInitializer } from "discourse/lib/api";
import { iconHTML } from "discourse/lib/icon-library";
import { i18n } from "discourse-i18n";

const FAB_ID = "gtf-chat-fab";

function isAuthOrAdminPath(pathname) {
  return /^\/(login|signup|password|invites|admin|safe-mode)(\/|$)/.test(
    pathname
  );
}

function canUseChat(api) {
  const siteSettings = api.container.lookup("site-settings:main");
  const currentUser = api.container.lookup("service:current-user");

  return siteSettings.chat_enabled && currentUser;
}

function openChat(api) {
  const headerButton = document.querySelector(".chat-header-icon .btn");

  if (headerButton) {
    headerButton.click();
    return;
  }

  const router = api.container.lookup("service:router");
  const chatStateManager = api.container.lookup("service:chat-state-manager");

  chatStateManager.prefersDrawer();
  router.transitionTo(chatStateManager.lastKnownChatURL || "/chat");
}

function shouldShowFab(api, pathname) {
  if (!canUseChat(api) || isAuthOrAdminPath(pathname)) {
    return false;
  }

  const chatStateManager = api.container.lookup("service:chat-state-manager");

  return !(
    chatStateManager.isDrawerActive || chatStateManager.isFullPageActive
  );
}

function updateFab(api, pathname) {
  const fab = document.getElementById(FAB_ID);

  if (!fab) {
    return;
  }

  fab.classList.toggle("is-hidden", !shouldShowFab(api, pathname));
}

function ensureFab(api) {
  let fab = document.getElementById(FAB_ID);

  if (!fab) {
    fab = document.createElement("button");
    fab.id = FAB_ID;
    fab.type = "button";
    fab.className = "gtf-chat-fab btn btn-icon-text btn-primary";
    fab.setAttribute("aria-label", i18n("chat.title_capitalized"));
    fab.innerHTML = `${iconHTML("d-chat")}<span class="gtf-chat-fab__label">${i18n("chat.title_capitalized")}</span>`;
    fab.addEventListener("click", (event) => {
      event.preventDefault();
      openChat(api);
    });
    document.body.appendChild(fab);
  }

  updateFab(api, window.location.pathname);
}

export default apiInitializer((api) => {
  if (!api.container.lookup("site-settings:main").chat_enabled) {
    return;
  }

  const syncFab = (url) => {
    ensureFab(api);
    updateFab(api, url || window.location.pathname);
  };

  syncFab(window.location.pathname);

  api.onPageChange((url) => {
    syncFab(url);
  });

  api.onAppEvent("chat:toggle-expand", () => {
    updateFab(api, window.location.pathname);
  });
});
