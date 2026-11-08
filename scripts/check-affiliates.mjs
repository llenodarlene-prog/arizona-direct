import { readFile } from 'node:fs/promises';
import { readDocuments, isPublished } from './lib/content.mjs';
const config=JSON.parse(await readFile('data/affiliate.json','utf8'));
const domains=new Set(config.merchants.map(m=>String(m.domain||'').toLowerCase()).filter(Boolean));
const docs=(await readDocuments()).filter(isPublished);
const errors=[]; let count=0;
for(const doc of docs){
  for(const href of doc.links){
    if(!/^https?:\/\//.test(href)) continue;
    const host=new URL(href).hostname.toLowerCase().replace(/^www\./,'');
    const merchant=[...domains].find(d=>host===d||host.endsWith('.'+d));
    if(merchant){ count++; if(!config.enabled) errors.push(`${doc.file}: affiliate link present while affiliates disabled`); }
  }
}
if(count>0){
  const disclosure=docs.find(d=>('/'+String(d.meta.slug||'').replace(/^\/+|\/+$/g,'')+'/')===config.disclosure_path);
  if(!disclosure) errors.push('Affiliate links require a published affiliate disclosure page');
}
if(errors.length) throw new Error(errors.join('\n'));
console.log(`Affiliate checks passed: ${count} registered affiliate links.`);
