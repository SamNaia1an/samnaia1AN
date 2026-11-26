import { randomBytes, randomInt, createHmac, timingSafeEqual } from "node:crypto";
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { NextResponse } from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type State={digest:string; expires:number; attempts:number; used:boolean; version:string};
function reply(data:object,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});}
function mac(secret:string,value:string){return createHmac("sha256",secret).update("gift-v2:"+value).digest("hex");}
function same(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function validReference(secret:string,id:string){
  const m=/^([a-f0-9]{24})\.([0-9]{10})\.([a-f0-9]{32})$/.exec(id);
  return !!m&&Number(m[2])>=Math.floor(Date.now()/1000)&&same(m[3],mac(secret,m[1]+"."+m[2]).slice(0,32));
}
async function read(path:string){
  const r=await get(path,{access:"private",useCache:false});
  if(!r||r.statusCode!==200)return null;
  return {state:await new Response(r.stream).json() as State,etag:r.blob.etag};
}
async function write(path:string,state:State,etag?:string){
  await put(path,JSON.stringify(state),{access:"private",addRandomSuffix:false,allowOverwrite:!!etag,...(etag?{ifMatch:etag}:{}),contentType:"application/json"});
}
export async function POST(req:Request){
  try{
    const secret=process.env.PHOTO_ADMIN_KEY||process.env.SAM_OWNER_KEY;
    if(!secret||!process.env.BLOB_READ_WRITE_TOKEN)return reply({error:"Le jeu du code est indisponible. Tu peux continuer sans code."},503);
    const b=await req.json();
    if(b.action==="create"){
      const base=randomBytes(12).toString("hex")+"."+(Math.floor(Date.now()/1000)+3600);
      return reply({id:base+"."+mac(secret,base).slice(0,32)});
    }
    const id=typeof b.id==="string"?b.id.trim():"";
    if(!validReference(secret,id))return reply({error:"Demande invalide ou expirée. Crée une nouvelle demande."},400);
    const path="gift-codes/v2/"+id.split(".")[0]+".json";
    if(b.action==="issue"){
      if(typeof b.adminKey!=="string"||!same(b.adminKey,secret))return reply({error:"Accès refusé."},403);
      const previous=await read(path);
      if(previous?.state.used)return reply({error:"Cette demande a déjà été utilisée."},409);
      let code=String(randomInt(1000,10000));
      while(previous?.state.digest===mac(secret,id+":"+code))code=String(randomInt(1000,10000));
      const state:State={digest:mac(secret,id+":"+code),expires:Date.now()+600000,attempts:0,used:false,version:randomBytes(8).toString("hex")};
      try{await write(path,state,previous?.etag);}catch{return reply({error:"Demande modifiée ou stockage indisponible. Réessaie."},409);}
      return reply({code});
    }
    if(b.action==="verify"){
      const code=typeof b.code==="string"?b.code:"";
      if(!/^\d{4}$/.test(code))return reply({error:"Entre quatre chiffres."},400);
      for(let i=0;i<4;i++){
        const prev=await read(path);
        if(!prev||prev.state.used||prev.state.expires<Date.now())return reply({error:"Code non disponible, expiré ou déjà utilisé."},400);
        if(prev.state.attempts>=5)return reply({error:"Cinq essais : demande un nouveau code."},429);
        const ok=same(prev.state.digest,mac(secret,id+":"+code));
        const next={...prev.state,attempts:prev.state.attempts+1,used:ok,version:randomBytes(8).toString("hex")};
        try{await write(path,next,prev.etag);}catch(e){if(e instanceof BlobPreconditionFailedError)continue;throw e;}
        return ok?reply({ok:true}):reply({error:"Code incorrect."},400);
      }
      return reply({error:"Réessaie."},409);
    }
    return reply({error:"Action inconnue."},400);
  }catch{return reply({error:"Service indisponible. Tu peux continuer sans code."},503);}
}
