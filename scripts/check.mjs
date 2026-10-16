import { access, readFile } from 'node:fs/promises';
for(const f of ['dist/index.html','dist/404.html','dist/robots.txt','dist/sitemap.xml','dist/build-manifest.json']) await access(f);
const html=await readFile('dist/index.html','utf8');
if(!html.includes('Arizona Direct')) throw new Error('brand missing from build');
const manifest=JSON.parse(await readFile('dist/build-manifest.json','utf8'));
if(manifest.environment==='staging'&&manifest.indexable) throw new Error('staging must not be indexable');
console.log('Repository checks passed.');
