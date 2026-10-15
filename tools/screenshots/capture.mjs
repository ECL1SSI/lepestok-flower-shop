import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('../..'),url=process.env.SITE_URL||'http://127.0.0.1:4173/lepestok-flower-shop/';
const output=path.join(root,'docs/screenshots');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),mutations=[],errors=[];
async function context(width,height){const c=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,locale:'ru-RU',reducedMotion:'reduce'});c.on('request',r=>{if(!['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname.startsWith('/api/'))mutations.push(r.method()+' '+r.url())});c.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(url).origin)errors.push(r.status()+' '+r.url())});return {context:c,page:await c.newPage()}}
async function ready(p){await p.locator('.header').waitFor();await p.evaluate(()=>document.fonts.ready);await p.evaluate(async()=>{const images=[...document.images];images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))})}
async function shot(p,name){await ready(p);await p.screenshot({path:path.join(output,name+'.png')});console.log('Captured '+name)}
try{
 const {context:c,page:p}=await context(1440,1000);await p.goto(url,{waitUntil:'domcontentloaded'});await shot(p,'home-desktop');
 assert.match(await p.locator('.demo-banner').innerText(),/Учебная/);
 await p.getByRole('button',{name:'Выбрать букет',exact:true}).click();await p.locator('.catalog').waitFor();
 await p.getByRole('textbox',{name:'Поиск букетов по названию и составу'}).fill('несуществующий букет');await p.getByRole('heading',{name:'Букеты не найдены'}).waitFor();
 await p.getByRole('textbox',{name:'Поиск букетов по названию и составу'}).fill('');await shot(p,'catalog');
 await p.getByRole('button',{name:'Подробнее о букете Тихое утро',exact:true}).click();await p.locator('.product-modal').waitFor();
 await p.locator('.size-options button').first().click();assert.match(await p.locator('.detail-composition').innerText(),/7 роз/);assert.match(await p.locator('.detail-buy strong').innerText(),/95/);await shot(p,'product');
 await p.locator('.detail-buy').getByRole('button',{name:'В корзину',exact:true}).click();await p.getByRole('button',{name:'Закрыть карточку',exact:true}).click();
 await p.locator('.header').getByRole('button',{name:'Корзина',exact:true}).click();await p.locator('.cart-summary .total').waitFor();await shot(p,'cart');
 // Reload proves cart persistence at the repository base path.
 await p.reload();await p.locator('.cart-line').waitFor();assert.equal(await p.locator('.cart-line').count(),1);
 await p.locator('.header').getByRole('button',{name:'Личный кабинет',exact:true}).click();await p.locator('.auth-form').waitFor();await shot(p,'login');
 await p.getByRole('button',{name:'Показать кабинет покупателя',exact:true}).click();await p.getByRole('heading',{name:'Ваши заказы',exact:true}).waitFor();await shot(p,'account');
 await p.getByRole('button',{name:'Выйти',exact:true}).click();await p.getByRole('button',{name:'Показать панель администратора',exact:true}).click();await p.locator('.metrics').waitFor();await shot(p,'admin');
 await p.locator('.header').getByRole('link',{name:'Цветочная подписка',exact:true}).click();await p.getByRole('button',{name:'Показать учебную заявку'}).click();await p.locator('.inquiry-success').waitFor();
 await p.locator('.header').getByRole('link',{name:'Цветочная подписка',exact:true}).click();await shot(p,'subscription');
 await p.locator('.header').getByRole('link',{name:'Сертификаты',exact:true}).click();assert.equal(await p.locator('.inquiry-content input[type=tel]').count(),0);
 await c.close();
 for(const width of [360,390,430]){const m=await context(width,844);await m.page.goto(url,{waitUntil:'domcontentloaded'});await ready(m.page);assert.ok(await m.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at '+width);if(width===390)await shot(m.page,'home-mobile');await m.context.close();console.log('Mobile '+width+'px: OK')}
 assert.deepEqual(mutations,[],'Static demo must not contact order/auth/admin API or send mutations');assert.deepEqual(errors,[],'All same-origin assets must load');
 const images=[['Главная','home-desktop'],['Каталог','catalog'],['Карточка букета','product'],['Корзина','cart'],['Учебный вход','login'],['Кабинет покупателя','account'],['Панель администратора','admin'],['Подписка','subscription'],['На телефоне','home-mobile']];
 const readme=path.join(root,'README.md');let text=fs.readFileSync(readme,'utf8');const gallery=images.map(([title,file],i)=>`<details${i===0?' open':''}>\n<summary>${title}</summary>\n\n![${title}](docs/screenshots/${file}.png)\n\n</details>`).join('\n\n');text=text.replace(/<!-- SCREENSHOTS:START -->[\s\S]*?<!-- SCREENSHOTS:END -->/,'<!-- SCREENSHOTS:START -->\n'+gallery+'\n<!-- SCREENSHOTS:END -->');fs.writeFileSync(readme,text);
 console.log('UI checks passed: search, size/price, cart persistence, both demo roles, subscription, mobile 360/390/430; zero API mutations.');
}finally{await browser.close()}
