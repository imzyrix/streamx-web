// StreamX web front end — active navigation state.

export function setActiveNav(view) {
  document.querySelectorAll("[data-view]").forEach((a) => {
    a.classList.toggle("active", a.dataset.view === view);
  });
}
