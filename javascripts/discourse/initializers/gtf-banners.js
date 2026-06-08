import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  api.onPageChange(() => {
    const link = document.querySelector("[data-gtf-upgrade-link]");

    if (!link) {
      return;
    }

    const url = settings.upgrade_banner_url || "/s";
    link.href = url;

    if (/^https?:\/\//i.test(url)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  });
});
