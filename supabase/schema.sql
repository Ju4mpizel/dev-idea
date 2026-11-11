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
  current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0 AND current_step <= 10),
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
  selected_name TEXT DEFAULT '',
  selected_stack JSONB DEFAULT NULL,
  selected_architecture JSONB DEFAULT NULL,
  selected_methodology JSONB DEFAULT NULL,
  selected_diagrams JSONB DEFAULT '[]'::jsonb,
  selected_style JSONB DEFAULT NULL,
  selected_layout JSONB DEFAULT NULL,
  selected_deploy JSONB DEFAULT NULL,
  selected_ai_ecosystem JSONB DEFAULT NULL,
  architecture_notes TEXT DEFAULT '',
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
