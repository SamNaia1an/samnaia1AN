import { randomBytes, randomInt, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const createScript = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], 600) end
if n > 15 then return 0 end
redis.call('HSET', KEYS[2], 'status', 'pending')
redis.call('EXPIRE', KEYS[2], 3600)
return 1`;
const issueScript = `
local status = redis.call('HGET', KEYS[1], 'status')
if not status or status == 'used' then return 0 end
if redis.call('HGET', KEYS[1], 'digest') == ARGV[1] then return 2 end
redis.call('HSET', KEYS[1], 'status', 'ready', 'digest', ARGV[1], 'attempts', 0, 'expires', ARGV[2])
redis.call('EXPIRE', KEYS[1], 3600)
return 1`;
const verifyScript = `
if redis.call('HGET', KEYS[1], 'status') ~= 'ready' then return 0 end
if tonumber(redis.call('HGET', KEYS[1], 'expires') or '0') < tonumber(ARGV[2]) then return 0 end
if tonumber(redis.call('HGET', KEYS[1], 'attempts') or '0') >= 5 then return -1 end
if redis.call('HGET', KEYS[1], 'digest') ~= ARGV[1] then
  local n = redis.call('HINCRBY', KEYS[1], 'attempts', 1)
  if n >= 5 then return -1 end
  return 0
end
redis.call('HSET', KEYS[1], 'status', 'used')
redis.call('HDEL', KEYS[1], 'digest', 'attempts', 'expires')
return 1`;
async function redis(...command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis not configured");
  const res = await fetch(url, {method: "POST", cache: "no-store", headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"}, body: JSON.stringify(command)});
  const data = await res.json();
  if (!res.ok || data.error) throw new Error("Redis unavailable");
  return data.result;
}
function reply(data: object, status = 200) {
  return NextResponse.json(data, {status, headers: {"Cache-Control":"no-store"}});
}
function digest(secret: string, value: string) {
  return createHmac("sha256", secret).update("gift-v1:" + value).digest("hex");
}
function same(a: string,b: string) {
  const x=Buffer.from(a), y=Buffer.from(b);
  return x.length===y.length && timingSafeEqual(x,y);
}
export async function POST(req: Request) {
  try {
    const secret = process.env.PHOTO_ADMIN_KEY || process.env.SAM_OWNER_KEY;
    if (!secret || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return reply({error:"Le jeu du code n’est pas encore configuré. Tu peux continuer sans code."},503);
    const body=await req.json();
    const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipKey=digest(secret,"ip:"+ip);
    if(body.action==="create"){
      const id=randomBytes(12).toString("hex");
      const result=await redis("EVAL",createScript,2,"gift:limit:"+ipKey,"gift:request:"+id);
      if(result!==1)return reply({error:"Trop de demandes. Réessaie dans quelques minutes."},429);
      return reply({id});
    }
    const id=typeof body.id==="string"?body.id.trim().toLowerCase():"";
    if(!/^[a-f0-9]{24}$/.test(id))return reply({error:"Référence invalide."},400);
    const key="gift:request:"+id;
    if(body.action==="issue"){
      const admin=typeof body.adminKey==="string"?body.adminKey:"";
      if(!same(admin,secret))return reply({error:"Accès refusé."},403);
      for(let i=0;i<5;i++){
        const code=String(randomInt(1000,10000));
        const result=await redis("EVAL",issueScript,1,key,digest(secret,id+":"+code),Math.floor(Date.now()/1000)+600);
        if(result===1)return reply({code});
        if(result===0)return reply({error:"Demande expirée ou déjà utilisée."},404);
      }
      return reply({error:"Réessaie la génération."},503);
    }
    if(body.action==="verify"){
      const code=typeof body.code==="string"?body.code:"";
      if(!/^\d{4}$/.test(code))return reply({error:"Entre exactement quatre chiffres."},400);
      const result=await redis("EVAL",verifyScript,1,key,digest(secret,id+":"+code),Math.floor(Date.now()/1000));
      if(result===1)return reply({ok:true});
      return reply({error:result===-1?"Cinq essais : demande un nouveau code.":"Code incorrect, expiré ou déjà utilisé."},400);
    }
    return reply({error:"Action inconnue."},400);
  }catch{return reply({error:"Service indisponible. Tu peux continuer sans code."},503);}
}
