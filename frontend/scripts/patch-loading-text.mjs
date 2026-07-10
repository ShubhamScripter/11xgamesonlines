import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'node_modules') walk(p, files);
    else if (ent.isFile() && ent.name.endsWith('.jsx')) files.push(p);
  }
  return files;
}

let count = 0;
for (const file of walk(root)) {
  if (file.includes('LoadingText.jsx')) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('Loading...</div>')) continue;

  const original = content;
  content = content.replace(
    /<div className="text-white text-sm">Loading\.\.\.<\/div>/g,
    '<LoadingText className="text-white text-sm" />'
  );

  if (content === original) continue;

  if (!content.includes('LoadingText from')) {
    const rel = path.relative(root, file);
    const depth = rel.split(path.sep).length - 1;
    const relToI18n = `${'../'.repeat(depth)}i18n/LoadingText`;
    const correctImport = `import LoadingText from '${relToI18n}';\n`;
    const firstImport = content.indexOf('import ');
    const lineEnd = content.indexOf('\n', firstImport);
    content = content.slice(0, lineEnd + 1) + correctImport + content.slice(lineEnd + 1);
  }

  fs.writeFileSync(file, content);
  count += 1;
  console.log('updated:', path.relative(root, file));
}

console.log('Total:', count);
