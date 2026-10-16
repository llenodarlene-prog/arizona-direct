const plain = text => String(text || '').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`>]/g,'').replace(/\s+/g,' ').trim();

function faqEntries(body='') {
  const section=body.split(/^## /m).find(part=>/^Frequently Asked Questions\b/i.test(part));
  if(!section) return [];
  return section.split(/^### /m).slice(1).map(block=>{
    const [q,...rest]=block.split('\n');
    return {question:plain(q),answer:plain(rest.join(' '))};
  }).filter(x=>x.question&&x.answer);
}

export function schemaGraph({site,doc,url,canonical,category}) {
  const pageId=`${canonical}#webpage`;
  const orgId=`${site.url||canonical}#organization`;
  const websiteId=`${site.url||canonical}#website`;
  const type=String(doc.meta.schema_type || (doc.file.startsWith('content/posts/')?'Article':'WebPage'));
  const graph=[
    {'@type':'Organization','@id':orgId,name:site.name,url:site.url||canonical},
    {'@type':'WebSite','@id':websiteId,url:site.url||canonical,name:site.name,publisher:{'@id':orgId}},
    {'@type':'WebPage','@id':pageId,url:canonical,name:String(doc.meta.title||site.name),isPartOf:{'@id':websiteId},about:category?{'@type':'Thing',name:category}:undefined},
    {'@type':'BreadcrumbList','@id':`${canonical}#breadcrumb`,itemListElement:[
      {'@type':'ListItem',position:1,name:site.name,item:site.url||'/'},
      ...(doc.meta.title?[{'@type':'ListItem',position:2,name:String(doc.meta.title),item:canonical}]:[])
    ]}
  ];
  if (doc.file.startsWith('content/posts/')) {
    graph.push({
      '@type':type,
      '@id':`${canonical}#article`,
      headline:String(doc.meta.title||''),
      mainEntityOfPage:{'@id':pageId},
      publisher:{'@id':orgId},
      datePublished:doc.meta.published||undefined,
      dateModified:doc.meta.modified||doc.meta.published||undefined,
      articleSection:category||undefined,
      about:Array.isArray(doc.meta.about)?doc.meta.about.map(name=>({'@type':'Thing',name})):undefined
    });
  } else if (type!=='WebPage') {
    graph.push({'@type':type,'@id':`${canonical}#main-entity`,name:String(doc.meta.title||site.name),url:canonical});
  }
  const faq=faqEntries(doc.body);
  if (faq.length) graph.push({'@type':'FAQPage','@id':`${canonical}#faq`,mainEntity:faq.map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))});
  return {'@context':'https://schema.org','@graph':graph.map(x=>Object.fromEntries(Object.entries(x).filter(([,v])=>v!==undefined)))};
}

export function categorySchema({site,base,category,slug,posts}) {
  const orgId=`${base}/#organization`; const websiteId=`${base}/#website`; const url=`${base}${slug}`;
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':orgId,name:site.name,url:`${base}/`},
    {'@type':'WebSite','@id':websiteId,name:site.name,url:`${base}/`,publisher:{'@id':orgId}},
    {'@type':'CollectionPage','@id':`${url}#webpage`,name:category,url,isPartOf:{'@id':websiteId},mainEntity:{'@id':`${url}#itemlist`}},
    {'@type':'ItemList','@id':`${url}#itemlist`,name:`${category} coverage`,itemListElement:posts.map((post,index)=>({'@type':'ListItem',position:index+1,name:String(post.meta.title||''),url:`${base}${slugOfSafe(post)}`}))}
  ]};
}

function slugOfSafe(doc){const s=String(doc.meta.slug||doc.meta.id||'').replace(/^\/+|\/+$/g,'');return s?`/${s}/`:'/';}
