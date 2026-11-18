import { NextResponse } from "next/server";
import { getRequestUser, isUuid, serverError } from "@/lib/supabaseServer";
import {
  LAST_STEP,
  blueprintToDbRow,
  sanitizeGeneratedOptions,
} from "@/config/stations.config";

const clampStep = (step) =>
  Math.min(Math.max(Number(step) || 0, 0), LAST_STEP);

const toIdeaRunId = (value) => (isUuid(value) ? value : null);

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

    const { user, supabase } = await getRequestUser(req);

    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const {
      blueprint,
      generatedOptions,
      currentStep = 0,
      isCompleted = false,
      ideaRunId,
    } = body;

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
        current_step: clampStep(currentStep),
        // Solo se escribe si llega un ticket válido (nunca se borra el vínculo)
        ...(toIdeaRunId(ideaRunId) ? { idea_run_id: ideaRunId } : {}),
      })
      .eq("id", id)
      .select("id");

    if (pError) {
      return serverError("projects", pError);
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
        generated_options: sanitizeGeneratedOptions(generatedOptions),
      };

      const { error: bError } = await supabase
        .from("blueprints")
        .upsert(blueprintPayload, { onConflict: "project_id" });

      if (bError) {
        return serverError("projects", bError);
      }
    }

    return NextResponse.json(
      { message: "Proyecto actualizado con éxito", projectId: id },
      { status: 200 },
    );
  } catch (err) {
    return serverError("projects", err);
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

    const { user, supabase } = await getRequestUser(req);

    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      return serverError("projects", error);
    }

    return NextResponse.json(
      { message: "Proyecto eliminado correctamente" },
      { status: 200 },
    );
  } catch (err) {
    return serverError("projects", err);
  }
}
