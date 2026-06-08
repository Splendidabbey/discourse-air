import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  api.onPageChange(() => {
    const link = document.querySelector("[data-gtf-upgrade-link]");

    if (!link) {
      return;
    }

    if (settings.upgrade_banner_url) {
      link.href = settings.upgrade_banner_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  });
});
