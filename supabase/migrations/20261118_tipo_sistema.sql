-- ========================================================
-- DEV.IDEA · Migración v4 (estación "Tipo de sistema")
-- Ejecútala UNA vez en Supabase (SQL Editor). Es idempotente: si la columna
-- ya existe, no vuelve a correr los pasos guardados.
-- ========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blueprints'
      AND column_name = 'selected_system_type'
  ) THEN
    -- 1. Nueva decisión: tipo de sistema (con sus superficies)
    ALTER TABLE public.blueprints
      ADD COLUMN selected_system_type JSONB DEFAULT NULL;

    -- 2. "Tipo de sistema" es la nueva estación 2: las cartas guardadas de la
    --    estación 2 en adelante se corren un puesto
    UPDATE public.blueprints b
    SET generated_options = COALESCE((
      SELECT jsonb_object_agg(
        CASE
          WHEN e.key ~ '^\d+$' AND e.key::int >= 2 THEN (e.key::int + 1)::text
          ELSE e.key
        END,
        e.value
      )
      FROM jsonb_each(b.generated_options) AS e
    ), '{}'::jsonb)
    WHERE b.generated_options IS NOT NULL
      AND b.generated_options <> '{}'::jsonb;

    -- 3. El mapa llega ahora hasta la estación 14
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_current_step_check;
    UPDATE public.projects SET current_step = current_step + 1 WHERE current_step >= 2;
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_current_step_check
      CHECK (current_step >= 0 AND current_step <= 14);
  END IF;
END $$;

-- 4. Refresca la caché de esquema de la API REST de Supabase
NOTIFY pgrst, 'reload schema';
