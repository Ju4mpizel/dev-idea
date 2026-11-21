-- ========================================================
-- DEV.IDEA · Migración v8 (devolver generaciones fallidas)
-- Ejecútala UNA vez en Supabase (SQL Editor). Es idempotente.
--
-- Cada generación descuenta 1 del ticket de la idea ANTES de llamar a Gemini.
-- Si Gemini falla, se agota el tiempo o el usuario cancela, el servidor la
-- devuelve con esta función: un error nuestro no le cuesta cupo a nadie.
-- Mientras no la corras, la app sigue funcionando (solo no devuelve).
-- ========================================================

CREATE OR REPLACE FUNCTION public.refund_idea_generation(p_run UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '28000';
  END IF;

  -- Solo el dueño, y nunca por debajo de 0
  UPDATE public.idea_runs
  SET generations = generations - 1
  WHERE id = p_run AND user_id = auth.uid() AND generations > 0;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_idea_generation(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refund_idea_generation(UUID) TO authenticated;

-- Refresca la caché de esquema de la API REST de Supabase
NOTIFY pgrst, 'reload schema';
