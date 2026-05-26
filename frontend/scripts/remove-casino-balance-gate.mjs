import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '../src');

const balanceBlockRe =
  /\s*if\s*\(\s*!user\.avbalance\s*\|\|\s*user\.avbalance\s*<=\s*0\s*\)\s*\{[\s\S]*?return;\s*\}\s*/g;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(ent.name)) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk(srcRoot)) {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('startCasinoGame') && !c.includes('!user.avbalance')) continue;

  const before = c;
  c = c.replace(balanceBlockRe, '\n');

  if (c.includes('startCasinoGame') && !c.includes('getCasinoWalletAmount')) {
    c = c.replace(
      /import\s*\{\s*startCasinoGame\s*\}\s*from\s*(['"][^'"]+casinoService[^'"]*['"])\s*;?/g,
      'import { startCasinoGame, getCasinoWalletAmount } from $1;'
    );
  }

  c = c.replace(
    /startCasinoGame\(\s*([\s\S]*?),\s*user\.avbalance\s*\)/g,
    'startCasinoGame($1, getCasinoWalletAmount(user))'
  );

  if (c !== before) {
    fs.writeFileSync(file, c, 'utf8');
    changed++;
    console.log('updated', path.relative(srcRoot, file));
  }
}
console.log(`Done. ${changed} file(s) updated.`);
