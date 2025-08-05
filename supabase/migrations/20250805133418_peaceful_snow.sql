/*
  # Agregar campo salida a tabla enfermería

  1. Modificaciones
    - Agregar columna `salida` a tabla `enfermeria`
    - Tipo text con valor por defecto 'No'
    - Permite valores 'Sí' o 'No'

  2. Datos existentes
    - Los registros existentes tendrán valor por defecto 'No'
*/

-- Agregar columna salida a la tabla enfermeria
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enfermeria' AND column_name = 'salida'
  ) THEN
    ALTER TABLE enfermeria ADD COLUMN salida text DEFAULT 'No';
  END IF;
END $$;

-- Crear índice para mejorar consultas por salida
CREATE INDEX IF NOT EXISTS idx_enfermeria_salida ON enfermeria(salida);