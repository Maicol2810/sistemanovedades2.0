/*
  # Crear tabla de incapacidades

  1. Nueva Tabla
    - `incapacidades`
      - `id` (uuid, primary key)
      - `numero_id` (text, not null) - Número de identificación
      - `nombre_completo` (text, not null)
      - `fecha_inicio` (date, not null)
      - `fecha_fin` (date, not null)
      - `dias_incapacidad` (integer, not null) - Calculado automáticamente
      - `diagnostico` (text, not null)
      - `tipo_incapacidad` (text, not null)
      - `created_at` (timestamp with timezone, default now())
      - `created_by` (uuid, foreign key to users)

  2. Seguridad
    - Enable RLS en tabla `incapacidades`
    - Políticas de acceso basadas en permisos de usuario
*/

-- Crear tabla de incapacidades
CREATE TABLE IF NOT EXISTS incapacidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_id text NOT NULL,
  nombre_completo text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  dias_incapacidad integer NOT NULL DEFAULT 0,
  diagnostico text NOT NULL,
  tipo_incapacidad text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id)
);

-- Habilitar RLS
ALTER TABLE incapacidades ENABLE ROW LEVEL SECURITY;

-- Política para lectura
CREATE POLICY "Users can read incapacidades with permission"
  ON incapacidades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'incapacidades' AND up.can_read = true))
    )
  );

-- Política para inserción
CREATE POLICY "Users can insert incapacidades with permission"
  ON incapacidades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'incapacidades' AND up.can_create = true))
    )
  );

-- Política para actualización
CREATE POLICY "Users can update incapacidades with permission"
  ON incapacidades
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'incapacidades' AND up.can_update = true))
    )
  );

-- Política para eliminación
CREATE POLICY "Users can delete incapacidades with permission"
  ON incapacidades
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'incapacidades' AND up.can_delete = true))
    )
  );

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_incapacidades_numero_id ON incapacidades(numero_id);
CREATE INDEX IF NOT EXISTS idx_incapacidades_fecha_inicio ON incapacidades(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_incapacidades_tipo ON incapacidades(tipo_incapacidad);
CREATE INDEX IF NOT EXISTS idx_incapacidades_created_by ON incapacidades(created_by);