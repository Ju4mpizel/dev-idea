/**
 * Guías "¿Qué es...?" de cada estación (botón de info junto al título).
 * Dev-i las explica a su lado. Contenido pensado para quien empieza: concepto
 * en simple, una analogía, ideas clave, dónde se ve en la universidad y en la
 * industria, y un consejo práctico.
 */
export const STATION_GUIDES = {
  naming: {
    question: "¿Por qué importa el nombre de un proyecto?",
    concept:
      "El nombre es la primera documentación de tu software: lo usarás en el repositorio, en el dominio, en las carpetas y al presentarlo.",
    analogy: "Es como el título de un libro: si no dice nada, nadie lo abre.",
    keyPoints: [
      "Corto, fácil de pronunciar y de escribir sin errores.",
      "Revisa que el dominio y el nombre en GitHub estén libres.",
      "En código se usa en kebab-case: mi-proyecto.",
    ],
    university: "Portada del proyecto, acta de constitución.",
    industry: "Branding, dominio, nombre del repositorio y del paquete.",
    tip: "Si dudas, omite esta estación: el nombre se puede cambiar luego.",
  },
  "system-type": {
    question: "¿Qué es el tipo de sistema?",
    concept:
      "Es la forma general de tu producto: una página web, una tienda, un sistema de gestión, una app... Define qué partes tendrá (sitio público, panel de admin, app de usuario) y eso cambia todo lo que viene después.",
    analogy:
      "Antes de diseñar una construcción decides si es una casa, un local o un edificio de oficinas: los planos de cada uno son muy distintos.",
    keyPoints: [
      "Si tu idea es clara, solo verás los tipos que encajan, con ⭐ el recomendado. «Ver todos los tipos» abre el catálogo completo.",
      "Cada parte con estructura propia es una “superficie”: sitio público, tienda, panel admin, app...",
      "Una API o un bot no tienen pantallas propias: más adelante no pasarás por Layout.",
      "¿Solo quieres cambiar textos y precios? Un sitio autoadministrable o un CMS suele bastar.",
      "Los complementos suman partes sin cambiar de tipo (p. ej. + Panel de admin).",
    ],
    university:
      "Alcance del sistema y diagrama de contexto: qué es el sistema y con quién interactúa.",
    industry:
      "Definición del producto y de sus superficies (marketing site, app, back-office).",
    tip: "Empieza por el tipo más sencillo que resuelva tu problema: siempre puedes sumar complementos.",
  },
  requirements: {
    question: "¿Qué son los requisitos de software?",
    concept:
      "Son la lista de lo que el sistema DEBE hacer (funcionales) y de CÓMO debe comportarse (no funcionales). Se definen antes de elegir tecnología.",
    analogy:
      "Antes de construir una casa decides cuántas habitaciones tendrá (funcional) y que aguante un sismo (no funcional).",
    keyPoints: [
      "RF (funcional): “El sistema debe permitir registrar una reserva”.",
      "RNF (no funcional): rendimiento, seguridad, usabilidad, disponibilidad. Deben ser medibles.",
      "Agruparlos por módulos ayuda a priorizar el MVP.",
      "MVP = Producto Mínimo Viable: lo mínimo que ya resuelve el problema.",
    ],
    university:
      "Ingeniería de Requisitos, ERS / IEEE 830, matriz de trazabilidad.",
    industry: "PRD (Product Requirements Document), backlog de producto.",
    tip: "Elige pocos módulos esenciales: siempre puedes crecer después.",
  },
  "user-stories": {
    question: "¿Qué es una historia de usuario?",
    concept:
      "Es un requisito contado desde la persona que usa el sistema: “Como <rol>, quiero <acción>, para <beneficio>”. Incluye criterios para saber cuándo está terminada.",
    analogy:
      "Es como un pedido en un restaurante: quién pide, qué quiere y para qué, y cómo saber que llegó bien.",
    keyPoints: [
      "Criterios de aceptación: “Dado… cuando… entonces…”.",
      "Puntos de historia: estiman el esfuerzo relativo (1, 2, 3, 5, 8).",
      "Buenas historias cumplen INVEST: independientes, valiosas, pequeñas y testeables.",
    ],
    university: "Metodologías ágiles, Scrum, product backlog.",
    industry: "Jira, Linear o GitHub Issues: cada historia es una tarjeta.",
    tip: "Cada historia debería poder terminarse en uno o dos días.",
  },
  stack: {
    question: "¿Qué es un stack tecnológico?",
    concept:
      "Es el conjunto de tecnologías con las que construyes tu software: lenguaje, framework de frontend y backend y herramientas. Las cartas se adaptan a tu tipo de producto, y la base de datos se decide en la estación siguiente.",
    analogy:
      "Es la caja de herramientas de un carpintero: no importa tener todas, sino las adecuadas para el mueble que vas a hacer.",
    keyPoints: [
      "Frontend: lo que el usuario ve (React, Vue, Angular...). Backend: la lógica en el servidor (Node, Django, Laravel, Spring...).",
      "Full-stack: un solo framework hace ambos (Next.js, Laravel, Django).",
      "Según tu producto: una app móvil recibe Expo o Flutter; una API o un bot, Node, FastAPI o Go.",
      "En «Tu entorno» eliges gestor de paquetes (npm, pnpm, pip, Composer...), editor, sistema operativo y cómo usarás la IA. Los comandos del cierre se adaptan a eso.",
      "Elegir algo que ya conoces suele ser más rápido que lo “mejor”.",
    ],
    university: "Programación web, frameworks MVC, ingeniería de software.",
    industry:
      "Ofertas de trabajo piden stacks concretos (MERN, LAMP, Next.js + Supabase...).",
    tip: "¿No sabes qué gestor elegir? Usa el que viene de serie: npm en JavaScript, pip en Python.",
  },
  database: {
    question: "¿Qué es una base de datos y la necesito?",
    concept:
      "Es donde tu aplicación guarda información de forma permanente: usuarios, pedidos, publicaciones. Primero respondes con el interruptor si tu proyecto guardará datos; Dev-i te sugiere la respuesta según tu tipo de sistema.",
    analogy:
      "Es el archivador de una oficina: relacional = carpetas con fichas iguales; documental = cajas donde cada documento puede ser distinto.",
    keyPoints: [
      "Relacional (SQL): tablas con relaciones; PostgreSQL, MySQL, SQLite.",
      "Documental (NoSQL): documentos flexibles tipo JSON; MongoDB, Firestore.",
      "BaaS (Supabase, Firebase): base de datos + login + API ya hechos.",
      "¿Ya tienes una favorita? Elígela y aparecerá primera entre las cartas.",
      "Administrador: el programa para ver y editar tus datos (pgAdmin, MySQL Workbench, Compass...). Lo eliges después de la carta.",
    ],
    university:
      "Bases de Datos I y II, modelo entidad-relación, normalización.",
    industry: "Postgres gestionado (Supabase, Neon), Redis como caché.",
    tip: "Si apagas el interruptor, el resto del plano se arma sin base: sin diagrama entidad-relación ni servicio de base en Deploy.",
  },
  architecture: {
    question: "¿Qué es la arquitectura de software?",
    concept:
      "Es la forma en que organizas el código: en qué partes (capas o módulos) se divide y cómo se comunican entre sí.",
    analogy:
      "Es el plano de un edificio: dónde va cada habitación y por dónde pasan las tuberías, antes de poner ladrillos.",
    keyPoints: [
      "Monolito por capas: presentación → lógica → datos. Simple y suficiente para casi todo.",
      "MVC: Modelo (datos), Vista (pantalla), Controlador (une ambos).",
      "Monolito modular: un solo proyecto dividido por dominios (usuarios, pagos...).",
      "Hexagonal / Clean / Microservicios: más aislamiento, más complejidad.",
    ],
    university:
      "Arquitectura de Software, patrones de diseño, diagrama de componentes.",
    industry: "Monolito modular primero; microservicios solo cuando duele.",
    tip: "Empieza simple: es más fácil dividir un monolito ordenado que unir microservicios.",
  },
  methodology: {
    question: "¿Qué es una metodología de trabajo?",
    concept:
      "Es la forma de organizar el trabajo en el tiempo: cómo decides qué hacer primero, cada cuánto entregas y cómo mides el avance.",
    analogy:
      "Es la rutina de entrenamiento: sin ella vas al gimnasio y haces lo que se te ocurre.",
    keyPoints: [
      "Kanban: tablero con columnas (Por hacer, Haciendo, Hecho) y límite de tareas en curso.",
      "Scrum: sprints de 1-4 semanas con reuniones y roles definidos.",
      "Cascada: fases secuenciales; útil cuando todo está definido desde el inicio.",
    ],
    university: "Gestión de proyectos de software, Scrum, RUP, cascada.",
    industry: "Kanban o Scrum con GitHub Projects, Jira, Linear o Trello.",
    tip: "Si trabajas solo, un Kanban simple suele ser suficiente.",
  },
  diagrams: {
    question: "¿Para qué sirven los diagramas de software?",
    concept:
      "Son dibujos que explican tu sistema sin leer código: quién lo usa, qué partes tiene, cómo fluyen los datos y cómo se guardan.",
    analogy:
      "Son los planos y maquetas de un arquitecto: permiten detectar errores antes de construir.",
    keyPoints: [
      "UML: casos de uso, clases, secuencia, actividades, estados, componentes y despliegue.",
      "C4: niveles de zoom (Contexto → Contenedores → Componentes → Código).",
      "ERD: tablas y relaciones. Con una base documental (MongoDB, Firestore) se propone un diagrama de colecciones, y sin base de datos, ninguno.",
      "Puedes dibujarlos como código con Mermaid o PlantUML.",
    ],
    university:
      "Análisis y Diseño de Sistemas: UML formal para la defensa del proyecto.",
    industry: "C4, diagramas de arquitectura cloud y ERD en la documentación.",
    tip: "Elige solo los que vayas a mantener. En el cierre los verás dibujados y con su código Mermaid para copiar.",
  },
  morphism: {
    question: "¿Qué es un estilo visual o “morphism”?",
    concept:
      "Es el lenguaje visual de tu interfaz: materiales, sombras, bordes, colores y tipografía. Da personalidad y coherencia.",
    analogy:
      "Es el estilo de decoración de una casa: minimalista, industrial, rústico… todo debe combinar.",
    keyPoints: [
      "Minimalismo: limpio y profesional, ideal para herramientas.",
      "Glassmorphism: cristal translúcido con desenfoque.",
      "Neobrutalismo: bordes gruesos y alto contraste.",
      "Cada carta de esta estación se ve con su propio estilo.",
      "Cada estilo trae 3 paletas de color con contraste accesible (WCAG AA): eliges una.",
    ],
    university: "Interacción Humano-Computador (IHC), diseño de interfaces.",
    industry:
      "Design systems: Tailwind, shadcn/ui, Material, tokens de diseño.",
    tip: "Elegir el estilo temprano evita rediseñar componentes después.",
  },
  layout: {
    question: "¿Qué es el layout o maquetación?",
    concept:
      "Es cómo se distribuye el contenido en la pantalla: dónde van el menú, el contenido principal, las tarjetas y las acciones.",
    analogy:
      "Es la distribución de los muebles: con los mismos muebles puedes tener una sala cómoda o un caos.",
    keyPoints: [
      "Cada parte de tu sistema tiene su propio layout: una landing no se arma igual que un panel de admin.",
      "Wireframe = boceto de la pantalla con cajas y líneas, sin colores ni detalles.",
      "Sitio público: zig-zag, hero, one-page. Gestión: tabla CRUD, maestro-detalle.",
      "Mobile-first: diseñar primero para el celular.",
      "Si tu sistema no tiene pantallas (una API o un bot), esta estación no aplica y se continúa sin layout.",
    ],
    university: "IHC, prototipado, wireframes y mockups.",
    industry: "Wireframes en Figma antes de programar.",
    tip: "Dibuja tus pantallas principales en papel antes de abrir el editor.",
  },
  deploy: {
    question: "¿Qué es el deploy o despliegue?",
    concept:
      "Es publicar tu aplicación en internet para que otros la usen. Incluye dónde se aloja (hosting), cómo se actualiza y dónde vive tu código (GitHub).",
    analogy:
      "Es mudar tu tienda del garaje a un local con dirección: ahora cualquiera puede visitarla.",
    keyPoints: [
      "Hosting: el servidor donde corre tu app (Vercel, Render, Railway...).",
      "Cada carta viene marcada como Gratis (con límites), Económico (≈ US$5-25/mes) o Profesional (US$50+/mes).",
      "Una app móvil además se publica en las tiendas: Google Play y App Store.",
      "CI/CD: cada push a GitHub despliega automáticamente.",
      "Variables de entorno: claves secretas que nunca se suben al repositorio.",
    ],
    university: "Diagrama de despliegue UML, redes, sistemas operativos.",
    industry: "Vercel/Netlify para frontend, Docker y cloud para backend.",
    tip: "Sube tu código a GitHub desde el primer día.",
  },
  "ai-ecosystem": {
    question: "¿Qué herramientas de IA me ayudan a programar?",
    concept:
      "Son asistentes que te ayudan a escribir, entender y corregir el código de tu proyecto: desde un chat al que le preguntas hasta agentes que trabajan solos sobre tu repositorio.",
    analogy:
      "Es elegir compañero de taller: uno te explica cómo se hace, otro te pasa las herramientas y otro arma piezas enteras mientras tú revisas.",
    keyPoints: [
      "Chat: le preguntas y copias el código a mano (ChatGPT, Claude, Gemini).",
      "Editor con IA: sugiere código mientras escribes (Cursor, Copilot).",
      "Agente: lee tu repo, edita varios archivos y corre comandos (Claude Code, Codex, OpenCode).",
      "AGENTS.md: archivo con el contexto del proyecto para que la IA no improvise.",
      "Si en Stack dijiste cómo usarás la IA, la galería empieza filtrada con ese tipo de herramienta.",
    ],
    university: "Inteligencia artificial, ética y uso responsable de IA.",
    industry:
      "Claude Code, Codex, OpenCode, Antigravity, Cursor y GitHub Copilot.",
    tip: "La IA acelera, pero tú debes entender y revisar cada línea.",
  },
};

export const getStationGuide = (stationId) => STATION_GUIDES[stationId] || null;
