declare const __STATIC_DEMO__: boolean;
declare const __DEMO_BASE__: string;
export const STATIC_DEMO=typeof __STATIC_DEMO__!=='undefined'&&__STATIC_DEMO__;
export const DEMO_BASE=typeof __DEMO_BASE__!=='undefined'?__DEMO_BASE__:'/';
export function asset(src:string){return STATIC_DEMO&&src?.startsWith('/images/')?DEMO_BASE+src.slice(1):src}
export async function api(path:string,method='GET',data?:any):Promise<any>{
 if(STATIC_DEMO){const {demoApi}=await import('./demo-api');return demoApi(path,method,data)}
 const r=await fetch('/api/'+path,{method,headers:data instanceof FormData?undefined:{'Content-Type':'application/json'},body:data?data instanceof FormData?data:JSON.stringify(data):undefined});
 const v:any=await r.json();if(!r.ok)throw new Error(v.error||'Не удалось выполнить действие');return v;
}
