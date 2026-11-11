"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function MorphismCard({ option, isSelected, isDimmed, onClick }) {
  // Normalizar para que detecte con o sin tildes, mayúsculas o styleKey
  const rawKey =
    `${option.styleKey || ""} ${option.title || ""} ${option.id || ""}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const isBrutal = rawKey.includes("brutal");
  const isGlass = rawKey.includes("glass");
  const isCyber =
    rawKey.includes("cyber") ||
    rawKey.includes("neon") ||
    rawKey.includes("hud");
  const isClay = rawKey.includes("clay");
  const isSkeuo =
    rawKey.includes("skeuo") ||
    rawKey.includes("mecanic") ||
    rawKey.includes("tactil");
  const isTerminal =
    rawKey.includes("terminal") ||
    rawKey.includes("retro") ||
    rawKey.includes("hacker");
  const isAurora = rawKey.includes("aurora") || rawKey.includes("mesh");
  const isPaper =
    rawKey.includes("paper") ||
    rawKey.includes("elevation") ||
    rawKey.includes("material");
  const isNeumorph = rawKey.includes("neumorph");
  const isMinimal =
    !isBrutal &&
    !isGlass &&
    !isCyber &&
    !isClay &&
    !isSkeuo &&
    !isTerminal &&
    !isAurora &&
    !isPaper &&
    !isNeumorph;

  // ==========================================
  // CONFIGURACIÓN DE APARIENCIA POR ESTILO
  // ==========================================
  let containerStyle = "";
  let activeRing = "";
  let badgeStyle = "";
  let titleColor = "text-white";
  let descColor = "text-neutral-300";
  let techChipStyle = "";
  let checkStyle = "";
  let isLightCard = false;

  // 1. NEOBRUTALISM (Blanco y negro duro, cómic, poster)
  if (isBrutal) {
    isLightCard = true;
    containerStyle =
      "bg-[#fffdf7] border-[3px] border-black text-black rounded-none shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000000]";
    activeRing = isSelected
      ? "ring-[3px] ring-amber-400 border-black shadow-[8px_8px_0px_0px_#f59e0b]"
      : "";
    badgeStyle =
      "bg-amber-300 text-black font-black border-2 border-black rounded-none uppercase text-[9px] tracking-wider";
    titleColor = "text-black font-black";
    descColor = "text-neutral-800 font-medium";
    techChipStyle =
      "bg-white text-black font-mono font-bold border-2 border-black rounded-none shadow-[1px_1px_0px_#000]";
    checkStyle = isSelected
      ? "bg-black text-white border-black"
      : "border-black bg-white text-transparent";
  }

  // 2. GLASSMORPHISM (Cristal esmerilado con resplandores internos de luz)
  else if (isGlass) {
    containerStyle =
      "bg-white/[0.05] backdrop-blur-2xl border border-white/20 text-white rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.7)] relative overflow-hidden";
    activeRing = isSelected
      ? "ring-2 ring-cyan-300 border-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.3)]"
      : "";
    badgeStyle =
      "bg-white/10 text-cyan-200 border border-white/30 backdrop-blur-md rounded-full";
    titleColor = "text-white font-semibold";
    descColor = "text-neutral-200/90";
    techChipStyle =
      "bg-white/10 text-neutral-100 border border-white/20 backdrop-blur-sm rounded-lg";
    checkStyle = isSelected
      ? "bg-cyan-400 text-neutral-950 border-cyan-400"
      : "border-white/30 bg-black/40 text-transparent";
  }

  // 3. SKEUOMORPHISM (Biselado metálico, titanio / aluminio pulido con brillo superior de luz)
  else if (isSkeuo) {
    containerStyle =
      "bg-gradient-to-b from-[#242830] via-[#16181d] to-[#0c0d10] border-t-2 border-t-white/40 border-b border-b-black/90 border-x border-neutral-700/60 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    activeRing = isSelected
      ? "ring-2 ring-neutral-300 border-t-white shadow-[0_0_35px_rgba(255,255,255,0.25)]"
      : "";
    badgeStyle =
      "bg-gradient-to-b from-neutral-700 to-neutral-800 border-t border-white/30 border-b border-black text-neutral-200 font-medium rounded-md shadow-sm";
    titleColor =
      "text-neutral-100 font-bold tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]";
    descColor = "text-neutral-300 text-[11px]";
    techChipStyle =
      "bg-gradient-to-b from-neutral-800 to-neutral-900 border-t border-white/15 border-b border-black text-neutral-300 rounded-md shadow-inner";
    checkStyle = isSelected
      ? "bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950 border-white shadow-md"
      : "border-neutral-600 bg-neutral-900 text-transparent";
  }

  // 4. CLAYMORPHISM (Volumen de arcilla 3D inflada con doble sombra interior)
  else if (isClay) {
    containerStyle =
      "bg-[#1f2029] border border-violet-400/40 rounded-3xl shadow-[inset_0_-8px_16px_rgba(0,0,0,0.7),inset_0_5px_10px_rgba(255,255,255,0.25),0_18px_35px_rgba(0,0,0,0.6)]";
    activeRing = isSelected
      ? "ring-2 ring-violet-400 border-violet-400 shadow-[0_0_35px_rgba(167,139,250,0.4)]"
      : "";
    badgeStyle =
      "bg-violet-950 border border-violet-600 text-violet-200 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]";
    titleColor = "text-white font-bold";
    descColor = "text-neutral-200";
    techChipStyle =
      "bg-[#282a36] text-violet-200 border border-violet-900/80 rounded-xl shadow-inner";
    checkStyle = isSelected
      ? "bg-violet-400 text-neutral-950 border-violet-400 shadow-md"
      : "border-violet-700 bg-neutral-950 text-transparent";
  }

  // 5. CYBERPUNK / HUD (Neón angular con cortes futuristas y acentos cian)
  else if (isCyber) {
    containerStyle =
      "bg-[#040810] border border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)] rounded-xl relative overflow-hidden font-mono";
    activeRing = isSelected
      ? "ring-2 ring-cyan-400 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.5)]"
      : "";
    badgeStyle =
      "bg-cyan-950 text-cyan-300 border border-cyan-400 text-[9px] uppercase tracking-widest";
    titleColor = "text-cyan-300 font-mono tracking-tight font-bold";
    descColor = "text-neutral-400 font-mono";
    techChipStyle = "bg-black border border-cyan-800 text-cyan-400 text-[10px]";
    checkStyle = isSelected
      ? "bg-cyan-400 text-black border-cyan-400"
      : "border-cyan-800 bg-neutral-900 text-transparent";
  }

  // 6. RETRO TERMINAL (Consola hacker con fósforo verde)
  else if (isTerminal) {
    containerStyle =
      "bg-[#030d06] border-2 border-emerald-500/80 rounded-sm font-mono shadow-[0_0_20px_rgba(16,185,129,0.25)]";
    activeRing = isSelected
      ? "ring-2 ring-emerald-400 border-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.45)]"
      : "";
    badgeStyle =
      "bg-emerald-950 border border-emerald-500 text-emerald-400 text-[9px]";
    titleColor = "text-emerald-400 font-mono font-bold";
    descColor = "text-emerald-300/80 font-mono text-[11px]";
    techChipStyle =
      "bg-black border border-emerald-800 text-emerald-400 text-[10px]";
    checkStyle = isSelected
      ? "bg-emerald-400 text-black border-emerald-400"
      : "border-emerald-800 bg-black text-transparent";
  }

  // 7. NEUMORPHISM (Relieve extruido táctil con doble sombra cóncava)
  else if (isNeumorph) {
    containerStyle =
      "bg-[#141518] border border-neutral-800/40 rounded-2xl shadow-[8px_8px_16px_#070709,-8px_-8px_16px_#212327]";
    activeRing = isSelected
      ? "ring-1 ring-sky-400 shadow-[inset_4px_4px_8px_#070709,inset_-4px_-4px_8px_#212327]"
      : "";
    badgeStyle =
      "bg-[#141518] border border-neutral-800 text-sky-400 rounded-lg shadow-[2px_2px_4px_#070709,-2px_-2px_4px_#212327]";
    titleColor = "text-neutral-100 font-semibold";
    descColor = "text-neutral-400";
    techChipStyle =
      "bg-[#141518] border border-neutral-800 text-neutral-300 rounded-md shadow-inner";
    checkStyle = isSelected
      ? "bg-sky-400 text-black border-sky-400"
      : "border-neutral-700 bg-neutral-900 text-transparent";
  }

  // 8. PAPERCRAFT (Hojas de papel con sombra flotante profunda)
  else if (isPaper) {
    isLightCard = true;
    containerStyle =
      "bg-[#f5f3ef] border border-neutral-300 text-neutral-900 rounded-xl shadow-[0_22px_30px_-5px_rgba(0,0,0,0.5),0_10px_12px_-5px_rgba(0,0,0,0.3)]";
    activeRing = isSelected
      ? "ring-2 ring-neutral-800 border-neutral-800 shadow-[0_28px_40px_-5px_rgba(0,0,0,0.7)]"
      : "";
    badgeStyle =
      "bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-md font-sans font-medium";
    titleColor = "text-neutral-900 font-bold";
    descColor = "text-neutral-700";
    techChipStyle =
      "bg-white text-neutral-800 border border-neutral-300 rounded-md shadow-sm";
    checkStyle = isSelected
      ? "bg-neutral-900 text-white border-neutral-900"
      : "border-neutral-400 bg-white text-transparent";
  }

  // 9. AURORA MESH (Degradado luminoso esmeralda/morado)
  else if (isAurora) {
    containerStyle =
      "bg-gradient-to-br from-[#07130f] via-[#0b0c14] to-[#12081f] border border-emerald-500/40 rounded-3xl shadow-[0_15px_35px_rgba(16,185,129,0.15)] relative overflow-hidden";
    activeRing = isSelected
      ? "ring-2 ring-emerald-400 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)]"
      : "";
    badgeStyle =
      "bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 rounded-full";
    titleColor = "text-white font-bold";
    descColor = "text-neutral-300";
    techChipStyle =
      "bg-neutral-900/90 border border-emerald-900/80 text-emerald-200 rounded-lg";
    checkStyle = isSelected
      ? "bg-emerald-400 text-neutral-950 border-emerald-400"
      : "border-neutral-700 bg-black/60 text-transparent";
  }

  // 10. MINIMALIST FLAT (Vercel / Linear: gris mate quirúrgico con rejilla técnica)
  else {
    containerStyle =
      "bg-[#0d0e12] border border-neutral-700/80 rounded-2xl shadow-none relative overflow-hidden";
    activeRing = isSelected
      ? "border-white ring-1 ring-white bg-[#13151b]"
      : "";
    badgeStyle =
      "bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono rounded-md";
    titleColor = "text-neutral-100 font-semibold tracking-tight";
    descColor = "text-neutral-400";
    techChipStyle =
      "bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-md";
    checkStyle = isSelected
      ? "bg-white text-neutral-950 border-white"
      : "border-neutral-700 bg-neutral-900 text-transparent";
  }

  return (
    <motion.div
      whileHover={!isDimmed ? { y: -3 } : {}}
      whileTap={!isDimmed ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`w-full p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 select-none ${containerStyle} ${activeRing} ${
        isDimmed ? "opacity-35 grayscale pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Fondo técnico punteado exclusivo para Minimalist */}
      {isMinimal && (
        <div
          className="absolute inset-0 pointer-events-none -z-10 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#ffffff 0.75px, transparent 0.75px)",
            backgroundSize: "14px 14px",
          }}
        />
      )}

      {/* Orbes de luz traseras exclusivas para Glassmorphism */}
      {isGlass && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full blur-2xl opacity-45" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-2xl opacity-40" />
        </div>
      )}

      {/* Resplandor fluido exclusivo para Aurora */}
      {isAurora && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />
        </div>
      )}

      {/* Cabecera de la tarjeta */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span
            className={`text-[9px] sm:text-[10px] px-2 py-0.5 ${badgeStyle}`}
          >
            {option.tag || "Estilo"}
          </span>

          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${checkStyle}`}
          >
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </div>
        </div>

        <h3 className={`text-sm sm:text-base mb-1 ${titleColor}`}>
          {option.title}
        </h3>
        <p
          className={`text-[11px] sm:text-xs leading-relaxed mb-3 ${descColor}`}
        >
          {option.summary}
        </p>

        {/* Chips de tecnologías y tokens */}
        {option.techs?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {option.techs.map((tech) => (
              <span
                key={tech}
                className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 ${techChipStyle}`}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pros y contras con contraste calibrado */}
      <div
        className={`pt-2.5 border-t text-[10px] sm:text-[11px] space-y-1 ${
          isLightCard ? "border-neutral-300" : "border-neutral-800/80"
        }`}
      >
        {option.pros && (
          <div
            className={`flex items-baseline gap-1.5 ${isLightCard ? "text-emerald-700" : "text-emerald-400"}`}
          >
            <span className="font-mono font-bold shrink-0">+</span>
            <span className="leading-snug">{option.pros}</span>
          </div>
        )}
        {option.cons && (
          <div
            className={`flex items-baseline gap-1.5 ${isLightCard ? "text-neutral-600" : "text-neutral-400"}`}
          >
            <span className="font-mono font-bold shrink-0">-</span>
            <span className="leading-snug">{option.cons}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
