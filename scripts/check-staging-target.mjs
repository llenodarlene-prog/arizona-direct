import { readFile } from 'node:fs/promises';
const staging=String(process.env.STAGING_URL||'').replace(/\/$/,'');
const production=String(process.env.PRODUCTION_URL||'').replace(/\/$/,'');
if(!/^https:\/\//.test(staging)) throw new Error('STAGING_URL must use HTTPS');
if(production&&staging===production) throw new Error('staging URL must differ from production URL');
const manifest=JSON.parse(await readFile('dist/build-manifest.json','utf8'));
if(manifest.environment!=='staging'||manifest.indexable!==false) throw new Error('staging build manifest is unsafe');
console.log('Staging target check passed.');
