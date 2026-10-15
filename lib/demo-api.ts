// Educational, browser-only adapter. This module is excluded from the Worker client build.
// No network requests, real credentials, payment, uploaded files or personal input.
import {products,settings,coupon} from './seed';
import fixture from '../tools/screenshots/fixtures.json';
const key='lepestok_educational_v2';
const copy=(v:any)=>JSON.parse(JSON.stringify(v));
const initial=()=>({version:2,products:copy(products),settings:copy(settings),orders:copy(fixture.orders),inquiries:[] as any[],coupons:[copy(coupon)]});
let state=initial();
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===2&&Array.isArray(saved.products)&&Array.isArray(saved.orders)&&Array.isArray(saved.inquiries)&&saved.settings)state=saved}catch{}
let role:string|null=sessionStorage.getItem('lepestok_demo_role');
const actor=()=>role==='admin'?copy(fixture.admin):role==='customer'?copy(fixture.user):null;
const persist=()=>localStorage.setItem(key,JSON.stringify(state));
const mustAdmin=()=>{if(role!=='admin')throw Error('Выберите учебную роль администратора')};
function quote(input:any){
 if(!input.items?.length)throw Error('Добавьте учебный букет в корзину');
 const items=input.items.map((line:any)=>{const p=state.products.find((p:any)=>p.id===line.productId);if(!p?.visible||!p.available)throw Error('Букет недоступен. Обновите корзину.');const size=p.sizes.find((s:any)=>s.name===line.size);if(!size)throw Error('Размер недоступен');const qty=Math.max(1,Math.min(20,Number(line.qty)||1));const addons=(line.addons||[]).map((id:string)=>state.settings.addons.find((a:any)=>a.id===id&&a.available)).filter(Boolean);return {productId:p.id,name:p.name,image:p.image,size:size.name,composition:size.composition,packaging:line.packaging,price:size.price,qty,addons,lineTotal:(size.price+addons.reduce((n:number,a:any)=>n+a.price,0))*qty}});
 const subtotal=items.reduce((n:number,i:any)=>n+i.lineTotal,0),code=String(input.code||'').toUpperCase();let discount=0;
 if(code){const c=state.coupons.find((c:any)=>c.code===code&&c.active);if(!c)throw Error('Учебный промокод не найден');if(c.expires<new Date().toISOString().slice(0,10))throw Error('Срок учебного промокода истёк');if(subtotal<c.min)throw Error('Минимальная сумма: '+c.min+' '+state.settings.currency);discount=Math.round(subtotal*c.percent)/100;}
 const delivery=input.method==='pickup'?0:state.settings.delivery;return {items,subtotal,discount,delivery,total:Math.round((subtotal-discount+delivery)*100)/100,currency:state.settings.currency,code};
}
export async function demoApi(path:string,method:string,data:any={}){
 let result:any;
 if(path==='store')return copy({settings:{...state.settings,demo:true},products:state.products.filter((p:any)=>p.visible),user:actor()});
 if(path==='auth/login'){if(!['customer','admin'].includes(data.demoRole))throw Error('Для учебного входа используйте кнопки выбора роли');role=data.demoRole;sessionStorage.setItem('lepestok_demo_role',role!);return {user:actor()}}
 if(path==='auth/logout'){role=null;sessionStorage.removeItem('lepestok_demo_role');return {ok:true}}
 if(path==='auth/register')throw Error('Регистрация и сбор персональных данных в учебной версии отключены');
 if(path==='profile'){if(!actor())throw Error('Выберите учебную роль');return actor()}
 if(path==='favorites'){const u=role==='admin'?fixture.admin:fixture.user;const favorites=(u as any).favorites as string[];const i=favorites.indexOf(data.id);if(i>=0)favorites.splice(i,1);else favorites.push(data.id);return {favorites:copy(favorites)}}
 if(path==='quote')return copy(quote(data));
 if(path==='orders'){
  if(method==='GET')return copy(state.orders.filter((o:any)=>o.userId===actor()?.id));
  const q=quote(data);result={...copy(fixture.orders[0]),...q,id:'EDU-'+crypto.randomUUID().slice(0,8),userId:actor()?.id||null,created:new Date().toISOString(),status:'Новый',payment:'Не оплачен',buyer:{name:'Учебный покупатель',phone:'+375 29 000 00 00',email:'user@flower.test'},recipient:'Учебный получатель',recipientPhone:'+375 29 000 00 00',address:'Вымышленный адрес — учебная демонстрация',date:new Date().toISOString().slice(0,10),card:'Учебная открытка',comment:'Ничего не отправлено реальному магазину',demo:true};state.orders.unshift(result);
 }else if(path==='inquiries'){
  if(!['subscription','certificate','custom'].includes(data.kind))throw Error('Выберите тип учебной заявки');
  result={id:'REQ-'+crypto.randomUUID(),kind:data.kind,name:'Учебный покупатель',phone:'+375 29 000 00 00',budget:Math.max(1,Math.min(1000000,Number(data.budget)||150)),currency:state.settings.currency,frequency:data.kind==='subscription'?String(data.frequency||'Раз в неделю'):'',wishes:'Вымышленная заявка для изучения интерфейса',status:'Новая',created:new Date().toISOString(),demo:true};state.inquiries.unshift(result);
 }else if(path.startsWith('admin')){
  mustAdmin();
  if(path==='admin/data')return copy({...state,clients:[fixture.user]});
  if(path==='admin/products'&&method==='POST'){result={...data,id:data.id||'product-'+crypto.randomUUID(),name:data.name||'Учебный новый букет',sizes:data.sizes.map((s:any)=>({...s,composition:s.composition||'Учебная композиция',price:Number(s.price)})),demo:true};state.products=state.products.filter((p:any)=>p.id!==result.id);state.products.push(result)}
  else if(path.startsWith('admin/products/')&&method==='DELETE'){state.products=state.products.filter((p:any)=>p.id!==path.split('/')[2]);result={ok:true}}
  else if(path.startsWith('admin/orders/')){const o=state.orders.find((o:any)=>o.id===path.split('/')[2]);if(!o)throw Error('Учебный заказ не найден');Object.assign(o,{status:data.status,payment:data.payment});result=o}
  else if(path.startsWith('admin/inquiries/')){const a=state.inquiries.find((a:any)=>a.id===path.split('/')[2]);if(!a)throw Error('Учебная заявка не найдена');a.status=data.status;result=a}
  else if(path==='admin/settings'){state.settings=copy(data);result=state.settings}
  else if(path==='admin/coupons'){result={...data,code:data.code||'DEMO10',id:data.code||'DEMO10',percent:Number(data.percent),min:Number(data.min)};state.coupons=state.coupons.filter((c:any)=>c.code!==result.code);state.coupons.push(result)}
  else throw Error('В учебной версии загрузка файлов и внешние интеграции отключены');
 }else throw Error('Этот сценарий не включён в учебную демонстрацию');
 persist();return copy(result);
}
