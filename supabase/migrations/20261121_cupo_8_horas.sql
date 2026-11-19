-- ========================================================
-- DEV.IDEA · Migración v7 (cupo de ideas: 2 cada 8 horas)
-- Ejecútala UNA vez en Supabase (SQL Editor). Es idempotente.
--
-- Solo cambia la ventana del cupo de 3 a 8 horas en las funciones
-- idea_quota y claim_idea_run. Las ideas ya abiertas se siguen contando
-- dentro de la nueva ventana de 8 horas.
-- ========================================================

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
  c_window CONSTANT INTERVAL := interval '8 hours';
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
  c_window CONSTANT INTERVAL := interval '8 hours';
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

-- Refresca la caché de esquema de la API REST de Supabase

NOTIFY pgrst, 'reload schema';
