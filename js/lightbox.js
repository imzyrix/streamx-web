// StreamX web front end — trailer lightbox (YouTube embed).

const lightboxEl = document.getElementById("lightbox");

export function openTrailer(source) {
  if (!source) return;
  lightboxEl.classList.remove("hidden");
  lightboxEl.innerHTML = `
    <button class="lightbox-close" data-lightbox-close aria-label="Close">&times;</button>
    <div class="lightbox-frame">
      <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(source)}?autoplay=1&rel=0"
        title="Trailer" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
    </div>`;
  document.body.style.overflow = "hidden";
}

export function closeTrailer() {
  lightboxEl.classList.add("hidden");
  lightboxEl.innerHTML = "";
  const detailOpen = document.getElementById("detail")?.classList.contains("hidden") === false;
  const modalOpen = document.querySelector(".modal:not(.hidden)");
  if (!detailOpen && !modalOpen) document.body.style.overflow = "";
}

export function lightboxIsOpen() {
  return !lightboxEl.classList.contains("hidden");
}
