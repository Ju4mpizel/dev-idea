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

// GET: Obtiene proyectos del usuario autenticado
export async function GET(req) {
  try {
    const { user, supabase } = await getRequestUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado. Sesión no válida o ausente." },
        { status: 401 },
      );
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*, blueprints (*)")
      .order("updated_at", { ascending: false });

    if (error) {
      return serverError("projects", error);
    }

    return NextResponse.json({ data: projects }, { status: 200 });
  } catch (err) {
    return serverError("projects", err);
  }
}

// POST: Crea un nuevo proyecto con su blueprint
export async function POST(req) {
  try {
    const { user, supabase } = await getRequestUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para guardar." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      blueprint,
      generatedOptions,
      currentStep = 0,
      isCompleted = false,
      ideaRunId,
    } = body;

    if (!blueprint) {
      return NextResponse.json(
        { error: "El payload debe contener un objeto 'blueprint'." },
        { status: 400 },
      );
    }

    const title =
      blueprint.selectedName ||
      (blueprint.idea ? blueprint.idea.slice(0, 30) : "Proyecto sin nombre");
    const status = isCompleted ? "COMPLETED" : "DRAFT";

    // 1. Insertar en projects
    const { data: project, error: pError } = await supabase
      .from("projects")
      .insert([
        {
          user_id: user.id,
          title,
          status,
          current_step: clampStep(currentStep),
          idea_run_id: toIdeaRunId(ideaRunId),
        },
      ])
      .select("id")
      .single();

    if (pError) {
      return serverError("projects", pError);
    }

    // 2. Insertar en blueprints
    const blueprintPayload = {
      project_id: project.id,
      ...blueprintToDbRow(blueprint),
      generated_options: sanitizeGeneratedOptions(generatedOptions),
    };

    const { error: bError } = await supabase
      .from("blueprints")
      .insert([blueprintPayload]);

    if (bError) {
      // Rollback: evitamos dejar un proyecto huérfano sin blueprint
      const { error: rollbackError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);
      if (rollbackError) {
        console.error("[API projects] Rollback fallido:", rollbackError);
      }
      return serverError("projects", bError);
    }

    return NextResponse.json(
      { message: "Proyecto creado con éxito", projectId: project.id },
      { status: 201 },
    );
  } catch (err) {
    return serverError("projects", err);
  }
}
