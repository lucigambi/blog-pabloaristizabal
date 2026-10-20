const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => { const expanded = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(expanded)); document.querySelector('.navigation').classList.toggle('open', expanded); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu){menu.setAttribute('aria-expanded','false');document.querySelector('.navigation').classList.remove('open');} });
const filters = document.querySelectorAll('[data-filter]');
const search = document.querySelector('[data-search]');
let selected = 'Todas';
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function filterPosts(){let count=0;document.querySelectorAll('[data-post]').forEach(post=>{const show=(selected==='Todas'||post.dataset.type===selected||post.dataset.topic===selected)&&normalize(post.textContent).includes(normalize(search?.value||''));post.hidden=!show;if(show)count++;});const status=document.querySelector('[data-count]');if(status)status.textContent=`${count} ${count===1?'publicación':'publicaciones'}`;const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count>0;document.dispatchEvent(new Event("publications:filtered"));}
filters.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterPosts();}));search?.addEventListener('input',filterPosts);
document.querySelector('[data-copy]')?.addEventListener('click',async()=>{const status=document.querySelector('.share-status');try{await navigator.clipboard.writeText(location.href);status.textContent='Enlace copiado.';}catch{status.textContent='Copiá el enlace desde la barra de direcciones.';}});
const share=document.querySelector('[data-share]');if(share){share.hidden=!navigator.share;share.addEventListener('click',async()=>{try{await navigator.share({title:document.title,url:location.href});}catch(e){if(e.name!=='AbortError')document.querySelector('.share-status').textContent='Podés usar el botón Copiar enlace.';}});}
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.press-track');
  const cards = [...track.children];
  const previous = carousel.querySelector('[data-prev]');
  const next = carousel.querySelector('[data-next]');
  const status = carousel.querySelector('[data-carousel-status]');
  const itemLabel = carousel.dataset.itemLabel || 'Nota';
  const itemsLabel = carousel.dataset.itemsLabel || 'notas';
  status.textContent = `${cards.length} ${itemsLabel}`;
  if (cards.length < 2) {
    previous.disabled = next.disabled = true;
    return;
  }
  // Copias a ambos lados: el salto de posición reproduce el mismo cuadro visual.
  function duplicate(card) {
    const copy = card.cloneNode(true);
    copy.dataset.carouselClone = '';
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a,button,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1'));
    return copy;
  }
  track.prepend(...cards.map(duplicate));
  track.append(...cards.map(duplicate));
  track.classList.add('is-looping');
  previous.disabled = next.disabled = false;
  let stride = 0, cycle = 0, position = 0, lastTime = 0;
  let visible = false, hovered = false, focused = false, dragging = false;
  let holdUntil = 0, animation = null;
  function wrap(value) {
    return cycle + ((value - cycle) % cycle + cycle) % cycle;
  }
  function measure() {
    const fraction = cycle ? (position - cycle) / cycle : 0;
    stride = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
    cycle = stride * cards.length;
    position = wrap(cycle * (1 + fraction));
    animation = null;
    track.scrollLeft = position;
  }
  function move(direction) {
    const now = performance.now();
    animation = {from: position, distance: direction * stride, start: now};
    holdUntil = now + 3500;
    const index = ((Math.round((position - cycle) / stride) + direction) % cards.length + cards.length) % cards.length;
    status.textContent = `${itemLabel} ${index + 1} de ${cards.length}`;
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  carousel.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true; });
  carousel.addEventListener('pointerleave', () => { hovered = false; });
  carousel.addEventListener('focusin', () => { focused = true; });
  carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); });
  track.addEventListener('pointerdown', () => { dragging = true; animation = null; });
  const release = () => { dragging = false; holdUntil = performance.now() + 2500; };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  track.addEventListener('wheel', () => { animation = null; holdUntil = performance.now() + 2500; }, {passive: true});
  track.addEventListener('scroll', () => {
    // No perder la precisión fraccional del avance automático.
    if (Math.abs(track.scrollLeft - position) > 2) {
      position = track.scrollLeft;
      if (cycle) {
        const normalized = wrap(position);
        if (Math.abs(normalized - position) > 2) track.scrollLeft = normalized;
        position = normalized;
      }
    }
  }, {passive: true});
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(carousel);
  new ResizeObserver(measure).observe(track);
  measure();
  function tick(now) {
    const elapsed = lastTime ? Math.min(now - lastTime, 50) : 0;
    lastTime = now;
    if (visible && !document.hidden && cycle) {
      if (animation) {
        const progress = Math.min((now - animation.start) / 650, 1);
        const eased = (1 - Math.cos(Math.PI * progress)) / 2;
        position = wrap(animation.from + animation.distance * eased);
        track.scrollLeft = position;
        if (progress === 1) animation = null;
      } else if (!hovered && !focused && !dragging && now > holdUntil && document.documentElement.dataset.motion !== 'paused') {
        position = wrap(position + elapsed * .018);
        track.scrollLeft = position;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
