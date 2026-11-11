"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// true solo en el cliente (createPortal necesita document); sin setState en efectos
const subscribeNoop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  tag = "Advertencia",
}) {
  const isClient = useIsClient();
  if (!isClient) return null;

  // AnimatePresence permanece montado para que la salida del modal se anime
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-modal"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
        >
          {/* Fondo con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal responsivo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-neutral-950/95 border border-neutral-800/90 p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10 flex flex-col gap-4 sm:gap-5 z-10 select-none"
          >
            <div className="flex items-start justify-between">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 sm:py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400">
                {tag}
              </span>

              <button
                type="button"
                onClick={onClose}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-1.5 sm:mt-2 leading-relaxed font-sans">
                {description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-900">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer shadow-lg active:scale-95 ${
                  variant === "danger"
                    ? "bg-red-950 border border-red-800 text-red-200 hover:bg-red-900"
                    : "bg-white text-neutral-950 hover:bg-neutral-200"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
