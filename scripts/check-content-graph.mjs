import { readFile } from 'node:fs/promises';
import { readDocuments, slugOf, isPublished, isPost } from './lib/content.mjs';
const policy=JSON.parse(await readFile('data/interlinking.json','utf8'));
const docs=(await readDocuments()).filter(isPublished);
const posts=docs.filter(isPost);
const bySlug=new Map(docs.map(d=>[slugOf(d),d]));
const inbound=new Map(docs.map(d=>[slugOf(d),0]));
for (const doc of docs) {
  for (const href of doc.links.filter(x=>x.startsWith('/'))) {
    const path=href.split('#')[0].split('?')[0].replace(/\/$/,'')+'/';
    if (bySlug.has(path)) inbound.set(path,(inbound.get(path)||0)+1);
  }
}
const errors=[];
for (const post of posts) {
  const slug=slugOf(post);
  if (policy.require_category_for_published_posts && !post.meta.category) errors.push(`${post.file}: published post requires category`);
  const contextual=post.links.filter(x=>x.startsWith('/')).length;
  if (posts.length>=policy.enforce_minimum_when_published_post_count_reaches && contextual<policy.minimum_contextual_internal_links) errors.push(`${post.file}: requires at least ${policy.minimum_contextual_internal_links} contextual internal links`);
  const categoryInbound=Boolean(post.meta.category);
  if (policy.orphan_policy==='fail' && !categoryInbound && (inbound.get(slug)||0)===0) errors.push(`${post.file}: orphaned published post`);
}
if(errors.length) throw new Error(errors.join('\n'));
console.log(`Content graph passed: ${posts.length} published posts, no orphan violations.`);
