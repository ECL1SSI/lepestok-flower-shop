import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Лепесток — цветы, которые говорят за вас',description:'Авторские букеты, выбор размера и упаковки. Демонстрационный интернет-магазин цветов в Минске.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
