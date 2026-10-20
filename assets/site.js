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
