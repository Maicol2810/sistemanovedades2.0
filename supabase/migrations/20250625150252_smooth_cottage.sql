/*
  # Crear tabla de usuarios y sistema de autenticación

  1. Nuevas Tablas
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null) - Contraseñas encriptadas con bcrypt
      - `role` (text, not null, default 'Usuario')
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Seguridad
    - Enable RLS en tabla `users`
    - Política para que usuarios autenticados puedan leer sus propios datos
    - Política para que solo admins puedan gestionar usuarios

  3. Datos iniciales
    - Usuario administrador por defecto con credenciales seguras
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'Usuario',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios puedan leer sus propios datos
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Política para que admins puedan gestionar todos los usuarios
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'Admin'
    )
  );

-- Insertar usuario administrador por defecto
-- Contraseña: admin1028 (hasheada con bcrypt)
INSERT INTO users (email, password_hash, role) 
VALUES (
  'admin@upca.edu.co', 
  '$2b$10$96fYwpWK4CAlS8ScdyabVO7xCJfFvBgL6vwdrtY8.cgPk3J9DPK2q', 
  'Admin'
) ON CONFLICT (email) DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();