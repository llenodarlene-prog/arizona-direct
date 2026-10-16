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
  return {'@context':'https://schema.org','@graph':graph.map(x=>Object.fromEntries(Object.entries(x).filter(([,v])=>v!==undefined)))};
}
