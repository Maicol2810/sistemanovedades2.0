/*
  # Crear tabla de enfermería

  1. Nueva Tabla
    - `enfermeria`
      - `id` (uuid, primary key)
      - `nombre` (text, not null)
      - `cargo` (text, not null)
      - `dependencia` (text, not null)
      - `sintomas` (text, not null)
      - `antecedentes_salud` (text, not null)
      - `observaciones` (text, nullable)
      - `created_at` (timestamp with timezone, default now())
      - `created_by` (uuid, foreign key to users)

  2. Seguridad
    - Enable RLS en tabla `enfermeria`
    - Políticas de acceso basadas en permisos de usuario
*/

-- Crear tabla de enfermería
CREATE TABLE IF NOT EXISTS enfermeria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  cargo text NOT NULL,
  dependencia text NOT NULL,
  sintomas text NOT NULL,
  antecedentes_salud text NOT NULL,
  observaciones text,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id)
);

-- Habilitar RLS
ALTER TABLE enfermeria ENABLE ROW LEVEL SECURITY;

-- Política para lectura
CREATE POLICY "Users can read enfermeria with permission"
  ON enfermeria
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'enfermeria' AND up.can_read = true))
    )
  );

-- Política para inserción
CREATE POLICY "Users can insert enfermeria with permission"
  ON enfermeria
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'enfermeria' AND up.can_create = true))
    )
  );

-- Política para actualización
CREATE POLICY "Users can update enfermeria with permission"
  ON enfermeria
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'enfermeria' AND up.can_update = true))
    )
  );

-- Política para eliminación
CREATE POLICY "Users can delete enfermeria with permission"
  ON enfermeria
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'Admin' OR (up.module = 'enfermeria' AND up.can_delete = true))
    )
  );

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_enfermeria_nombre ON enfermeria(nombre);
CREATE INDEX IF NOT EXISTS idx_enfermeria_cargo ON enfermeria(cargo);
CREATE INDEX IF NOT EXISTS idx_enfermeria_dependencia ON enfermeria(dependencia);
CREATE INDEX IF NOT EXISTS idx_enfermeria_created_by ON enfermeria(created_by);