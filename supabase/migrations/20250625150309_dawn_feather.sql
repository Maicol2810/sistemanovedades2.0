/*
  # Crear sistema de permisos por módulo

  1. Nueva Tabla
    - `user_permissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `module` (text, not null) - Nombre del módulo (novedades, incapacidades, enfermeria)
      - `can_create` (boolean, default false)
      - `can_read` (boolean, default false)
      - `can_update` (boolean, default false)
      - `can_delete` (boolean, default false)

  2. Seguridad
    - Enable RLS en tabla `user_permissions`
    - Política para que usuarios puedan leer sus propios permisos
    - Política para que admins puedan gestionar todos los permisos

  3. Permisos por defecto
    - Permisos completos para el usuario admin en todos los módulos
*/

-- Crear tabla de permisos de usuario
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module text NOT NULL,
  can_create boolean DEFAULT false,
  can_read boolean DEFAULT false,
  can_update boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  UNIQUE(user_id, module)
);

-- Habilitar RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios puedan leer sus propios permisos
CREATE POLICY "Users can read own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Política para que admins puedan gestionar todos los permisos
CREATE POLICY "Admins can manage all permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'Admin'
    )
  );

-- Insertar permisos completos para el usuario admin
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Obtener el ID del usuario admin
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@upca.edu.co';
  
  IF admin_user_id IS NOT NULL THEN
    -- Insertar permisos para cada módulo
    INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete) VALUES
    (admin_user_id, 'novedades', true, true, true, true),
    (admin_user_id, 'incapacidades', true, true, true, true),
    (admin_user_id, 'enfermeria', true, true, true, true),
    (admin_user_id, 'dashboard', false, true, false, false)
    ON CONFLICT (user_id, module) DO NOTHING;
  END IF;
END $$;