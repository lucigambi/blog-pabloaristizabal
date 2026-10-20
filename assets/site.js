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
  const previous = carousel.querySelector('[data-prev]');
  const next = carousel.querySelector('[data-next]');
  const cards = [...track.children];
  const status = carousel.querySelector('[data-carousel-status]');
  const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  function update() {
    const max = track.scrollWidth - track.clientWidth;
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= max - 2;
    const first = Math.round(track.scrollLeft / step()) + 1;
    const visible = Math.max(1, Math.round(track.clientWidth / step()));
    const last = Math.min(cards.length, first + visible - 1);
    status.textContent = first === last ? `${first} de ${cards.length} notas` : `${first}–${last} de ${cards.length} notas`;
  }
  function move(direction) {
    track.scrollBy({left: direction * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  track.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(track);
  update();
});
