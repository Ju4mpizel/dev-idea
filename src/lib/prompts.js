/**
 * Generador de prompts estructurados para el flujo completo de estaciones en Dev.Idea.
 *
 * La FORMA del JSON la impone `responseSchema` (src/lib/stepSchemas.js) y la
 * garantiza el saneamiento (src/lib/stepContracts.js). Por eso los prompts no
 * incluyen ejemplos de JSON: solo el contexto, las reglas de negocio y el
 * significado de cada campo. Los nombres de campo se mencionan igualmente para
 * que el modelo siga orientado si algún día responde sin esquema.
 */

/** Título legible de una decisión del blueprint (objeto, array u otro). */
function describeDecision(value, fallback = "No definido") {
  if (Array.isArray(value)) {
    const titles = value.map((v) => describeDecision(v, "")).filter(Boolean);
    return titles.length ? titles.join(" + ") : fallback;
  }
  if (value && typeof value === "object") {
    const title = value.title || value.name || "";
    return title ? `${title}${value.tag ? ` (${value.tag})` : ""}` : fallback;
  }
  return value ? String(value) : fallback;
}

/**
 * Bloque de contexto con las decisiones tomadas ANTES de `uptoStep`,
 * para que cada estación se apoye en las anteriores.
 */
function buildDecisionContext(blueprint, uptoStep) {
  const {
    selectedName,
    selectedStack,
    selectedArchitecture,
    selectedMethodology,
    selectedDiagrams,
    selectedStyle,
    selectedLayout,
    selectedDeploy,
    selectedAiEcosystem,
  } = blueprint;

  const stackParts = [describeDecision(selectedStack)];
  if (selectedStack?.selectedLanguage) {
    stackParts.push(`Lenguaje: ${selectedStack.selectedLanguage}`);
  }
  if (Array.isArray(selectedStack?.tags) && selectedStack.tags.length) {
    stackParts.push(`Piezas: ${selectedStack.tags.join(", ")}`);
  }

  const styleKey = selectedStyle?.styleKey
    ? ` [styleKey: ${selectedStyle.styleKey}]`
    : "";

  const lines = [
    [1, `NOMBRE: ${selectedName || "Sin nombre definido"}`],
    [2, `STACK: ${stackParts.join(" | ")}`],
    [3, `ARQUITECTURA: ${describeDecision(selectedArchitecture)}`],
    [
      4,
      `METODOLOGÍA: ${describeDecision(selectedMethodology, "Omitida por el usuario")}`,
    ],
    [5, `DIAGRAMAS: ${describeDecision(selectedDiagrams)}`],
    [6, `ESTILO VISUAL: ${describeDecision(selectedStyle)}${styleKey}`],
    [7, `LAYOUT: ${describeDecision(selectedLayout)}`],
    [8, `DEPLOY: ${describeDecision(selectedDeploy)}`],
    [9, `ECOSISTEMA IA: ${describeDecision(selectedAiEcosystem)}`],
  ];

  return lines
    .filter(([step]) => step < uptoStep)
    .map(([, text]) => `- ${text}`)
    .join("\n");
}

/** Guía de campos de Strobi, común a todas las estaciones. */
const strobiFields = (mood, comment) =>
  `- companionMood: "${mood}" · companionComment: ${comment} (1 frase, tono cercano).`;

/** Guía de campos de una opción estándar (estaciones 3, 4, 6-9). */
const optionFields = (techsHint) =>
  `- Por opción: id único · level · title concreto · tag de 2-3 palabras · summary de 1-2 frases aplicado a ESTE proyecto · pros y cons (ventaja y trade-off principal) · techs: 3-5 ${techsHint}.`;

const JSON_ONLY = "Responde ÚNICAMENTE con el JSON.";

