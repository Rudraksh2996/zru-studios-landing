import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const html = read('index.html');
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.has(fragment), `Missing fragment #${fragment}`);
}
for (const file of ['index.html', 'src/styles.css', 'src/lobby.js']) {
  const text = read(file);
  for (const [, path] of text.matchAll(/(?:src=|href=)["'](\/[^"']+)["']|["'](\/design-assets\/[^"']+)["']/g)) {
    if (path) assert(existsSync(resolve(root, path.startsWith('/src/') ? path.slice(1) : `public${path}`)), `Missing ${path}`);
  }
  for (const [, path] of text.matchAll(/["'(](\/design-assets\/[^"')]+)["')]/g)) {
    assert(existsSync(resolve(root, `public${path}`)), `Missing ${path}`);
  }
  assert(!/sublevel|hello@|sales@|Kyoto &amp; remote|Porto, Portugal|\bLLC\b/i.test(text), `Template detail left in ${file}`);
}
assert.equal((html.match(/<article\b/g) || []).length, 4);
for (const title of ['Zru Studios', 'Luminary Dashboard', 'Apex Brand Identity', 'Orbit SaaS Platform', 'Prism Design System']) assert(html.includes(title), `Missing ${title}`);
for (const file of [...readdirSync(resolve(root, 'src')).filter((f) => f.endsWith('.js')).map((f) => `src/${f}`), ...readdirSync(resolve(root, 'public/runtime')).map((f) => `public/runtime/${f}`)]) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${file}: ${result.stderr}`);
}
for (const file of readdirSync(resolve(root, 'public/design-assets')).filter((f) => f.endsWith('.bin'))) {
  const bytes = readFileSync(resolve(root, 'public/design-assets', file));
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
}
console.log('Source syntax, assets, navigation, studio content and character models verified.');
