-- ========================================================
-- DEV.IDEA · Migración v3 (14 estaciones + autoguardado)
-- Ejecútala UNA vez en Supabase (SQL Editor) si tu base ya existía
-- antes de este cambio. Es idempotente: puedes correrla de nuevo sin riesgo.
-- ========================================================

-- 1. Nuevas decisiones: requisitos, historias de usuario y base de datos
ALTER TABLE public.blueprints
  ADD COLUMN IF NOT EXISTS selected_requirements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS selected_user_stories JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS selected_database JSONB DEFAULT NULL,
  -- Ya la usaba la app (estación final) pero faltaba en algunas bases
  ADD COLUMN IF NOT EXISTS architecture_notes TEXT DEFAULT '',
  -- Todas las cartas generadas por estación (para restaurar el mapa completo)
  ADD COLUMN IF NOT EXISTS generated_options JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. El mapa ahora llega hasta la estación 13
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_current_step_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_current_step_check
  CHECK (current_step >= 0 AND current_step <= 13);

-- 3. Refresca la caché de esquema de la API REST de Supabase
NOTIFY pgrst, 'reload schema';
