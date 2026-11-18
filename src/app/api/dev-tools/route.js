import { NextResponse } from "next/server";
import { getDevToolsUser } from "@/lib/devTools";

// GET: ¿la sesión actual puede usar las herramientas de desarrollo?
export async function GET(req) {
  try {
    const user = await getDevToolsUser(req);
    return NextResponse.json({ enabled: Boolean(user) });
  } catch (err) {
    console.error("[API dev-tools]", err);
    return NextResponse.json({ enabled: false });
  }
}
