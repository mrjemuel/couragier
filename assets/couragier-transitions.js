(() => {
  const root = document.documentElement;
  const mascot = document.querySelector('#cg-route-transition img');
  const still = mascot.getAttribute('src');
  const animated = mascot.dataset.animation;
  const preloadedMascot = new Image();
  preloadedMascot.src = animated;
  const ownedHosts = new Set(['couragier.com', 'www.couragier.com', 'learn.couragier.com', 'shop.couragier.com']);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let leaving = false;

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    leaving = false;
    root.classList.remove('cg-route-active', 'cg-intro-active');
    mascot.src = still;
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-cg-transition][href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const href = link.getAttribute('href').trim();
    if (!href || href.startsWith('#')) return;

    const next = new URL(link.href);
    if (!['https:', 'http:'].includes(next.protocol) ||
        (next.origin !== location.origin && !ownedHosts.has(next.hostname)) ||
        next.pathname.startsWith('/cdn-cgi/')) return;
    const normalizePath = (path) => path.replace(/\/+$/, '') || '/';
    if (next.origin === location.origin && normalizePath(next.pathname) === normalizePath(location.pathname) &&
        next.search === location.search) return;

    event.preventDefault();
    if (leaving) return;
    leaving = true;
    root.classList.add('cg-route-active');
    mascot.src = reducedMotion.matches ? still : animated;
    setTimeout(() => location.assign(next.href), reducedMotion.matches ? 150 : 700);
  });
})();
