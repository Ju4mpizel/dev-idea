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

// PUT: Actualiza el proyecto y su blueprint (soporta actualización de 'activo' de Ficha F)
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
    const { blueprint, currentStep = 0, isCompleted = false, activo } = body;

    // FICHA F: Validación estricta del tipo booleano en actualización
    const projectUpdates = {
      current_step: currentStep,
      status: isCompleted ? "COMPLETED" : "DRAFT",
    };

    if (blueprint) {
      projectUpdates.title =
        blueprint.selectedName ||
        (blueprint.idea ? blueprint.idea.slice(0, 30) : "Proyecto sin nombre");
    }

    if (activo !== undefined) {
      if (typeof activo !== "boolean") {
        return NextResponse.json(
          {
            error:
              "El campo 'activo' debe ser un booleano JSON (true o false).",
          },
          { status: 400 },
        );
      }
      projectUpdates.activo = activo;
    }

    // 1. Actualizar projects
    const { data: updatedProject, error: pError } = await supabase
      .from("projects")
      .update(projectUpdates)
      .eq("id", id)
      .select("id, title, status, activo, current_step")
      .single();

    if (pError || !updatedProject) {
      return NextResponse.json(
        { error: pError ? pError.message : "Proyecto no encontrado" },
        { status: pError ? 500 : 404 },
      );
    }

    // 2. Actualizar blueprints (upsert)
    if (blueprint) {
      const blueprintPayload = {
        project_id: id,
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
        .upsert(blueprintPayload, { onConflict: "project_id" });

      if (bError) {
        return NextResponse.json({ error: bError.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      {
        message: "Proyecto actualizado con éxito",
        projectId: id,
        datos: updatedProject,
      },
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
