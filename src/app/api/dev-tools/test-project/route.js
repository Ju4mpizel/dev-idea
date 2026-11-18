import { NextResponse } from "next/server";
import { getDevToolsUser } from "@/lib/devTools";
import { buildTestProject } from "@/data/testProject";

// GET: proyecto de prueba completo hasta el Layout (solo cuentas autorizadas)
export async function GET(req) {
  try {
    const user = await getDevToolsUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado para usar el proyecto de prueba." },
        { status: 403 },
      );
    }
    return NextResponse.json({ data: buildTestProject() });
  } catch (err) {
    console.error("[API dev-tools/test-project]", err);
    return NextResponse.json(
      { error: "No se pudo generar el proyecto de prueba." },
      { status: 500 },
    );
  }
}
