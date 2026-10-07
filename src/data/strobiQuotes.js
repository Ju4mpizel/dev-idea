// Frases cuando el usuario activa la tarjeta de proyecto guardado en Estación 0
export const STROBI_RESUME_QUOTES = [
  {
    quote: "¿Continuamos donde lo dejamos? Ese plano tiene buena pinta.",
    mood: "happy",
  },
  {
    quote: "¡Ahí está tu proyecto guardado! ¿Retomamos el camino?",
    mood: "curious",
  },
  {
    quote:
      "¿Le damos con todo a este software? Estaba esperando que volvieras.",
    mood: "proud",
  },
  {
    quote: "Volvamos al plano. Quedan buenas decisiones por tomar.",
    mood: "thinking",
  },
];

// Frases cuando el usuario descarta o borra el proyecto guardado en Estación 0
export const STROBI_DISCARD_QUOTES = [
  {
    quote: "¡A la basura! Lienzo limpio para una idea mejor.",
    mood: "celebrate",
  },
  {
    quote: "¡Adiós proyecto! Directo a /dev/null sin mirar atrás.",
    mood: "proud",
  },
  {
    quote: "¡Descartado! A veces soltar una idea es la decisión más sana.",
    mood: "happy",
  },
  {
    quote: "Memoria liberada por completo. Cuéntame la siguiente idea.",
    mood: "idle",
  },
];

