import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { blueprintToDbRow } from "@/config/stations.config";

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

// PUT: Actualiza el proyecto y su blueprint
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del proyecto" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const { blueprint, currentStep = 0, isCompleted = false } = body;

    const title =
      blueprint?.selectedName ||
      (blueprint?.idea ? blueprint.idea.slice(0, 30) : "Proyecto sin nombre");
    const status = isCompleted ? "COMPLETED" : "DRAFT";

    // 1. Actualizar projects
    const { data: updatedRows, error: pError } = await supabase
      .from("projects")
      .update({
        title,
        status,
        current_step: currentStep,
      })
      .eq("id", id)
      .select("id");

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    // 0 filas: el proyecto fue borrado o no pertenece al usuario (RLS)
    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        {
          error: "El proyecto ya no existe en la nube.",
          code: "PROJECT_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // 2. Actualizar blueprints (upsert)
    if (blueprint) {
      const blueprintPayload = {
        project_id: id,
        ...blueprintToDbRow(blueprint),
      };

      const { error: bError } = await supabase
        .from("blueprints")
        .upsert(blueprintPayload, { onConflict: "project_id" });

      if (bError) {
        return NextResponse.json({ error: bError.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      { message: "Proyecto actualizado con éxito", projectId: id },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err.message },
      { status: 500 },
    );
  }
}

// DELETE: Elimina un proyecto por ID
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del proyecto" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Proyecto eliminado correctamente" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: err.message },
      { status: 500 },
    );
  }
}
