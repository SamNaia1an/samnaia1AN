import { NextResponse } from "next/server";
import { hasAccess } from "@/lib/gift-access";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"private, no-store, max-age=0"};
export async function GET(req:Request){
  if(!hasAccess(req))return NextResponse.json({error:"Reviens à la page d’accueil pour entrer le code de la surprise."},{status:401,headers});
  const letter=process.env.GIFT_LETTER_TEXT;
  if(!letter)return NextResponse.json({error:"La lettre est momentanément indisponible. Réessaie."},{status:503,headers});
  return NextResponse.json({letter},{headers});
}
