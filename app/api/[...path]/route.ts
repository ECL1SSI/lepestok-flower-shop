import { env } from 'cloudflare:workers';
import { handle } from '../../../lib/server';
export const dynamic='force-dynamic';
const route=(req:Request)=>handle(req,env as any);
export { route as GET,route as POST,route as PATCH,route as DELETE };
