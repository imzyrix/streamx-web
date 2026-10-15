import Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToTop(immediate = true): void {
  if (instance) {
    instance.scrollTo(0, { immediate });
    return;
  }
  window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}

export function scrollToElement(el: HTMLElement | null, offset = 88): void {
  if (!el) return;
  const target = el.getBoundingClientRect().top + window.scrollY - offset;
  scrollToY(Math.max(0, target), false);
}

export function scrollToY(target: number, immediate = false): void {
  if (instance) {
    instance.scrollTo(target, { immediate });
    return;
  }
  window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
}
