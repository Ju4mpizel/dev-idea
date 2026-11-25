"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";
import { StrobiAvatar } from "@/components/companion/StrobiAvatar";

const EASE = [0.16, 1, 0.3, 1];

/** Lo que dice Dev-i en cada momento de la sesión. */
const COPY = {
  login: {
    mood: "excited",
    title: "Conectando con Google…",
    subtitle: "Al volver te espero en la Estación 0.",
  },
  welcome: {
    mood: "happy",
    title: (name) => (name ? `¡Hola, ${name}!` : "¡Bienvenido!"),
    subtitle: "Preparando tu Estación 0…",
  },
  logout: {
    mood: "drowsy",
    title: "¡Hasta pronto!",
    subtitle: "Cerrando tu sesión. Tus mapas quedan guardados.",
  },
};

/**
 * Pantalla de transición al iniciar o cerrar sesión: cubre la página con un
 * fundido, Dev-i aparece con un mensaje y una barra con los colores de las
 * cuatro fases avanza. Al quitarla (transition = null) se desvanece y deja ver
 * la Estación 0 o la portada, que entran con su propia animación.
 */
export function AuthTransition({ transition }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          key="auth-transition"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
          className="fixed inset-0 z-[100] grid place-items-center bg-neutral-950 px-6"
        >
          <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] max-w-full bg-neutral-800/25 blur-[120px] rounded-full pointer-events-none" />

          <TransitionCard
            key={transition.kind}
            transition={transition}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TransitionCard({ transition, reduceMotion }) {
  const copy = COPY[transition.kind] || COPY.welcome;
  const title =
    typeof copy.title === "function" ? copy.title(transition.name) : copy.title;
  const fast = reduceMotion ? 0 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 * fast, scale: 1 - 0.04 * fast }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 * fast, scale: 1 + 0.03 * fast }}
      transition={{ duration: 0.5 * fast, ease: EASE, delay: 0.08 * fast }}
      className="relative flex flex-col items-center text-center gap-5"
    >
      <DevIdeaLogo variant="icon" height={28} className="text-neutral-500" />

      <motion.div
        initial={{ scale: 0.6 * fast || 1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 18, delay: 0.15 }
        }
      >
        <StrobiAvatar size={132} mood={copy.mood} />
      </motion.div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xl sm:text-2xl font-semibold text-neutral-100">
          {title}
        </p>
        <p className="text-sm sm:text-base text-neutral-400">{copy.subtitle}</p>
      </div>

      {/* Barra de progreso con los colores de las cuatro fases */}
      <div className="w-56 h-1.5 rounded-full bg-neutral-900 overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: reduceMotion ? 0 : (transition.duration ?? 1200) / 1000,
            ease: [0.65, 0, 0.35, 1],
          }}
          style={{
            originX: 0,
            background: "linear-gradient(90deg, #f59e0b, #38bdf8, #a78bfa, #34d399)",
          }}
          className="h-full w-full rounded-full"
        />
      </div>
    </motion.div>
  );
}
