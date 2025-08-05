/*
  # Crear tabla de novedades

  1. Nueva Tabla
    - `novedades`
      - `id` (uuid, primary key)
      - `cedula` (text, not null) - Número de cédula
      - `nombre` (text, not null) - Nombre completo
      - `tipo_planta` (text, not null) - Docente, Administrativo, Aprendiz
      - `fecha_inicio` (date, not null)
      - `hora_inicio` (time, not null)
      - `fecha_fin` (date, not null)
      - `hora_fin` (time, not null)
      - `horas_ausencia` (numeric, not null) - Calculado automáticamente
      - `tipo_novedad` (text, not null) - Permiso, Calamidad, etc.
      - `observacion` (text, nullable)
      - `created_at` (timestamp with timezone, default now())
      - `created_by` (uuid, foreign key to users)

  2. Seguridad
    - Enable RLS en tabla `novedades`
    - Política para que usuarios con permisos puedan gestionar novedades
*/

-- Crear tabla de novedades
CREATE TABLE IF NOT EXISTS novedades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula text NOT NULL,
  nombre text NOT NULL,
  tipo_planta text NOT NULL DEFAULT 'Docente',
  fecha_inicio date NOT NULL,
  hora_inicio time NOT NULL,
  fecha_fin date NOT NULL,
  hora_fin time NOT NULL,
  horas_ausencia numeric NOT NULL DEFAULT 0,
  tipo_novedad text NOT NULL DEFAULT 'Permiso',
  observacion text,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id)
);

-- Habilitar RLS
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;

-- Política para lectura - usuarios con permiso de lectura en novedades
CREATE POLICY "Users can read novedades with permission"
  ON novedades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'novedades' AND up.can_read = true))
    )
  );

-- Política para inserción - usuarios con permiso de creación
CREATE POLICY "Users can insert novedades with permission"
  ON novedades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'novedades' AND up.can_create = true))
    )
  );

-- Política para actualización - usuarios con permiso de actualización
CREATE POLICY "Users can update novedades with permission"
  ON novedades
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'novedades' AND up.can_update = true))
    )
  );

-- Política para eliminación - usuarios con permiso de eliminación
CREATE POLICY "Users can delete novedades with permission"
  ON novedades
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'novedades' AND up.can_delete = true))
    )
  );

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_novedades_cedula ON novedades(cedula);
CREATE INDEX IF NOT EXISTS idx_novedades_fecha_inicio ON novedades(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_novedades_tipo_novedad ON novedades(tipo_novedad);
CREATE INDEX IF NOT EXISTS idx_novedades_created_by ON novedades(created_by);