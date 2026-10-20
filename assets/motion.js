/* GSAP local. Sin alterar el texto editorial ni interceptar el scroll nativo. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  // El usuario solicitó expresamente movimiento en este sitio. No se modifica el sistema.
  let enabled = true;
  try { enabled = localStorage.getItem('pablo-motion') !== 'paused'; } catch {}
  const toggle = document.createElement('button');
  toggle.className = 'motion-toggle';
  document.body.append(toggle);
  const updateToggle = () => {
    toggle.textContent = enabled ? 'Pausar animaciones' : 'Activar animaciones';
    toggle.setAttribute('aria-label', toggle.textContent);
    document.documentElement.dataset.motion = enabled ? 'full' : 'paused';
  };
  updateToggle();
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  function setup() {
  media.add({ motion: enabled ? 'all' : 'not all', desktop: '(min-width: 850px)', fine: '(hover: hover) and (pointer: fine)' }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    const cleanup = [];
    const on = (element, event, callback) => {
      element.addEventListener(event, callback);
      cleanup.push(() => element.removeEventListener(event, callback));
    };
    const reveal = (targets, trigger, extra = {}) => {
      if (!targets.length) return;
      gsap.from(targets, {
        y: desktop ? 85 : 40, opacity: 0, duration: 1.25, stagger: .15,
        ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger, start: 'top 87%', toggleActions: 'play none none reverse' }, ...extra
      });
    };
    gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });

    const hero = document.querySelector('.hero-full');
    if (hero) {
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      entrance.from('.hero-visual img', { scale: 1.18, duration: 2.4 }, 0)
        .from('.header-inner', { y: -18, opacity: 0, duration: .9, clearProps: 'transform,opacity' }, .1)
        .from('.hero-copy > *', { y: 85, opacity: 0, duration: 1.4, stagger: .18, clearProps: 'transform,opacity' }, .25)
        .from('.hero-scroll', { opacity: 0, duration: .7, clearProps: 'opacity' }, 1.3);
      const drift = gsap.fromTo('.hero-visual img', { scale: 1, xPercent: 0 }, { scale: 1.10, xPercent: -1, duration: 7, delay: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', immediateRender: false });
      gsap.to('.hero-visual', { yPercent: desktop ? 24 : 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-copy', { y: desktop ? -80 : -25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } });
      const cue = gsap.to('.hero-scroll', { y: 12, duration: .85, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: self => { [cue, drift].forEach(animation => self.isActive ? animation.play() : animation.pause()); } });
    }

    reveal(gsap.utils.toArray('.page-intro > *'), '.page-intro');
    const strip = document.querySelector('.topic-strip');
    if (strip) reveal([...strip.children], strip, { x: -20, y: 0, stagger: .16 });
    gsap.utils.toArray('.section-head, .about-grid, .contact-grid').forEach(block => reveal([...block.children], block));
    gsap.utils.toArray('.stats > div, .bio-aside, .badge, .reading .bridge, .reading blockquote').forEach(block => reveal([block], block));
    gsap.utils.toArray('.press-list, .talks, .awards').forEach(list => {
      [...list.children].forEach(row => reveal([row], row, { x: desktop ? 30 : 0, y: 20 }));
    });
    gsap.utils.toArray('.feature').forEach(card => {
      // Mantener visibles las tarjetas del archivo al buscar o filtrar.
      if (document.body.classList.contains('home-page')) {
        reveal([card], card, { y: 65, duration: 1.25 });
        reveal(gsap.utils.toArray('.feature-copy > *', card), card, { y: 25, stagger: .09 });
      }
      if (context.conditions.fine) {
        const photo = card.querySelector('img');
        on(card, 'mouseenter', () => gsap.to(photo, { scale: 1.055, duration: .65, ease: 'power2.out', overwrite: true }));
        on(card, 'mouseleave', () => gsap.to(photo, { scale: 1, duration: .7, ease: 'power2.out', overwrite: true }));
        cleanup.push(() => gsap.set(photo, { clearProps: 'transform' }));
      }
    });
    gsap.utils.toArray('.about-band, .contact-band').forEach(band => {
      if (!desktop) return;
      gsap.fromTo(band, { '--section-glow': '0%' }, { '--section-glow': '100%', ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    });
    if (context.conditions.fine) {
      gsap.utils.toArray('.button').forEach(button => {
        on(button, 'mouseenter', () => gsap.to(button, { y: -4, duration: .25, overwrite: true }));
        on(button, 'mouseleave', () => gsap.to(button, { y: 0, duration: .4, ease: 'back.out(2)', overwrite: true }));
        cleanup.push(() => gsap.set(button, { clearProps: 'transform' }));
      });
    }
    // El cuerpo del ensayo permanece estable: solo se anima la introducción.
    const articleHeader = document.querySelector('.article-shell > header');
    if (articleHeader) reveal([...articleHeader.children], articleHeader, { y: 22, duration: .8 });
    const navigation = document.querySelector('.navigation');
    const menuButton = document.querySelector('.menu-toggle');
    if (menuButton) on(menuButton, 'click', () => {
      if (menuButton.getAttribute('aria-expanded') === 'true') {
        gsap.fromTo(navigation.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .055, duration: .4, clearProps: 'transform,opacity', overwrite: true });
      }
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    on(window, 'load', () => ScrollTrigger.refresh());
    return () => cleanup.forEach(fn => fn());
  });
  }
  setup();
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    media.revert();
    try { localStorage.setItem('pablo-motion', enabled ? 'full' : 'paused'); } catch {}
    updateToggle();
    setup();
    ScrollTrigger.refresh();
  });
  document.addEventListener('publications:filtered', () => ScrollTrigger.refresh());
})();
