import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServer(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    },
  );
}

// GET: Obtiene proyectos del usuario autenticado (con soporte de búsqueda Ficha D)
export async function GET(req) {
  try {
    const supabase = getSupabaseServer(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Sesión no válida o ausente." },
        { status: 401 },
      );
    }

    // FICHA D: Extracción del parámetro de búsqueda opcional
    const { searchParams } = new URL(req.url);
    const buscar = searchParams.get("buscar");

    let query = supabase
      .from("projects")
      .select("*, blueprints (*)")
      .order("updated_at", { ascending: false });

    // FICHA D: Búsqueda insensible a mayúsculas sin concatenación directa
    if (buscar && buscar.trim() !== "") {
      const termino = `%${buscar.trim()}%`;
      query = query.ilike("title", termino);
    }

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: projects }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err.message },
      { status: 500 },
    );
  }
}

// POST: Crea un nuevo proyecto con su blueprint (con validación de activo Ficha F)
export async function POST(req) {
  try {
    const supabase = getSupabaseServer(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para guardar." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { blueprint, currentStep = 0, isCompleted = false, activo } = body;

    if (!blueprint) {
      return NextResponse.json(
        { error: "El payload debe contener un objeto 'blueprint'." },
        { status: 400 },
      );
    }

    // FICHA F: Validación estricta del campo booleano
    let estadoActivo = true;
    if (activo !== undefined) {
      if (typeof activo !== "boolean") {
        return NextResponse.json(
          {
            error:
              "El campo 'activo' debe ser un valor booleano JSON (true o false).",
          },
          { status: 400 },
        );
      }
      estadoActivo = activo;
    }

    const title =
      blueprint.selectedName ||
      (blueprint.idea ? blueprint.idea.slice(0, 30) : "Proyecto sin nombre");
    const status = isCompleted ? "COMPLETED" : "DRAFT";

    // 1. Insertar en projects (incluyendo campo activo persistido)
    const { data: project, error: pError } = await supabase
      .from("projects")
      .insert([
        {
          user_id: user.id,
          title,
          status,
          current_step: currentStep,
          activo: estadoActivo,
        },
      ])
      .select("id, title, status, activo, current_step")
      .single();

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    // 2. Insertar en blueprints
    const blueprintPayload = {
      project_id: project.id,
      idea: blueprint.idea || "",
      context: blueprint.context || "startup",
      selected_name: blueprint.selectedName || "",
      selected_stack: blueprint.selectedStack || null,
      selected_architecture: blueprint.selectedArchitecture || null,
      selected_methodology: blueprint.selectedMethodology || null,
      selected_diagrams: blueprint.selectedDiagrams || [],
      selected_style: blueprint.selectedStyle || null,
      selected_layout: blueprint.selectedLayout || null,
      selected_deploy: blueprint.selectedDeploy || null,
      selected_ai_ecosystem: blueprint.selectedAiEcosystem || null,
    };

    const { error: bError } = await supabase
      .from("blueprints")
      .insert([blueprintPayload]);

    if (bError) {
      return NextResponse.json({ error: bError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Proyecto creado con éxito",
        projectId: project.id,
        datos: project,
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err.message },
      { status: 500 },
    );
  }
}
