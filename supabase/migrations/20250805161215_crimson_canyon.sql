/*
  # Agregar códigos de diagnósticos y tabla de funcionarios

  1. Nuevas Tablas
    - `funcionarios` - Información de funcionarios para autocompletado
      - `id` (uuid, primary key)
      - `cedula` (text, unique, not null) - Número de documento
      - `nombre` (text, not null) - Nombre completo
      - `cargo` (text, not null) - Cargo del funcionario
      - `dependencia` (text, not null) - Dependencia
      - `activo` (boolean, default true)
      - `created_at` (timestamp)

  2. Modificaciones
    - Agregar columna `codigo` a tabla `diagnosticos`
    - Agregar columna `prorroga` a tabla `incapacidades`
    - Agregar columna `cedula` a tabla `enfermeria`
    - Agregar columna `fecha` a tabla `enfermeria`

  3. Datos iniciales
    - Cargar diagnósticos con códigos desde el CSV
    - Datos de ejemplo de funcionarios

  4. Seguridad
    - RLS en tabla funcionarios
    - Políticas de acceso para administradores
*/

-- Crear tabla de funcionarios
CREATE TABLE IF NOT EXISTS funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula text UNIQUE NOT NULL,
  nombre text NOT NULL,
  cargo text NOT NULL,
  dependencia text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en funcionarios
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- Políticas para funcionarios
CREATE POLICY "Anyone can read funcionarios"
  ON funcionarios FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Admins can manage funcionarios"
  ON funcionarios FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Admin'));

-- Agregar columna código a diagnósticos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosticos' AND column_name = 'codigo'
  ) THEN
    ALTER TABLE diagnosticos ADD COLUMN codigo text;
  END IF;
END $$;

-- Agregar columna prórroga a incapacidades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'incapacidades' AND column_name = 'prorroga'
  ) THEN
    ALTER TABLE incapacidades ADD COLUMN prorroga text DEFAULT 'No';
  END IF;
END $$;

-- Agregar columna cédula a enfermería
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enfermeria' AND column_name = 'cedula'
  ) THEN
    ALTER TABLE enfermeria ADD COLUMN cedula text;
  END IF;
END $$;

-- Agregar columna fecha a enfermería
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enfermeria' AND column_name = 'fecha'
  ) THEN
    ALTER TABLE enfermeria ADD COLUMN fecha date;
  END IF;
END $$;

-- Limpiar diagnósticos existentes para cargar los nuevos con códigos
DELETE FROM diagnosticos;