export function buildStepPrompt(stepId, blueprint = {}) {
  const {
    idea = "",
    context = "startup",
    selectedName = "",
    selectedStack = null,
    selectedArchitecture = null,
  } = blueprint;

  const stackTitle = selectedStack?.title || "Stack Estándar Moderno";
  const archTitle = selectedArchitecture?.title || "Arquitectura Estándar";

  // ========================================================
  // ESTACIÓN 1: NAMING & CONCEPTO
  // ========================================================
  if (stepId === 1 || stepId === "naming") {
    return `
Eres el estratega técnico de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
Propón 4 NOMBRES (names), uno por estilo: Modern SaaS, Técnico/Pragmático, Disruptivo y Minimalista.
CAMPOS:
- Por nombre: name · style (uno de los 4 estilos) · tagline: propuesta de valor en una línea · rationale: por qué resuena técnicamente.
${strobiFields("thinking", "comentario astuto sobre el bautizo del software")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 2: STACK TECNOLÓGICO DINÁMICO
  // ========================================================
  if (stepId === 2 || stepId === "stack") {
    return `
Eres el arquitecto senior de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | NOMBRE: "${selectedName || "App"}".

Genera entre 4 y 5 STACKS (stacks) diversos, clasificados por curva y complejidad técnica en "level":
- simple (Ágil): mínimo setup y despliegue instantáneo (ej. Next.js Jamstack, Laravel/Django clásico, herramientas Local-First).
- medium (Pragmático): balance para proyectos en crecimiento (ej. React + Node/FastAPI/Go con Postgres/MySQL).
- advanced (Enterprise / Alto rendimiento): ecosistemas de tipado estricto (ej. C# / ASP.NET Core, Java/Spring Boot, Rust).
CAMPOS:
- Por stack: title · badge en mayúsculas (ej. "ÁGIL / VELOZ") · tags: piezas del stack (framework, backend, BD, CSS) · defaultLanguage y availableLanguages (sabores reales del stack) · pros y cons técnicos.
${strobiFields("curious", "consejo sobre no complicar las dependencias más de lo necesario")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 3: ARQUITECTURA TÉCNICA (6 OPCIONES BALANCEADAS AL STACK)
  // ========================================================
  if (stepId === 3 || stepId === "architecture") {
    return `
Eres el arquitecto de sistemas de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | STACK SELECCIONADO: "${stackTitle}".

Genera EXACTAMENTE 6 patrones arquitectónicos aterrizados ESPECÍFICAMENTE a "${stackTitle}": 2 por nivel.
1. 2 "simple" (Rápido / Directo, sin sobreingeniería): patrones directos consagrados en este stack (ej. MVC/MVT tradicional, 3 capas Presentación-Servicio-Datos, API CRUD monolítica). tag sugerido: "Rápido / Directo" o "Estructurado Simple".
2. 2 "medium" (Pragmático / Modular): patrones desacoplados y limpios (ej. Monolito Modular por dominios, API desacoplada con contratos DTO, Vertical Slice). tag sugerido: "Pragmático / Modular" o "Independiente".
3. 2 "advanced" (Escalable / Robusto): alta concurrencia o aislamiento extremo (ej. Hexagonal con puertos y adaptadores, CQRS ligero con eventos de dominio, orientada a eventos/colas). tag sugerido: "Aislamiento Total" o "Alto Desempeño".

IMPORTANTE: title, techs, pros y cons deben mencionar herramientas, componentes o conceptos que tengan sentido con "${stackTitle}" y la idea.
CAMPOS:
${optionFields("capas o componentes del patrón con piezas del stack")}
- summary: cómo fluyen los datos y peticiones usando las piezas del stack.
${strobiFields("thinking", "balance arquitectónico adecuado sin caer en sobreingeniería")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 4: METODOLOGÍA DE TRABAJO (CADENCIA & FLUJO ÁGIL)
  // ========================================================
  if (stepId === 4 || stepId === "methodology") {
    return `
Eres el Lead Agile Coach y Gestor de Ingeniería de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | STACK: "${stackTitle}" | ARQUITECTURA: "${archTitle}".

Genera 4 metodologías de desarrollo ágil adaptadas a la envergadura del proyecto y al equipo esperado:
- 1 "simple": fricción cero para devs solos o MVPs ultrarrápidos (ej. Kanban continuo con límite WIP, Personal Kanban).
- 2 "medium": iterativas para equipos pequeños o por objetivos (ej. micro-sprints de 1 semana, Shape Up con apetito fijo).
- 1 "advanced": estructuradas para defensa académica o equipos rigurosos (ej. Scrum formal con ceremonias y métricas, XP con TDD continuo).
CAMPOS:
${optionFields("prácticas o herramientas de la metodología")}
- summary: cadencia de trabajo y cómo se gestionan los requerimientos.
${strobiFields("working", "no ahogarse en reuniones y elegir un ritmo sostenible")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 5: DIAGRAMAS DINÁMICOS IA
  // ========================================================
  if (stepId === 5 || stepId === "diagrams") {
    // Detección heurística de persistencia según el stack y la arquitectura
    const stackLower =
      `${stackTitle} ${(selectedStack?.tags || []).join(" ")}`.toLowerCase();
    const isStaticOrLanding =
      stackLower.includes("landing") ||
      stackLower.includes("html") ||
      stackLower.includes("astro") ||
      idea.toLowerCase().includes("landing");

    const hasDatabase =
      !isStaticOrLanding &&
      (stackLower.includes("postgres") ||
        stackLower.includes("supabase") ||
        stackLower.includes("sql") ||
        stackLower.includes("mongo") ||
        stackLower.includes("prisma") ||
        stackLower.includes("backend") ||
        stackLower.includes("api"));

    return `
Eres el arquitecto visual de sistemas de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | STACK: "${stackTitle}" | ARQUITECTURA: "${archTitle}".
REQUIERE BASE DE DATOS: ${hasDatabase ? "SÍ (relacional/documental)" : "NO (sitio estático/frontend sin persistencia compleja)"}.

Genera EXACTAMENTE 3 paquetes de diagramas técnicos, uno por nivel de profundidad (simple, medium, advanced).
REGLAS ESTRICTAS:
1. SIN BASE DE DATOS: PROHIBIDO sugerir ERD. Usa casos de uso con actores, wireflow de navegación, árbol de componentes o embudo de conversión.
2. CONTEXTO "academic": OBLIGATORIO incluir UML formal de defensa (casos de uso con actores, clases o secuencia).
3. CON BASE DE DATOS: incluye en el nivel medium el ERD con entidades clave y relaciones.
CAMPOS:
${optionFields("piezas o herramientas de diagramación")}
- diagrams: diagramas concretos del paquete (name · type · description). type: use-case (actores), components (módulos/carpetas), erd (BD), sequence (auth/APIs), cloud (infraestructura), flowchart (flujo de usuario).
- sampleMermaid: ejemplo breve en sintaxis Mermaid del diagrama principal, con saltos de línea \\n.
- cons: qué diagramas omite el paquete.
${strobiFields("curious", "no dibujar cajas innecesarias y enfocarse en los diagramas que aportan valor")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 6: LENGUAJE VISUAL / MORPHISM
  // ========================================================
  if (stepId === 6 || stepId === "morphism") {
    return `
Eres el Lead UI/UX Designer de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
DECISIONES PREVIAS:
${buildDecisionContext(blueprint, 6)}

Elige EXACTAMENTE 3 o 4 estilos visuales, los MÁS ADECUADOS para el propósito y público de este software, de este catálogo ("styleKey"):
1. minimalism: flat SaaS moderno, bordes 1px, neutrales oscuros (Vercel/Stripe). Dashboards, B2B, analítica.
2. glassmorphism: dark glass translúcido con resplandor difuso. Landings, fintech, web3, premium.
3. claymorphism: arcilla 3D inflada, sombras internas suaves. Educación, lúdico, comunidad, bienestar.
4. neobrutalism: bordes gruesos, alto contraste, sombras sólidas. Creadores, cultura pop, herramientas atrevidas.
5. neumorphism: superficies extruidas cóncavas/convexas. IoT, domótica, audio/hardware.
6. aurora: mesh gradients y bordes luminosos esmeralda/cian. IA, biotecnología, datos.
7. cyberpunk: HUD futurista, cortes angulares, neón cian/rosa. Gaming, streaming, seguridad.
8. skeuomorphism: biselado de luz y relieve tangible. Finanzas tradicionales, sonido, productividad premium.
9. terminal: consola retro monoespaciada verde fósforo. Herramientas dev, DevOps, CLI web.
10. papercraft: elevación sutil multicapa (Notion, Material You). Notas, wikis, productividad.

La tarjeta se transforma visualmente según su styleKey: usa la clave exacta.
CAMPOS:
${optionFields("tokens de diseño o recursos (paletas, tipografías, efectos)")}
${strobiFields("playful", "acertar con la estética según el tipo de cliente")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 7: LAYOUT PATTERN
  // ========================================================
  if (stepId === 7 || stepId === "layout") {
    return `
Eres el diseñador de UX de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
DECISIONES PREVIAS:
${buildDecisionContext(blueprint, 7)}

Propón EXACTAMENTE 3 patrones de maquetación (distribución espacial de pantallas) para ESTE producto, uno por nivel (simple, medium, advanced).
REGLAS:
- Coherente con el ESTILO VISUAL elegido y con el tipo de usuario de la idea.
- Implementable con el STACK elegido; en techs menciona piezas reales de ese stack (componentes, utilidades CSS, librerías).
- No propongas patrones genéricos sin justificarlos para esta idea.
CAMPOS:
${optionFields("piezas de layout del stack")}
${strobiFields("thinking", "cómo el layout encaja con el estilo elegido")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 8: INFRAESTRUCTURA & DEPLOY
  // ========================================================
  if (stepId === 8 || stepId === "deploy") {
    return `
Eres el DevOps Lead de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
DECISIONES PREVIAS:
${buildDecisionContext(blueprint, 8)}

Genera EXACTAMENTE 3 planes de despliegue con costo inicial $0 (free tier) y respaldo del código en GitHub, uno por nivel (simple, medium, advanced).
REGLAS:
- Cada plan soporta REALMENTE el STACK y la ARQUITECTURA elegidos (runtime, base de datos, procesos en segundo plano si aplican).
- Si la METODOLOGÍA usa iteraciones cortas, prioriza preview deployments / CI por rama.
- En cons indica el límite concreto del free tier que más afectaría a este proyecto.
CAMPOS:
${optionFields("servicios o herramientas de deploy")}
${strobiFields("proud", "recordatorio de que el código que no está en GitHub no existe")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 9: ECOSISTEMA DE IA & HERRAMIENTAS
  // ========================================================
  if (stepId === 9 || stepId === "ai-ecosystem") {
    return `
Eres el AI Strategist de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
DECISIONES PREVIAS:
${buildDecisionContext(blueprint, 9)}

Propón EXACTAMENTE 3 kits que combinen (a) modelos de IA útiles DENTRO del producto, si la idea los necesita, y (b) herramientas/copilots para acelerar su desarrollo, uno por nivel (simple, medium, advanced).
REGLAS:
- Los copilots deben trabajar bien con el STACK y LENGUAJE elegidos.
- Si la idea no necesita IA en el producto, dilo en summary y enfoca el kit en el desarrollo.
- CONTEXTO: "academic" prioriza herramientas gratuitas; "personal" costo cero; "startup" velocidad.
CAMPOS:
${optionFields("modelos o herramientas")}
${strobiFields("celebrate", "acelerar sin perder el control del código")}
${JSON_ONLY}
`;
  }

  // ========================================================
  // ESTACIÓN 10 (⭐): BLUEPRINT FINAL
  // ========================================================
  if (stepId === 10 || stepId === "workspace") {
    const nameHint = selectedName ? `"${selectedName}"` : "la idea";
    return `
Eres el Lead Architect de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
DECISIONES DEL USUARIO:
${buildDecisionContext(blueprint, 10)}

Genera el blueprint de cierre (scaffold): resumen técnico coherente con TODAS las decisiones y los primeros comandos reales para inicializar el proyecto con el STACK y LENGUAJE elegidos (usa el gestor de paquetes propio de ese ecosistema).
CAMPOS:
- scaffold.projectName: kebab-case basado en ${nameHint} · scaffold.techSummary: 1-2 frases sobre stack, arquitectura y deploy · scaffold.commands: 3-6 comandos en orden de ejecución.
${strobiFields("celebrate", "cierre animando a empezar a construir")}
${JSON_ONLY}
`;
  }

  throw new Error(`No existe prompt para la estación "${stepId}".`);
}
