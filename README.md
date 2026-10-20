# Sitio personal de Pablo Aristizábal

Sitio estático: HTML, CSS y JavaScript, sin backend ni servicios de publicación.

## Vista local

Desde esta carpeta: `python -m http.server 8000`. Abrir http://localhost:8000.
También se puede abrir index.html directamente; compartir y copiar enlaces dependen del navegador y funcionan mejor por HTTP/HTTPS.

## Edición

- Diseño compartido: assets/site.css.
- Jerarquía tipográfica y acabado editorial: assets/editorial.css, inspirado en la referencia conservada en originales/referencia-diseno.html. Títulos Bricolage Grotesque, lectura Source Serif 4 y etiquetas IBM Plex Mono; bandas marfil y verde oscuro con acentos cálidos.
- Menú, filtros, búsqueda y compartir: assets/site.js.
- Animaciones: assets/motion.js, con GSAP 3.15.0 y ScrollTrigger alojados en assets/vendor/. Por pedido expreso, el movimiento está activo incluso si el sistema indica movimiento reducido. El botón Pausar animaciones lo desactiva y recuerda la elección en este navegador. No se modifica la configuración del sistema; los textos permanecen visibles si la biblioteca no carga.
- Texto completo: contenido/biografia.html y contenido/gobernar-la-ia.html.
- Fuentes del ensayo: contenido/fuentes.html.
- Catálogo editorial: contenido/publicaciones.json.
- Plantillas de páginas: scripts/build.py.

Después de editar los contenidos o las plantillas, ejecutar `python scripts/build.py`. No editar los HTML generados si se desea conservar el cambio al regenerar.

Para incorporar un artículo nuevo hay que crear su contenido y su página en el generador, y agregar una entrada al catálogo. El catálogo alimenta la portada y el archivo; la primera entrada es el destacado. No se publica contenido automáticamente.

## Publicación

Repositorio: `lucigambi/blog-pabloaristizabal`. Vercel ejecuta `node scripts/package-site.cjs` y publica exclusivamente `dist/`, según `vercel.json`. Antes de subir cambios editoriales, regenerar con `python scripts/build.py`. Las fotos originales se excluyen de Git.

Las fotos de prensa optimizadas están en `assets/img/prensa-*.webp`. Son copias de hasta 1920 px, sin recortes, con la orientación corregida y comprimidas para web. El registro `contenido/imagenes-prensa.json` relaciona cada original con su copia; las fotos idénticas comparten archivo.

La carpeta `assets/FotosOriginales (No modificar)` no se usa en el sitio y debe excluirse de la subida. Se puede quitar del paquete publicado sin afectar las páginas ni las copias optimizadas. Para volver a generar las copias mientras se conservan los originales: `python scripts/optimizar_prensa.py` (requiere Pillow).

Subir los seis HTML generados, assets/, header.jpg, time-2026.jpg y ensayos/ respetando las rutas. El hosting no necesita Python. originales/ conserva las descargas iniciales y no hace falta publicarlo, tampoco contenido/ ni scripts/.

## Pendientes editoriales

- Reemplazar la foto de portada por un montaje cuando estén disponibles los videos autorizados.
- Incorporar nuevas noticias; los filtros vacíos no contienen ejemplos inventados.
- Preparar traducciones completas antes de activar un selector de idioma.
- Confirmar dominio definitivo para URLs canónicas, sitemap e imágenes sociales con URLs absolutas.
- Respetar el criterio editorial de AGENTS.md: contenido original literal y etiquetas de sección informativas.

Las tipografías se solicitan a Google Fonts con alternativas locales. No se añadieron servicios nuevos, cuentas, formularios ni automatizaciones de redes.
