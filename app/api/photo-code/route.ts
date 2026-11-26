import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export const runtime="nodejs";
function reply(body:object,status=200){return NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});}
export async function POST(req:Request){
  try{
    const {code}=await req.json();
    const expected=process.env.GIFT_FIXED_CODE;
    if(!expected)return reply({ok:false,error:"Le code n’est pas configuré. Tu peux passer le jeu."},503);
    if(typeof code!=="string"||!/^\d{4}$/.test(code))return reply({ok:false,error:"Entre quatre chiffres."},400);
    const a=Buffer.from(code),b=Buffer.from(expected);
    const ok=a.length===b.length&&timingSafeEqual(a,b);
    return ok?reply({ok:true}):reply({ok:false,error:"Code incorrect. Réessaie."},401);
  }catch{return reply({ok:false,error:"Demande invalide."},400);}
}
