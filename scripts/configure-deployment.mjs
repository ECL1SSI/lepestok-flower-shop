import fs from 'node:fs';
const db=process.env.CLOUDFLARE_D1_DATABASE_ID,account=process.env.CLOUDFLARE_ACCOUNT_ID,bucket=process.env.CLOUDFLARE_R2_BUCKET;
if(!db||!account||!bucket)throw new Error('Set CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_R2_BUCKET in GitHub Actions secrets.');
if(!/^[a-f0-9-]{36}$/i.test(db)||db==='00000000-0000-4000-8000-000000000000')throw new Error('Provide the real D1 database UUID.');
const config=JSON.parse(fs.readFileSync('wrangler.json','utf8'));
config.account_id=account;config.d1_databases[0].database_id=db;config.r2_buckets[0].bucket_name=bucket;
config.vars.DEMO_MODE=process.env.DEMO_MODE==='false'?'false':'true';
if(config.vars.DEMO_MODE==='false'&&(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD||process.env.ADMIN_PASSWORD.length<14))throw new Error('Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 14 characters.');
fs.writeFileSync('wrangler.json',JSON.stringify(config,null,2)+'\n');
