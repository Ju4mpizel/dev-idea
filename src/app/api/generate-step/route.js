import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildStepPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { stepId, blueprint } = await request.json();

    if (!stepId) {
      return NextResponse.json(
        { success: false, error: "Falta el parámetro stepId." },
        { status: 400 },
      );
    }

    const prompt = buildStepPrompt(stepId, blueprint || {});

    // Invocamos el pool de modelos
    const rawText = await generateWithFallback({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Limpieza de bloques de código Markdown (```json ... ```) antes de parsear
    const cleanJson = (rawText || "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("[API generate-step] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al comunicarse con Gemini.",
      },
      { status: 500 },
    );
  }
}
