import Storefront from '../../components/storefront';
import { headers } from 'next/headers';
import { env } from 'cloudflare:workers';
import { handle } from '../../lib/server';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;const title=slug[0]==='catalog'?'Каталог букетов':slug[0]==='login'?'Вход в аккаунт':slug[0]==='admin'?'Управление магазином':slug[0]==='account'?'Личный кабинет':slug[0]==='cart'?'Корзина':'Цветы, которые говорят за вас';return {title:title+' — Лепесток',robots:slug[0]==='admin'||slug[0]==='account'?{index:false,follow:false}:undefined};}
export default async function Page({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;if(slug[0]==='admin'){const h=await headers();const response=await handle(new Request('https://store.local/api/admin/data',{headers:{cookie:h.get('cookie')||''}}),env as any);if(!response.ok)return <Storefront denied={response.status===401?'Войдите в аккаунт администратора':'Доступ только для администратора'}/>;}return <Storefront/>;}
