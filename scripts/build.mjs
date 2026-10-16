import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { readDocuments, slugOf, isPublished, isPost } from './lib/content.mjs';
import { schemaGraph, categorySchema } from './lib/schema.mjs';

const site=JSON.parse(await readFile('data/site.json','utf8'));
const affiliate=JSON.parse(await readFile('data/affiliate.json','utf8'));
const env=process.env.BUILD_ENV||'development';
const configured=String(process.env.SITE_URL||site.url||'').replace(/\/$/,'');
const fallback=env==='staging'?'https://staging.invalid':'https://arizona-direct.invalid';
const base=configured||fallback;
const indexable=env==='production';
const robots=indexable?'index,follow':'noindex,nofollow,noarchive';
const docs=(await readDocuments()).filter(isPublished);
const merchants=affiliate.merchants.map(m=>String(m.domain||'').toLowerCase()).filter(Boolean);

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isAffiliate=url=>{
  try { const h=new URL(url).hostname.toLowerCase().replace(/^www\./,''); return merchants.some(d=>h===d||h.endsWith('.'+d)); } catch { return false; }
};
function renderMarkdown(body){
  return body.split(/\n{2,}/).map(block=>{
    const line=block.trim(); if(!line)return '';
    if(line.startsWith('# ')) return `<h1>${esc(line.slice(2))}</h1>`;
    if(line.startsWith('## ')) return `<h2>${esc(line.slice(3))}</h2>`;
    let html=esc(line).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,href)=>{
      const rel=isAffiliate(href)?` rel="${affiliate.default_rel.join(' ')}"`:'';
      return `<a href="${esc(href)}"${rel}>${label}</a>`;
    });
    return `<p>${html.replace(/\n/g,' ')}</p>`;
  }).join('\n');
}
async function emit(path,html){await mkdir(dirname(path),{recursive:true}); await writeFile(path,html);}

await mkdir('dist',{recursive:true});
const categories=new Map();
for(const doc of docs){
  const slug=slugOf(doc); const canonical=`${base}${slug}`;
  const category=doc.meta.category?String(doc.meta.category):'';
  if(isPost(doc)&&category){if(!categories.has(category))categories.set(category,[]);categories.get(category).push(doc);}
  const disclosure=(doc.meta.affiliate===true)?`<aside><p>Disclosure: This page may contain affiliate links. <a href="${affiliate.disclosure_path}">Learn more</a>.</p></aside>`:'';
  const graph=schemaGraph({site:{...site,url:base},doc,url:slug,canonical,category});
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(doc.meta.title||site.name)} | ${esc(site.name)}</title><meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}"><script type="application/ld+json">${JSON.stringify(graph)}</script></head><body><main>${disclosure}${renderMarkdown(doc.body)}</main></body></html>`;
  await emit(`dist${slug}index.html`,html);
}
for(const [category,posts] of categories){
  const slug=`/categories/${category.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}/`;
  const links=posts.map(p=>`<li><a href="${slugOf(p)}">${esc(p.meta.title)}</a></li>`).join('');
  const graph=categorySchema({site,base,category,slug,posts});
  await emit(`dist${slug}index.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(category)} | ${esc(site.name)}</title><meta name="robots" content="${robots}"><link rel="canonical" href="${base}${slug}"><script type="application/ld+json">${JSON.stringify(graph)}</script></head><body><main><h1>${esc(category)}</h1><ul>${links}</ul></main></body></html>`);
}
const homePosts=docs.filter(isPost).map(p=>`<li><a href="${slugOf(p)}">${esc(p.meta.title)}</a></li>`).join('');
const homeGraph={'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':`${base}/#organization`,name:site.name,url:`${base}/`},{'@type':'WebSite','@id':`${base}/#website`,url:`${base}/`,name:site.name,publisher:{'@id':`${base}/#organization`}},{'@type':'WebPage','@id':`${base}/#webpage`,url:`${base}/`,name:site.name,isPartOf:{'@id':`${base}/#website`}}]};
await writeFile('dist/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(site.name)}</title><meta name="description" content="${esc(site.description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${base}/"><script type="application/ld+json">${JSON.stringify(homeGraph)}</script></head><body><main><h1>${esc(site.name)}</h1><p>${esc(site.tagline)}</p><ul>${homePosts}</ul></main></body></html>`);
await writeFile('dist/404.html','<!doctype html><title>Not Found</title><h1>404</h1>');
await writeFile('dist/robots.txt',indexable?'User-agent: *\nAllow: /\n':'User-agent: *\nDisallow: /\n');
const urls=['/',...docs.map(slugOf),...[...categories.keys()].map(c=>`/categories/${c.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}/`)];
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/build-manifest.json',JSON.stringify({site:site.name,environment:env,indexable,base,documents:docs.length,categories:categories.size},null,2));
console.log(`Built ${site.name} (${env}; indexable=${indexable}; docs=${docs.length})`);
