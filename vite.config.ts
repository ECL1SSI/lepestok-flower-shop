import { defineConfig } from 'vite';
import vinext from 'vinext';
import { cloudflare } from '@cloudflare/vite-plugin';
export default defineConfig({
  define:{__STATIC_DEMO__:'false',__DEMO_BASE__:JSON.stringify('/')},
  plugins:[vinext(),cloudflare({configPath:'wrangler.json',viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false})],
  server:{host:'0.0.0.0'},
});
