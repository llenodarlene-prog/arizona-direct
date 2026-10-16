import { readdir, readFile } from 'node:fs/promises';
const mode=process.argv[2]||'list';
const today=process.env.PUBLISH_DATE||new Date().toISOString().slice(0,10);
let files=[]; try{files=(await readdir('content/posts')).filter(x=>x.endsWith('.md'));}catch{}
const due=[];
for(const file of files){const text=await readFile(`content/posts/${file}`,'utf8'); const m=text.match(/^published:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/m); const draft=/^draft:\s*true\s*$/mi.test(text); if(m&&!draft&&m[1]===today) due.push(file);}
if(mode==='due'){console.log(`due=${due.length>0?'true':'false'}`); console.log(`count=${due.length}`);} else console.log(due.join('\n'));
