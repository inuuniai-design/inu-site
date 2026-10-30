// Gentle motion for the iNU site, using Motion (https://motion.dev).
// Content stays visible if this file or the CDN fails to load, and nothing moves
// for visitors who ask their device to reduce motion.
import { animate, inView, hover, press, stagger } from "https://cdn.jsdelivr.net/npm/motion@14.2.0/+esm";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = [0.22, 1, 0.36, 1];

// When the CDN is slow, the page has already been read for a while; hiding text
// that is on screen just to fade it back in would look like a flicker.
const late = performance.now() > 800;
const onScreen = (el) => el.getBoundingClientRect().top < window.innerHeight;

if (!reduce) {
  // 1. Page top: the headline text rises in, the illustration settles in after it.
  const intro = document.querySelectorAll(".hero-text > *, .page-head-grid > div:first-child > *");
  if (intro.length && !late) {
    animate(intro, { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, delay: stagger(0.08), ease });
  }
  const art = document.querySelectorAll(".hero-visual, .page-head-art");
  if (art.length && !late) {
    animate(art, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.8, delay: 0.2, ease });
  }
  // The sleeping dog's "z z" and the sparkles drift softly, forever.
  document.querySelectorAll(".hero-art .a-z").forEach((z, i) => {
    animate(z, { opacity: [0.35, 1, 0.35], y: [0, -6, 0] }, { duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" });
  });
  document.querySelectorAll(".hero-art .a-spark").forEach((s) => {
    animate(s, { opacity: [1, 0.3, 1] }, { duration: 2.4, repeat: Infinity, ease: "easeInOut" });
  });

  // 2. Scrolling: sections fade up as they come into view, a few at a time.
  const reveal = document.querySelectorAll(
    "main section:not(.hero) .section-title, main section:not(.hero) .lead, .trust-grid > div, .grid > .card, " +
      ".cycle-figure, .cycle-list li, .band, .notice, .cta, .gallery figure, .table-wrap"
  );
  reveal.forEach((el) => {
    // Already visible when the script arrives: leave it as is instead of hiding it.
    if (onScreen(el)) return;
    // Stagger siblings in the same row (cards, list items, photos) instead of the whole page.
    const index = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.opacity = "0";
    inView(
      el,
      () => {
        animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, delay: Math.min(index, 5) * 0.08, ease });
      },
      { amount: 0.2 }
    );
  });

  // 3. Buttons respond to the pointer: a small lift on hover, a small squeeze on press.
  // Motion handles the transform, so the stylesheet's own hover lift is switched off (motion-ready).
  document.documentElement.classList.add("motion-ready");
  hover(".btn", (el) => {
    animate(el, { scale: 1.04, y: -2 }, { duration: 0.2 });
    return () => animate(el, { scale: 1, y: 0 }, { duration: 0.2 });
  });
  press(".btn", (el) => {
    animate(el, { scale: 0.97 }, { duration: 0.1 });
    return () => animate(el, { scale: 1.04 }, { duration: 0.15 });
  });
  hover(".grid > .card", (el) => {
    animate(el, { y: -4 }, { duration: 0.25 });
    return () => animate(el, { y: 0 }, { duration: 0.25 });
  });

  // 4. Dog photos zoom in slowly while the pointer rests on them.
  hover(".gallery figure", (fig) => {
    const img = fig.querySelector("img");
    if (!img) return;
    animate(img, { scale: 1.06 }, { duration: 1.2, ease });
    return () => animate(img, { scale: 1 }, { duration: 0.8, ease });
  });
}
