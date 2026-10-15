import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 root:'demo',base:'/lepestok-flower-shop/',publicDir:'../public',
 plugins:[react()],define:{__STATIC_DEMO__:'true',__DEMO_BASE__:JSON.stringify('/lepestok-flower-shop/')},
 build:{outDir:'../dist-demo',emptyOutDir:true},
});
