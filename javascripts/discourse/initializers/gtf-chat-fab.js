import { scheduleOnce } from "@ember/runloop";
import { apiInitializer } from "discourse/lib/api";
import { iconHTML } from "discourse/lib/icon-library";
import { i18n } from "discourse-i18n";

const FAB_ID = "gtf-chat-fab";

function isAuthOrAdminPath(pathname) {
  return /^\/(login|signup|password|invites|admin|safe-mode)(\/|$)/.test(
    pathname
  );
}

function getChatStateManager(api) {
  try {
    return api.container.lookup("service:chat-state-manager");
  } catch {
    return null;
  }
}

function getSiteSettings(api) {
  return api.container.lookup("service:site-settings");
}

function canUseChat(api) {
  const siteSettings = getSiteSettings(api);

  return siteSettings?.chat_enabled && api.getCurrentUser();
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

function isChatCoveringScreen(api, pathname) {
  if (/^\/chat(\/|$)/.test(pathname)) {
    return true;
  }

  const chatStateManager = getChatStateManager(api);

  return chatStateManager?.isDrawerExpanded === true;
}

function shouldShowFab(api, pathname) {
  if (!canUseChat(api) || isAuthOrAdminPath(pathname)) {
    return false;
  }

  return !isChatCoveringScreen(api, pathname);
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
    fab.className = "gtf-chat-fab btn btn-primary";
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
  if (!getSiteSettings(api)?.chat_enabled) {
    return;
  }

  const syncFab = (url) => {
    scheduleOnce("afterRender", null, () => {
      ensureFab(api);
      updateFab(api, url || window.location.pathname);
    });
  };

  syncFab(window.location.pathname);

  api.onPageChange((url) => {
    syncFab(url);
  });

  api.onAppEvent("chat:toggle-expand", () => {
    scheduleOnce("afterRender", null, () => {
      updateFab(api, window.location.pathname);
    });
  });
});
