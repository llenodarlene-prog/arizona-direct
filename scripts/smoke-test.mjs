import { readFile } from 'node:fs/promises';
const base=String(process.env.SMOKE_URL||'').replace(/\/$/,'');
if(!/^https:\/\//.test(base)) throw new Error('SMOKE_URL must be HTTPS');
const site=JSON.parse(await readFile('data/site.json','utf8'));
const expectedBrand=String(process.env.SMOKE_BRAND||site.name);
const expectedRobots=String(process.env.SMOKE_EXPECT_ROBOTS||'noindex');
const canonicalBase=String(process.env.SMOKE_CANONICAL_URL||site.url||base).replace(/\/$/,'');
if(expectedRobots==='noindex'&&base===canonicalBase) throw new Error('refusing a noindex smoke test against the production domain');
const bust=(url,n=1)=>`${url}${url.includes('?')?'&':'?'}smoke=${Date.now()}-${n}`;
let home;
for(let attempt=1;attempt<=5;attempt++){
  home=await fetch(bust(`${base}/`,attempt),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});
  if(home.ok) break;
  if(attempt<5) await new Promise(r=>setTimeout(r,attempt*4000));
}
if(!home?.ok) throw new Error(`/: HTTP ${home?.status||'unknown'} after 5 attempts`);
const html=await home.text();
if(expectedBrand&&!html.includes(expectedBrand)) throw new Error('/: expected brand name not found');
if(!html.includes(`<link rel="canonical" href="${canonicalBase}/">`)) throw new Error('/: canonical mismatch');
if(!html.includes(`<meta name="robots" content="${expectedRobots}`)) throw new Error(`/: expected ${expectedRobots} robots directive`);
for(const route of ['/robots.txt','/sitemap.xml']){
 const response=await fetch(bust(`${base}${route}`),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});
 if(!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
 const txt=await response.text(); if(route==='/sitemap.xml'&&!txt.includes('<urlset')) throw new Error('/sitemap.xml: not a sitemap');
}
console.log(`Smoke test passed for ${base}`);
