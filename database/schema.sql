-- ============================================
-- SCRIPT DE INSTALACIÓN/ACTUALIZACIÓN COMPLETO
-- Ejecuta este archivo completo en SQL Editor
-- ============================================

-- Tabla para almacenar los proyectos de Supabase a monitorear
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  api_key TEXT NOT NULL,
  last_ping TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_projects_last_ping ON projects(last_ping);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEGURIDAD: Row Level Security (RLS)
-- ============================================

-- Eliminar políticas existentes si existen (para actualización limpia)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer proyectos" ON projects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear proyectos" ON projects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar proyectos" ON projects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar proyectos" ON projects;
DROP POLICY IF EXISTS "Sistema puede actualizar last_ping" ON projects;

-- Habilitar RLS en la tabla projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Política 1: Solo usuarios autenticados pueden leer proyectos
CREATE POLICY "Usuarios autenticados pueden leer proyectos"
ON projects
FOR SELECT
TO authenticated
USING (true);

-- Política 2: Solo usuarios autenticados pueden insertar proyectos
CREATE POLICY "Usuarios autenticados pueden crear proyectos"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política 3: Solo usuarios autenticados pueden actualizar proyectos
CREATE POLICY "Usuarios autenticados pueden actualizar proyectos"
ON projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política 4: Solo usuarios autenticados pueden eliminar proyectos
CREATE POLICY "Usuarios autenticados pueden eliminar proyectos"
ON projects
FOR DELETE
TO authenticated
USING (true);

-- Política 5: Permitir al cron job actualizar last_ping
-- El cron usa la publishable key (anon role) para actualizar last_ping
CREATE POLICY "Sistema puede actualizar last_ping"
ON projects
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- FIN DE POLÍTICAS RLS
-- ============================================

-- Comentarios para documentación
COMMENT ON TABLE projects IS 'Almacena los proyectos de Supabase que necesitan keep-alive. Protegido con RLS - solo usuarios autenticados pueden acceder.';
COMMENT ON COLUMN projects.name IS 'Nombre descriptivo del proyecto';
COMMENT ON COLUMN projects.url IS 'URL del proyecto Supabase';
COMMENT ON COLUMN projects.api_key IS 'API Key anónima (pública) del proyecto';
COMMENT ON COLUMN projects.last_ping IS 'Última vez que se ejecutó el keep-alive en este proyecto';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verifica que RLS esté habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'projects'
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ Row Level Security está HABILITADO en la tabla projects';
    ELSE
        RAISE WARNING '⚠️ Row Level Security NO está habilitado';
    END IF;
END $$;

-- Contar políticas creadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projects';
    
    RAISE NOTICE '✅ Se han creado % políticas de seguridad', policy_count;
END $$;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE projects IS 'Almacena los proyectos de Supabase que necesitan keep-alive';
COMMENT ON COLUMN projects.name IS 'Nombre descriptivo del proyecto';
COMMENT ON COLUMN projects.url IS 'URL del proyecto Supabase';
COMMENT ON COLUMN projects.api_key IS 'API Key anónima (pública) del proyecto';
COMMENT ON COLUMN projects.last_ping IS 'Última vez que se ejecutó el keep-alive en este proyecto';
