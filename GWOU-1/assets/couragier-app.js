(() => {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const deckMotion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 620px) and (max-width: 899px)');
  const deck = document.querySelector('.cg-ecosystem');
  const cards = deck ? Array.from(deck.querySelectorAll('.cg-eco')) : [];
  const progress = document.createElement('div');
  progress.className = 'app-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const scenes = Array.from(document.querySelectorAll(
    'main section h2, .cg-step, .cg-category, .cg-photo, .cg-why-img, .cg-benefit, ' +
    '.ca-article, .ca-value, .ca-visual, .ce-benefit, .ce-standard, ' +
    '.reviews .summary, .reviews .share'
  ));
  const sceneOffsets = scenes.map(scene => {
    scene.classList.add('app-scene');
    return 0;
  });

  const slots = cards.map((card, index) => {
    const slot = document.createElement('div');
    slot.className = 'app-deck-slot';
    slot.style.setProperty('--app-index', index);
    return slot;
  });

  function configureDeck() {
    deck?.classList.toggle('app-deck', deckMotion.matches);
    cards.forEach((card, index) => {
      card.style.removeProperty('scale');
      const slot = slots[index];
      if (deckMotion.matches) {
        if (slot.isConnected) return;
        card.replaceWith(slot);
        slot.append(card);
      } else if (slot.isConnected) {
        slot.replaceWith(card);
        card.style.removeProperty('--app-card-lift');
        card.style.removeProperty('--app-card-scale');
      }
    });
  }

  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;

  function render() {
    frame = 0;
    if (!motion.matches) {
      sceneOffsets.fill(0);
      cards.forEach(card => card.style.removeProperty('scale'));
      scenes.forEach(scene => scene.style.removeProperty('--app-y'));
      return;
    }

    const height = innerHeight;
    const maxScroll = document.documentElement.scrollHeight - height;
    const positions = scenes.map((scene, index) => scene.getBoundingClientRect().top - sceneOffsets[index]);
    const cardPositions = deckMotion.matches ? [] : cards.map(card => card.getBoundingClientRect().top);
    const stack = deckMotion.matches ? slots.map(slot => slot.getBoundingClientRect()) : [];
    progress.style.setProperty('--app-progress', maxScroll > 0 ? clamp(scrollY / maxScroll) : 0);

    scenes.forEach((scene, index) => {
      const distance = clamp((positions[index] - height * 0.42) / (height * 0.5));
      const direction = index % 2 ? 1 : -1;
      const reach = innerWidth < 620 ? 24 : 96;
      scene.style.setProperty('--app-x', `${distance * reach * direction}px`);
      sceneOffsets[index] = distance * 35;
      scene.style.setProperty('--app-y', `${sceneOffsets[index]}px`);
      scene.style.setProperty('--app-scale', 1 - distance * 0.06);
    });

    cardPositions.forEach((top, index) => {
      const distance = clamp((top - height * 0.5) / (height * 0.5));
      cards[index].style.scale = 1 - distance * (0.08 + (index % 3) * 0.025);
    });

    stack.slice(0, -1).forEach((slot, index) => {
      const overlap = clamp((slot.bottom - stack[index + 1].top) / slot.height);
      cards[index].style.setProperty('--app-card-lift', `${-overlap * 18}px`);
      cards[index].style.setProperty('--app-card-scale', 1 - overlap * 0.07);
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  configureDeck();
  schedule();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('load', schedule);
  motion.addEventListener('change', schedule);
  deckMotion.addEventListener('change', () => {
    configureDeck();
    schedule();
  });
})();

(() => {
  const gallery = document.querySelector('.cg-gallery');
  if (!gallery) return;

  const root = document.documentElement;
  const stage = gallery.querySelector('.cg-gallery-stage');
  const slides = [...stage.querySelectorAll('img')];
  const controls = gallery.querySelector('.cg-gallery-controls');
  const dots = [...controls.querySelectorAll('.cg-gallery-dots button')];
  const toggle = controls.querySelector('.cg-gallery-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let visible = false;
  let paused = motion.matches;
  let timer;
  let start;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-pressed', String(i === current));
    });
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || !visible || document.hidden || start || root.classList.contains('cg-intro-active')) return;
    timer = setTimeout(() => {
      show(current + 1);
      schedule();
    }, 2000);
  }

  function setPaused(value) {
    paused = value;
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? toggle.dataset.play : toggle.dataset.pause);
    schedule();
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    show(i);
    setPaused(true);
  }));
  toggle.addEventListener('click', () => setPaused(!paused));
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
    schedule();
  });
  stage.addEventListener('pointerup', event => {
    if (start?.id !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    start = null;
    if (Math.abs(x) >= 40 && Math.abs(x) > Math.abs(y)) {
      show(current + (x < 0 ? 1 : -1));
      setPaused(true);
    } else {
      schedule();
    }
  });
  stage.addEventListener('lostpointercapture', () => {
    if (!start) return;
    start = null;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => setPaused(motion.matches));
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0.4 }).observe(stage);
  if (root.classList.contains('cg-intro-active')) {
    const intro = new MutationObserver(() => {
      if (root.classList.contains('cg-intro-active')) return;
      intro.disconnect();
      schedule();
    });
    intro.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
  controls.hidden = false;
  setPaused(paused);
})();
