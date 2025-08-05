/*
  # Crear tablas de catálogos para listas desplegables

  1. Nuevas Tablas de Catálogos
    - `tipos_novedad` - Tipos de novedades (Permiso, Calamidad, etc.)
    - `diagnosticos` - Diagnósticos médicos
    - `tipos_incapacidad` - Tipos de incapacidad
    - `cargos` - Cargos laborales
    - `dependencias` - Dependencias organizacionales
    - `sintomas` - Síntomas médicos
    - `antecedentes_salud` - Antecedentes de salud

  2. Seguridad
    - Enable RLS en todas las tablas de catálogos
    - Políticas para lectura pública y gestión por admins

  3. Datos iniciales
    - Valores por defecto para cada catálogo
*/

-- Tabla de tipos de novedad
CREATE TABLE IF NOT EXISTS tipos_novedad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tipos_novedad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tipos_novedad"
  ON tipos_novedad FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage tipos_novedad"
  ON tipos_novedad FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Tabla de diagnósticos
CREATE TABLE IF NOT EXISTS diagnosticos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read diagnosticos"
  ON diagnosticos FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage diagnosticos"
  ON diagnosticos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Tabla de tipos de incapacidad
CREATE TABLE IF NOT EXISTS tipos_incapacidad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tipos_incapacidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tipos_incapacidad"
  ON tipos_incapacidad FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage tipos_incapacidad"
  ON tipos_incapacidad FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Tabla de cargos
CREATE TABLE IF NOT EXISTS cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cargos"
  ON cargos FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage cargos"
  ON cargos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Tabla de dependencias
CREATE TABLE IF NOT EXISTS dependencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dependencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dependencias"
  ON dependencias FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage dependencias"
  ON dependencias FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Tabla de síntomas
CREATE TABLE IF NOT EXISTS sintomas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sintomas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sintomas"
  ON sintomas FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage sintomas"
  ON sintomas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Tabla de antecedentes de salud
CREATE TABLE IF NOT EXISTS antecedentes_salud (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE antecedentes_salud ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read antecedentes_salud"
  ON antecedentes_salud FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage antecedentes_salud"
  ON antecedentes_salud FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Insertar datos iniciales
INSERT INTO tipos_novedad (nombre) VALUES
('Permiso'),
('Calamidad'),
('Licencia'),
('Ausencia'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO diagnosticos (nombre) VALUES
('Gripe común'),
('Dolor de cabeza'),
('Dolor muscular'),
('Estrés'),
('Hipertensión'),
('Diabetes'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipos_incapacidad (nombre) VALUES
('Enfermedad común'),
('Accidente laboral'),
('Enfermedad profesional'),
('Maternidad'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO cargos (nombre) VALUES
('Docente'),
('Coordinador'),
('Administrativo'),
('Auxiliar'),
('Aprendiz'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO dependencias (nombre) VALUES
('Rectoría'),
('Vicerrectoría Académica'),
('Vicerrectoría Administrativa'),
('Facultad de Ingeniería'),
('Facultad de Ciencias Sociales'),
('Bienestar Universitario'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO sintomas (nombre) VALUES
('Fiebre'),
('Dolor de cabeza'),
('Náuseas'),
('Mareo'),
('Dolor abdominal'),
('Dificultad respiratoria'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO antecedentes_salud (nombre) VALUES
('Hipertensión'),
('Diabetes'),
('Cardiopatía'),
('Asma'),
('Alergias'),
('Ninguno'),
('Otro')
ON CONFLICT (nombre) DO NOTHING;