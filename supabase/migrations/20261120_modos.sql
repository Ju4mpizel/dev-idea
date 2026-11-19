-- ========================================================
-- DEV.IDEA · Migración v6 (modos del recorrido)
-- Ejecútala UNA vez en Supabase (SQL Editor) ANTES de desplegar el código que
-- la usa: el autoguardado escribe la columna `mode` en cada blueprint.
-- Es idempotente: puedes correrla de nuevo sin riesgo.
--
-- Modos: quick (Rápido), standard (Estándar) y complete (Completo). Los
-- proyectos que ya existían quedan en "complete", que es como se recorrían.
-- ========================================================

ALTER TABLE public.blueprints
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'complete';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blueprints_mode_check'
  ) THEN
    ALTER TABLE public.blueprints
      ADD CONSTRAINT blueprints_mode_check
      CHECK (mode IN ('quick', 'standard', 'complete'));
  END IF;
END;
$$;

-- Refresca la caché de esquema de la API REST de Supabase
NOTIFY pgrst, 'reload schema';
