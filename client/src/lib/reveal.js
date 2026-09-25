const observed = new WeakSet();
let prefersReduced = false;
if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function inViewport(el, margin = 60) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top < vh - margin && r.bottom > margin;
}

function reveal(el) {
  el.classList.add("is-revealed");
  const delay = el.dataset.revealDelay;
  if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
}

function watch(el) {
  if (prefersReduced) return;
  reveal(el);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  io.observe(el);
}

function scan(root) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll("[data-reveal]").forEach((el) => {
    if (observed.has(el)) return;
    observed.add(el);
    if (inViewport(el)) reveal(el);
    else watch(el);
  });
}

export function initScrollReveal() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return () => {};
  if (!prefersReduced) {
    const io = new MutationObserver(() => scan(document.body));
    io.observe(document.body, { childList: true, subtree: true });
    scan(document.body);
    return () => io.disconnect();
  }
  scan(document.body);
  return () => {};
}