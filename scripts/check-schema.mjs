import { readFile } from 'node:fs/promises';
import { readDocuments, isPublished } from './lib/content.mjs';
const cfg=JSON.parse(await readFile('data/schema.json','utf8'));
const allowed=new Set(cfg.allowed_primary_types);
const errors=[];
for(const doc of (await readDocuments()).filter(isPublished)){
  const type=String(doc.meta.schema_type||(doc.file.startsWith('content/posts/')?'Article':'WebPage'));
  if(!allowed.has(type)) errors.push(`${doc.file}: unsupported schema_type ${type}`);
  if(doc.file.startsWith('content/posts/')&&!doc.meta.title) errors.push(`${doc.file}: title required for article schema`);
}
if(errors.length) throw new Error(errors.join('\n'));
console.log('Schema metadata checks passed.');
