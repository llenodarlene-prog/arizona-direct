import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

function value(raw='') {
  const v=raw.trim();
  if (v==='true') return true;
  if (v==='false') return false;
  if (v==='null') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if ((v.startsWith('[')&&v.endsWith(']'))||(v.startsWith('{')&&v.endsWith('}'))) {
    try { return JSON.parse(v); } catch {}
  }
  return v.replace(/^["']|["']$/g,'');
}

export function parseDocument(text, file='') {
  let meta={}; let body=text;
  if (text.startsWith('---\n')) {
    const end=text.indexOf('\n---\n',4);
    if (end!==-1) {
      const front=text.slice(4,end);
      body=text.slice(end+5);
      for (const line of front.split('\n')) {
        if (!line.trim()||line.trim().startsWith('#')) continue;
        const i=line.indexOf(':');
        if (i<1) continue;
        meta[line.slice(0,i).trim()]=value(line.slice(i+1));
      }
    }
  }
  const links=[...body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1].trim());
  return {file,meta,body,links};
}

async function markdownFiles(dir) {
  try { return (await readdir(dir)).filter(f=>f.endsWith('.md')).map(f=>join(dir,f)); } catch { return []; }
}

export async function readDocuments() {
  const files=[...(await markdownFiles('content/pages')),...(await markdownFiles('content/posts'))];
  const docs=[];
  for (const file of files) docs.push(parseDocument(await readFile(file,'utf8'),file));
  return docs;
}

export function slugOf(doc) {
  const slug=String(doc.meta.slug||doc.meta.id||'').replace(/^\/+|\/+$/g,'');
  return slug ? `/${slug}/` : '/';
}

export function isPublished(doc) {
  return String(doc.meta.status||'draft').toLowerCase()==='published' && doc.meta.draft!==true;
}

export function isPost(doc) { return doc.file.startsWith('content/posts/'); }
