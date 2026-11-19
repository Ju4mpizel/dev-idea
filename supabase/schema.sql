-- ========================================================
-- DEV.IDEA - ESQUEMA COMPLETO Y DEFINITIVO (SUPABASE)
-- Fuente de verdad única de la base de datos.
-- El mapeo blueprint (store) <-> columnas vive en src/config/stations.config.js
-- (blueprintToDbRow / dbRowToBlueprint): mantén ambos sincronizados.
-- ========================================================

-- 1. TABLA: PROFILES (Sincronizada con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Proyecto sin nombre',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COMPLETED', 'ARCHIVED')),
  current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0 AND current_step <= 14),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 3. TABLA: BLUEPRINTS (Relación 1 a 1 estricta con projects)
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  idea TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT 'startup' CHECK (context IN ('academic', 'startup', 'personal')),
  mode TEXT NOT NULL DEFAULT 'complete' CHECK (mode IN ('quick', 'standard', 'complete')),
  selected_name TEXT DEFAULT '',
  selected_system_type JSONB DEFAULT NULL,
  selected_requirements JSONB DEFAULT '[]'::jsonb,
  selected_user_stories JSONB DEFAULT '[]'::jsonb,
  selected_stack JSONB DEFAULT NULL,
  selected_database JSONB DEFAULT NULL,
  selected_architecture JSONB DEFAULT NULL,
  selected_methodology JSONB DEFAULT NULL,
  selected_diagrams JSONB DEFAULT '[]'::jsonb,
  selected_style JSONB DEFAULT NULL,
  selected_layout JSONB DEFAULT NULL,
  selected_deploy JSONB DEFAULT NULL,
  selected_ai_ecosystem JSONB DEFAULT NULL,
  architecture_notes TEXT DEFAULT '',
  -- Todas las cartas que generó Gemini por estación ({ "1": {...}, "2": {...} })
  generated_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON public.blueprints(project_id);

-- 4. TRIGGERS: ACTUALIZACIÓN AUTOMÁTICA DE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_blueprints_updated_at ON public.blueprints;
CREATE TRIGGER tr_blueprints_updated_at
  BEFORE UPDATE ON public.blueprints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. TRIGGER: AUTO-CREACIÓN DE PERFIL TRAS LOGIN CON GOOGLE OAUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

-- Políticas en Profiles
DROP POLICY IF EXISTS "Usuarios leen su perfil" ON public.profiles;
CREATE POLICY "Usuarios leen su perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON public.profiles;
CREATE POLICY "Usuarios actualizan su perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas en Projects (Filtrado por usuario y disponibilidad lógica)
DROP POLICY IF EXISTS "CRUD propio en projects" ON public.projects;
CREATE POLICY "CRUD propio en projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas en Blueprints (Aislamiento vinculado al propietario del proyecto)
DROP POLICY IF EXISTS "CRUD propio en blueprints" ON public.blueprints;
CREATE POLICY "CRUD propio en blueprints"
  ON public.blueprints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = blueprints.project_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = blueprints.project_id
      AND p.user_id = auth.uid()
    )
  );

-- 7. LÍMITE DE IDEAS (2 ideas cada 8 horas; 40 generaciones por idea)
-- Las cuentas de DEV_TOOLS_EMAILS (variable de servidor) no pasan por aquí.
-- 7.1 Tickets de idea (uno por ruta)
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

-- 7.2 Cada proyecto recuerda su ticket (borrar el proyecto NO libera el cupo)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS idea_run_id UUID REFERENCES public.idea_runs(id) ON DELETE SET NULL;

-- 7.3 RLS: cada usuario solo LEE sus tickets. Sin políticas de escritura: solo
--    las funciones de abajo (SECURITY DEFINER) crean tickets o suman generaciones.
ALTER TABLE public.idea_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen sus ideas" ON public.idea_runs;
CREATE POLICY "Usuarios leen sus ideas"
  ON public.idea_runs FOR SELECT
  USING (auth.uid() = user_id);

-- 7.4 Cupo actual del usuario (los límites viven SOLO en estas funciones)
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

-- 7.5 Abre una idea nueva si queda cupo. El bloqueo por usuario evita que dos
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

-- 7.6 Gasta una generación de un ticket propio (dueño + tope en un solo paso).
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
