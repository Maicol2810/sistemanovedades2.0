/*
  # Crear módulo de Accidentes de Trabajo

  1. Nuevas Tablas
    - `accidentes_trabajo` - Registros de accidentes de trabajo
      - `id` (uuid, primary key)
      - `cedula` (text, not null) - Número de cédula
      - `nombre` (text, not null) - Nombre completo
      - `cargo` (text, not null) - Cargo del funcionario
      - `dependencia` (text, not null) - Dependencia
      - `tipo_at` (text, not null) - Tipo de accidente de trabajo
      - `tipo_lesion` (text, not null) - Tipo de lesión
      - `parte_cuerpo_afectada` (text, not null) - Parte del cuerpo afectada
      - `fecha` (date, not null) - Fecha del accidente
      - `hora` (time, not null) - Hora del accidente
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to users)

    - `tipos_at` - Tipos de accidentes de trabajo
    - `tipos_lesion` - Tipos de lesión
    - `partes_cuerpo` - Partes del cuerpo afectadas

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas de acceso basadas en permisos de usuario

  3. Datos iniciales
    - Valores por defecto para cada catálogo