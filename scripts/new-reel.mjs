#!/usr/bin/env node
/**
 * npm run new -- <slug> ["Title"]
 * Creates src/reels/<slug>/reel.ts from the template, the asset folders in
 * public/reels/<slug>/, and registers the reel in src/reels/index.ts.
 */
import fs from "node:fs";
import path from "node:path";

const [slug, title] = process.argv.slice(2);
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('Usage: npm run new -- <slug> ["Title"]   (slug: lowercase letters, digits, dashes)');
  process.exit(1);
}

const reelDir = path.resolve("src/reels", slug);
if (fs.existsSync(reelDir)) {
  console.error(`src/reels/${slug} already exists`);
  process.exit(1);
}

const template = fs.readFileSync("src/reels/_template/reel.ts", "utf8");
const body = template
  .replaceAll("__SLUG__", slug)
  .replace('id: "template"', `id: "${slug}"`)
  .replace(/title: ".*?"/, `title: ${JSON.stringify(title ?? slug)}`);
fs.mkdirSync(reelDir, { recursive: true });
fs.writeFileSync(path.join(reelDir, "reel.ts"), body);

for (const sub of ["video", "screens", "photos", "memes", "audio"]) {
  const d = path.resolve("public/reels", slug, sub);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, ".gitkeep"), "");
}

const indexPath = "src/reels/index.ts";
const ident = slug.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase()).replace(/^(\d)/, "_$1");
let index = fs.readFileSync(indexPath, "utf8");
index = index.replace(/(import styleDemo from .*\n)/, `$1import ${ident} from "./${slug}/reel";\n`);
index = index.replace(/(\/\/ ↓ new reels are inserted below this line\n)/, `$1  ${ident},\n`);
fs.writeFileSync(indexPath, index);

console.log(`Created reel "${slug}"
  spec:   src/reels/${slug}/reel.ts
  assets: public/reels/${slug}/{video,screens,photos,memes,audio}
Next: drop files into the asset folders, edit the spec, run "npm run dev".`);
