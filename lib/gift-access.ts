import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
const NAME="gift_access";
function secret(){return process.env.SAM_PREVIEW_LINK_KEY || process.env.SAM_OWNER_KEY;}
function sign(value:string,key:string){return createHmac("sha256",key).update("letter-access-v1:"+value).digest("hex");}
export function grant(response:NextResponse){
  const key=secret();
  if(!key)return response;
  const expiry=String(Math.floor(Date.now()/1000)+43200);
  response.cookies.set(NAME,expiry+"."+sign(expiry,key),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:43200});
  return response;
}
export function hasAccess(req:Request){
  const key=secret();
  if(!key)return false;
  const token=req.headers.get("cookie")?.split(";").map(s=>s.trim()).find(s=>s.startsWith(NAME+"="))?.slice(NAME.length+1)||"";
  const match=/^(\d{10})\.([a-f0-9]{64})$/.exec(token);
  if(!match||Number(match[1])<Math.floor(Date.now()/1000))return false;
  return timingSafeEqual(Buffer.from(match[2]),Buffer.from(sign(match[1],key)));
}
