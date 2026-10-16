import { readFile } from 'node:fs/promises';
const site=JSON.parse(await readFile('data/site.json','utf8'));
if(site.launch_status!=='ready') throw new Error('Production blocked: data/site.json launch_status must be "ready"');
const url=String(process.env.SITE_URL||site.url||'');
if(!/^https:\/\//.test(url)) throw new Error('Production blocked: SITE_URL must be configured with HTTPS');
console.log('Production release gate passed.');
