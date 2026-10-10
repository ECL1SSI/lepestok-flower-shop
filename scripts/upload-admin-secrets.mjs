import {spawnSync} from 'node:child_process';
if(process.env.DEMO_MODE!=='false'){console.log('Demo mode: no administrator secrets uploaded.');process.exit(0)}
const values={ADMIN_EMAIL:process.env.ADMIN_EMAIL,ADMIN_PASSWORD:process.env.ADMIN_PASSWORD};
const r=spawnSync('pnpm',['exec','wrangler','secret','bulk','--config','dist/server/wrangler.json'],{input:JSON.stringify(values),stdio:['pipe','inherit','inherit']});
if(r.error)throw r.error;process.exit(r.status??1);
