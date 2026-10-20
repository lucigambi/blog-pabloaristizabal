// Publica únicamente HTML, estilos, scripts de navegador e imágenes.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
function copy(relative) {
  const source = path.join(root, relative);
  const destination = path.join(output, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
for (const file of fs.readdirSync(root)) {
  if (file.endsWith('.html') || ['header.jpg', 'time-2026.jpg'].includes(file)) copy(file);
}
function tree(relative) {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    const file = path.join(relative, entry.name);
    if (entry.isDirectory()) tree(file);
    else copy(file);
  }
}
for (const dir of ['ensayos', 'noticias', 'assets/img', 'assets/vendor']) tree(dir);
for (const file of fs.readdirSync(path.join(root, 'assets'))) {
  if (/\.(css|js)$/.test(file)) copy(path.join('assets', file));
}
console.log('Sitio preparado en dist; originales y contenido editorial excluidos.');
