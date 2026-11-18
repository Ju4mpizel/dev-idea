-- ========================================================
-- DEV.IDEA · Migración v5 (límite de ideas por usuario)
-- Ejecútala UNA vez en Supabase (SQL Editor) ANTES de desplegar el código
-- que la usa. Es idempotente: puedes correrla de nuevo sin riesgo.
--
-- Una "idea" es una ruta completa por las estaciones. Cada usuario puede abrir
-- como máximo 2 ideas cada 3 horas (ventana móvil) y cada idea admite hasta 40
-- generaciones de Gemini. Las cuentas de DEV_TOOLS_EMAILS (variable de servidor)
-- no pasan por aquí: el servidor las deja generar sin ticket.
-- ========================================================

-- 1. Tickets de idea (uno por ruta)
CREATE TABLE IF NOT EXISTS public.idea_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Texto congelado de la idea: el servidor usa este, no el que manda el navegador
  idea TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT 'startup' CHECK (context IN ('academic', 'startup', 'personal')),
  generations INTEGER NOT NULL DEFAULT 0 CHECK (generations >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idea_runs_user_created
  ON public.idea_runs(user_id, created_at DESC);

-- 2. Cada proyecto recuerda su ticket (borrar el proyecto NO libera el cupo)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS idea_run_id UUID REFERENCES public.idea_runs(id) ON DELETE SET NULL;

-- 3. RLS: cada usuario solo LEE sus tickets. Sin políticas de escritura: solo
--    las funciones de abajo (SECURITY DEFINER) crean tickets o suman generaciones.
ALTER TABLE public.idea_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen sus ideas" ON public.idea_runs;
CREATE POLICY "Usuarios leen sus ideas"
  ON public.idea_runs FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Cupo actual del usuario (los límites viven SOLO en estas funciones)
CREATE OR REPLACE FUNCTION public.idea_quota()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_used INTEGER;
  v_oldest TIMESTAMPTZ;
  c_limit CONSTANT INTEGER := 2;
  c_window CONSTANT INTERVAL := interval '3 hours';
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '28000';
  END IF;

  SELECT count(*), min(created_at) INTO v_used, v_oldest
  FROM public.idea_runs
  WHERE user_id = v_uid AND created_at > now() - c_window;

  RETURN jsonb_build_object(
    'used', v_used,
    'limit', c_limit,
    'next_free_at', CASE WHEN v_used >= c_limit THEN v_oldest + c_window END
  );
END;
$$;

-- 5. Abre una idea nueva si queda cupo. El bloqueo por usuario evita que dos
--    pestañas a la vez se cuelen una tercera idea.
CREATE OR REPLACE FUNCTION public.claim_idea_run(p_idea TEXT, p_context TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_used INTEGER;
  v_oldest TIMESTAMPTZ;
  v_id UUID;
  c_limit CONSTANT INTEGER := 2;
  c_window CONSTANT INTERVAL := interval '3 hours';
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '28000';
  END IF;
  IF coalesce(btrim(p_idea), '') = '' THEN
    RAISE EXCEPTION 'La idea está vacía' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('idea_runs:' || v_uid::text));

  SELECT count(*), min(created_at) INTO v_used, v_oldest
  FROM public.idea_runs
  WHERE user_id = v_uid AND created_at > now() - c_window;

  IF v_used >= c_limit THEN
    RETURN jsonb_build_object(
      'ok', false,
      'used', v_used,
      'limit', c_limit,
      'next_free_at', v_oldest + c_window
    );
  END IF;

  INSERT INTO public.idea_runs (user_id, idea, context)
  VALUES (
    v_uid,
    left(btrim(p_idea), 600),
    CASE WHEN p_context IN ('academic', 'startup', 'personal') THEN p_context ELSE 'startup' END
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'ok', true,
    'id', v_id,
    'used', v_used + 1,
    'limit', c_limit,
    'next_free_at', CASE WHEN v_used + 1 >= c_limit THEN coalesce(v_oldest, now()) + c_window END
  );
END;
$$;

-- 6. Gasta una generación de un ticket propio (dueño + tope en un solo paso).
--    Devuelve la idea congelada, o NULL si el ticket no es tuyo o llegó al tope.
CREATE OR REPLACE FUNCTION public.use_idea_generation(p_run UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.idea_runs%ROWTYPE;
  c_max CONSTANT INTEGER := 40;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '28000';
  END IF;

  UPDATE public.idea_runs
  SET generations = generations + 1
  WHERE id = p_run AND user_id = auth.uid() AND generations < c_max
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'idea', v_row.idea,
    'context', v_row.context,
    'generations', v_row.generations,
    'max', c_max
  );
END;
$$;

-- Solo usuarios con sesión pueden llamarlas
REVOKE ALL ON FUNCTION public.idea_quota() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_idea_run(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.use_idea_generation(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.idea_quota() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_idea_run(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_idea_generation(UUID) TO authenticated;

-- 7. Proyectos que ya existían: un ticket por proyecto, fechado fuera de la
--    ventana de 3 horas para que no consuman el cupo actual de nadie.
DO $$
DECLARE
  r RECORD;
  v_id UUID;
BEGIN
  FOR r IN
    SELECT p.id, p.user_id, p.created_at,
           coalesce(b.idea, '') AS idea,
           coalesce(b.context, 'startup') AS context
    FROM public.projects p
    LEFT JOIN public.blueprints b ON b.project_id = p.id
    WHERE p.idea_run_id IS NULL
  LOOP
    INSERT INTO public.idea_runs (user_id, idea, context, created_at)
    VALUES (
      r.user_id,
      left(r.idea, 600),
      r.context,
      least(r.created_at, now() - interval '3 hours 1 minute')
    )
    RETURNING id INTO v_id;

    UPDATE public.projects SET idea_run_id = v_id WHERE id = r.id;
  END LOOP;
END;
$$;

-- 8. Refresca la caché de esquema de la API REST de Supabase
NOTIFY pgrst, 'reload schema';