// ==========================================
// FRASES PARA CLIC EN EL AVATAR
// ==========================================
export const STROBI_QUOTES = [
  // 1. FURIA ROJA ("angry-brows")
  {
    quote:
      "¡El proyecto no va a salir bien si no tienes orden! ¿Cuántas veces te lo tengo que repetir?",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡¿Microservicios para una entrega escolar?! ¡Me va a dar un colapso en los circuitos por tu culpa!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡Estás metiendo 15 librerías distintas solo para centrar un botón! ¡Usa la cabeza!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡¿Desplegar cambios a producción un viernes por la noche?! ¡Ni se te ocurra tocar ese botón!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡Llevas 3 días rediseñando el logo y no has escrito ni la primera función! ¡A trabajar!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡El commit 'arreglos_finales_ahora_si_definitivo_v3' es un insulto a la ingeniería de software!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¿Otra vez cambiando de base de datos antes de tener listo el primer formulario? ¡Concéntrate!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡Dejen de inventar requerimientos nuevos cada media hora! ¡Definan el alcance y ciérrenlo ya!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¿Tres bases de datos diferentes para una app de notas personal? ¡Tranquilo Elon Musk, bájale dos rayas!",
    expression: "angry-brows",
    shake: true,
  },
  {
    quote:
      "¡No me mires con esa cara! Si no anotas los pasos en papel, mañana se te va a olvidar todo otra vez.",
    expression: "angry-brows",
    shake: true,
  },

  // 2. PÁNICO & TEMBLOR ("uneasy-left")
  {
    quote:
      "Siento una perturbación en el código... huele a deuda técnica masiva y noches sin dormir.",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "Veo demasiados 'any' en TypeScript en tu lógica principal... me dan escalofríos en el cuerpo.",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "Tengo miedo... ese archivo utils.js tiene 3,000 líneas, nadie lo documentó y hace todo a la vez.",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "¿Tu base de datos no tiene llaves foráneas ni reglas de integridad? Siento que en cualquier momento explotamos.",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "¿Sin pruebas unitarias, sin respaldos y con la presentación en 4 horas? No sé si voy a sobrevivir a esto.",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "¡La fecha límite está a la vuelta de la esquina y nosotros seguimos debatiendo qué fuente usar!",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "¿Guardar contraseñas en texto plano en la base de datos? ¡Por favor dime que es una broma pesada!",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "Siento que si toco una sola línea de CSS de este proyecto, se van a desarmar cinco pantallas enteras.",
    expression: "uneasy-left",
    shake: true,
  },
  {
    quote:
      "¿Borraste la tabla directo en el servidor sin sacar un backup previo? ¡Me va a dar un paro cardíaco!",
    expression: "uneasy-left",
    shake: true,
  },

  // 3. SARCASMO & VIGILANCIA ("suspicious")
  {
    quote:
      "¿Con que haciendo un proyecto sin orden ni estructura? Te estoy vigilando muy de cerca...",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "Copiar respuestas de foros o de la IA sin entenderlas no es programar; es invocar bugs que nadie sabe arreglar.",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "La parálisis por análisis no se cura leyendo 10 tutoriales más. Construye algo imperfecto de una vez.",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "No optimices para soportar 1 millón de usuarios si hoy tienes 0. Primero termina el registro de usuarios.",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "Mucho diagrama pomposo y mucha reunión de planificación, pero veo el repositorio sospechosamente vacío.",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "¿Dices que 'en local funciona perfecto'? Lástima que tus clientes no viven adentro de tu computadora.",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "Esa excusa de 'luego lo refactorizo' la hemos escuchado todos... y ambos sabemos que nunca va a pasar.",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "¿Seguro que ese error se arregló solo o simplemente recargaste la página hasta que no salió el mensaje rojo?",
    animation: "suspicious",
    shake: false,
  },
  {
    quote:
      "Tu entusiasmo me parece sospechoso cuando convenientemente olvidaste diagramar el flujo de compras.",
    animation: "suspicious",
    shake: false,
  },

  // 4. MODO SUEÑO & REALIDAD BIOLÓGICA ("bored")
  {
    quote:
      "¿Programando a las 4 AM? Con 3 horas de sueño encima solo vas a inventar problemas que mañana no sabrás arreglar.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "Cierra la laptop un momento. Tu cerebro está operando con 5% de batería y se nota en la calidad de tus variables.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "El café no es un patrón de diseño ni reemplaza tus horas de sueño. Toma un vaso de agua y vete a descansar.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "Estoy cansado jefe... cansado de ver tantas carpetas huérfanas y funciones de 500 líneas en este proyecto.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "Si me sigues dando clics no te voy a programar la app por arte de magia. Respira hondo y enfócate en una sola cosa.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "No estás bloqueado por falta de talento; estás bloqueado porque llevas 8 horas pegado a la pantalla sin pestañear.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "Mañana con la mente fresca vas a resolver en 10 minutos ese bug que hoy te lleva amargando 3 horas seguidas.",
    animation: "bored",
    shake: false,
  },
  {
    quote:
      "Apaga la pantalla. Las ideas brillantes no se le ocurren a una cabeza deshidratada y con sueño.",
    animation: "bored",
    shake: false,
  },

  // 5. TECH LEAD PRAGMÁTICO & CLARIDAD ("thinking" / "curious")
  {
    quote:
      "Elige el stack con el que seas más rápido hoy. Para experimentar con frameworks raros tienes tus fines de semana.",
    animation: "thinking",
    shake: false,
  },
  {
    quote:
      "Si no puedes explicar la arquitectura de tu software en una servilleta en 2 minutos, está sobrecargada e inflada.",
    animation: "thinking",
    shake: false,
  },
  {
    quote:
      "Código que no está guardado y respaldado en GitHub simplemente no existe en el mundo real. Haz commit ahora.",
    animation: "curious",
    shake: false,
  },
  {
    quote:
      "Primero haz que funcione, luego hazlo ordenado y bonito, y solo al final preocúpate por hacerlo súper rápido.",
    animation: "thinking",
    shake: false,
  },
  {
    quote:
      "Un MVP sencillo y terminado vale 100 veces más que una obra maestra compleja que se quedó al 40% para siempre.",
    animation: "thinking",
    shake: false,
  },
  {
    quote:
      "Un buen archivo README le ahorra 20 horas de preguntas incómodas a tus compañeros y a tus evaluadores.",
    animation: "curious",
    shake: false,
  },
  {
    quote:
      "La mejor tecnología no es la que está de moda en Twitter, sino la que te permite terminar y entregar a tiempo.",
    animation: "thinking",
    shake: false,
  },
  {
    quote:
      "Divide y vencerás: una función grande da pánico, pero cinco pasitos chicos de 10 líneas los hace cualquiera.",
    animation: "curious",
    shake: false,
  },
  {
    quote:
      "Si tu compañero no entiende cómo levantar el proyecto con 2 comandos, el problema no es él, es la documentación.",
    animation: "thinking",
    shake: false,
  },

  // 6. MOTIVACIÓN, LOGRO & HYPE ("celebrate" / "happy" / "proud")
  {
    quote:
      "¡Esa idea tiene potencial real! Mantengamos el alcance bajo control y te aseguro que la rompemos.",
    animation: "proud",
    shake: false,
  },
  {
    quote:
      "¡Menos vuelta en círculos y más acción concreta! Hoy dejamos este plano técnico impecable.",
    animation: "celebrate",
    shake: false,
  },
  {
    quote:
      "¡Me encanta cuando un plan se ve simple, elegante y entregable a tiempo sin tener que sufrir!",
    animation: "happy",
    shake: false,
  },
  {
    quote:
      "¡Si le pones estructura clara desde el minuto cero, tu 'yo' del futuro te va a agradecer de rodillas!",
    animation: "celebrate",
    shake: false,
  },
  {
    quote:
      "¡Eso es todo! La arquitectura es el mapa de ruta, pero tú eres quien conquista y hace realidad el software.",
    animation: "proud",
    shake: false,
  },
  {
    quote:
      "¡Qué satisfacción da ver un proyecto nacer con orden y propósito! Sigamos con el siguiente paso.",
    animation: "happy",
    shake: false,
  },
  {
    quote:
      "¡Viste que no era tan difícil cuando no intentas construir Facebook entero en un solo fin de semana!",
    animation: "celebrate",
    shake: false,
  },
  {
    quote:
      "¡Un paso a la vez! Ya tenemos la idea calibrada; ahora vamos a elegir las herramientas correctas.",
    animation: "proud",
    shake: false,
  },
];