-- Insertar diagnósticos con códigos del CSV
INSERT INTO diagnosticos (codigo, nombre, activo) VALUES
('A000', 'COLERA DEBIDO A VIBRIO CHOLERAE O1, BIOTIPO CHOLERAE', true),
('A009', 'COLERA NO ESPECIFICADO', true),
('A010', 'FIEBRE TIFOIDEA', true),
('A011', 'FIEBRE PARATIFOIDEA A', true),
('A012', 'FIEBRE PARATIFOIDEA B', true),
('A013', 'FIEBRE PARATIFOIDEA C', true),
('A014', 'FIEBRE PARATIFOIDEA, NO ESPECIFICADA', true),
('A020', 'ENTERITIS DEBIDA A SALMONELLA', true),
('A021', 'SEPTICEMIA DEBIDA A SALMONELLA', true),
('A022', 'INFECCIONES LOCALIZADAS DEBIDA A SALMONELLA', true),
('A028', 'OTRAS INFECCIONES ESPECIFICADAS COMO DEBIDAS A SALMONELLA', true),
('A029', 'INFECCIÓN DEBIDA A SALMONELLA NO ESPECIFICADA', true),
('A030', 'SHIGELOSIS DEBIDA A SHIGELLA DYSENTERIAE', true),
('A031', 'SHIGELOSIS DEBIDA A SHIGELLA FLEXNERI', true),
('A032', 'SHIGELOSIS DEBIDA A SHIGELLA BOYDII', true),
('A033', 'SHIGELOSIS DEBIDA A SHIGELLA SONNEI', true),
('A038', 'OTRAS SHIGELOSIS', true),
('A039', 'SHIGELOSIS DE TIPO NO ESPECIFICADO', true),
('A040', 'INFECCION DEBIDA A ESCHERICHIA COLI ENTEROPATOGENA', true),
('A041', 'INFECCION DEBIDA A ESCHERICHIA COLI ENTEROTOXIGENA', true),
('A042', 'INFECCION DEBIDA A ESCHERICHIA COLI ENTEROINVASIVA', true),
('A043', 'INFECCION DEBIDA A ESCHERICHIA COLI ENTEROHEMORRAGICA', true),
('A044', 'OTRAS INFECCIONES INTESTINALES DEBIDAS A ESCHERICHIA COLI', true),
('A045', 'ENTERITIS DEBIDA A CAMPYLOBACTER', true),
('A046', 'ENTERITIS DEBIDA A YERSINIA ENTEROCOLITICA', true),
('A047', 'ENTEROCOLITIS DEBIDA A CLOSTRIDIUM DIFFICILE', true),
('A048', 'OTRAS INFECCIONES INTESTINALES BACTERIANAS ESPECIFICADAS', true),
('A049', 'INFECCION INTESTINAL BACTERIANA, NO ESPECIFICADA', true),
('A050', 'INTOXICACION ALIMENTARIA ESTAFILOCOCICA', true),
('A051', 'BOTULISMO', true),
('A052', 'INTOXICACION ALIMENTARIA DEBIDA A CLOSTRIDIUM PERFRINGENS [CLOSTRIDIUM WELCHII]', true),
('A053', 'INTOXICACION ALIMENTARIA DEBIDA A VIBRIO PARAHAEMOLYTICUS', true),
('A054', 'INTOXICACION ALIMENTARIA DEBIDA A BACILLUS CEREUS', true),
('A058', 'OTRAS INTOXICACIONES ALIMENTARIAS DEBIDAS A BACTERIAS ESPECIFICADAS', true),
('A059', 'INTOXICACION ALIMENTARIA BACTERIANA, NO ESPECIFICADA', true),
('B34X', 'INFECCION VIRAL, NO ESPECIFICADA', true),
('J00X', 'RINOFARINGITIS AGUDA (RESFRIADO COMUN)', true),
('J06X', 'INFECCION AGUDA DE LAS VIAS RESPIRATORIAS SUPERIORES, NO ESPECIFICADA', true),
('K59X', 'OTROS TRASTORNOS FUNCIONALES DEL INTESTINO', true),
('M25X', 'OTROS TRASTORNOS ARTICULARES', true),
('M79X', 'OTROS TRASTORNOS DE LOS TEJIDOS BLANDOS', true),
('R50X', 'FIEBRE, NO ESPECIFICADA', true),
('R51X', 'CEFALEA', true),
('R06X', 'ANORMALIDADES DE LA RESPIRACION', true),
('R10X', 'DOLOR ABDOMINAL Y PELVICO', true),
('R11X', 'NAUSEA Y VOMITO', true),
('Z76X', 'PERSONA EN CONTACTO CON LOS SERVICIOS DE SALUD EN OTRAS CIRCUNSTANCIAS', true)
ON CONFLICT (nombre) DO UPDATE SET codigo = EXCLUDED.codigo;

-- Insertar funcionarios de ejemplo
INSERT INTO funcionarios (cedula, nombre, cargo, dependencia) VALUES
('12345678', 'Juan Carlos Pérez García', 'Docente', 'Facultad de Ingeniería'),
('87654321', 'María Elena Rodríguez López', 'Coordinador', 'Vicerrectoría Académica'),
('11223344', 'Carlos Alberto Martínez Silva', 'Administrativo', 'Bienestar Universitario'),
('44332211', 'Ana Patricia González Ruiz', 'Auxiliar', 'Rectoría'),
('55667788', 'Luis Fernando Castro Morales', 'Docente', 'Facultad de Ciencias Sociales')
ON CONFLICT (cedula) DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_funcionarios_cedula ON funcionarios(cedula);
CREATE INDEX IF NOT EXISTS idx_funcionarios_nombre ON funcionarios(nombre);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_codigo ON diagnosticos(codigo);