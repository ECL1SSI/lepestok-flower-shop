import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('../..'),url=process.env.SITE_URL||'https://lepestok-flower-boutique.ambergull5.chatgpt.site';
const fixture=JSON.parse(fs.readFileSync(path.join(root,'tools/screenshots/fixtures.json'),'utf8'));
const output=path.join(root,'docs/screenshots');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch();
async function create(width,height){const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,locale:'ru-RU',reducedMotion:'reduce'});let actor=null;
await context.route('**/api/**',async route=>{const request=route.request(),endpoint=new URL(request.url()).pathname.replace('/api/','');let result,status=200;
if(endpoint==='store')result={settings:fixture.settings,products:fixture.products,user:actor};
else if(endpoint==='auth/login'){const input=request.postDataJSON();actor=input.email==='admin@flower.test'?fixture.admin:fixture.user;result={user:actor};}
else if(endpoint==='auth/logout'){actor=null;result={ok:true};}
else if(endpoint==='orders')result=fixture.orders;
else if(endpoint==='admin/data')result={...fixture,clients:[fixture.user],coupons:[fixture.coupon]};
else if(endpoint==='quote'){const b=request.postDataJSON();const items=b.items.map(line=>{const p=fixture.products.find(p=>p.id===line.productId),s=p.sizes.find(s=>s.name===line.size);return {name:p.name,price:s.price,qty:line.qty,addons:[],lineTotal:s.price*line.qty}});const subtotal=items.reduce((n,l)=>n+l.lineTotal,0),delivery=b.method==='pickup'?0:fixture.settings.delivery;result={items,subtotal,discount:0,delivery,total:subtotal+delivery};}
else {status=400;result={error:'Действие не используется для скриншотов'};}
await route.fulfill({status,contentType:'application/json',body:JSON.stringify(result)});
});
return {context,page:await context.newPage()};}
async function ready(page){await page.locator('.header').waitFor();await page.evaluate(()=>document.fonts.ready);await page.evaluate(async()=>{const images=Array.from(document.images);images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))});}
async function shot(page,name,fullPage=false){await ready(page);await page.screenshot({path:path.join(output,name+'.png'),fullPage});console.log('Captured '+name);}
try{
 const {context,page}=await create(1440,1000);await page.goto(url,{waitUntil:'domcontentloaded'});await shot(page,'home-desktop');
 await page.getByRole('button',{name:'Выбрать букет',exact:true}).first().click();await page.locator('.catalog').waitFor();await shot(page,'catalog');
 await page.getByRole('button',{name:'Подробнее о букете Тихое утро',exact:true}).click();await page.locator('.product-modal').waitFor();await shot(page,'product');
 await page.getByRole('button',{name:'Закрыть карточку',exact:true}).click();await page.getByRole('button',{name:'Добавить в корзину',exact:true}).first().click();await page.getByRole('button',{name:'Корзина',exact:true}).click();await page.locator('.cart-summary .total').waitFor();await shot(page,'cart');
 await page.locator('.header').getByRole('button',{name:'Личный кабинет',exact:true}).click();await page.locator('.auth-form').waitFor();await shot(page,'login');
 await page.locator('input[name=email]').fill('admin@flower.test');await page.locator('input[name=password]').fill('AdminDemo!2026');await page.getByRole('button',{name:'Войти',exact:true}).click();await page.locator('.metrics').waitFor();await shot(page,'admin');await context.close();
 const mobile=await create(390,844);await mobile.page.goto(url,{waitUntil:'domcontentloaded'});await shot(mobile.page,'home-mobile');await mobile.context.close();
 const images=[['Главная','home-desktop'],['Каталог','catalog'],['Карточка букета','product'],['Корзина','cart'],['Вход','login'],['Панель администратора','admin'],['На телефоне','home-mobile']];
 const readme=path.join(root,'README.md');let text=fs.readFileSync(readme,'utf8');const gallery=images.map(([title,file],index)=>`<details${index===0?' open':''}>\n<summary>${title}</summary>\n\n![${title}](docs/screenshots/${file}.png)\n\n</details>`).join('\n\n');
 text=text.replace(/<!-- SCREENSHOTS:START -->[\s\S]*?<!-- SCREENSHOTS:END -->/,'<!-- SCREENSHOTS:START -->\n'+gallery+'\n<!-- SCREENSHOTS:END -->');text=text.replace(/Сейчас включён сохранённый реальный скриншот[\s\S]*?Workflow ещё не запускался\./,'Галерея автоматически снята с настоящего интерфейса приложения. Для снимков используются фиксированные демонстрационные данные; реальные заказы и персональные данные клиентов не затрагиваются. Это визуальная документация, а не тест серверной авторизации.');fs.writeFileSync(readme,text);
}finally{await browser.close()}
