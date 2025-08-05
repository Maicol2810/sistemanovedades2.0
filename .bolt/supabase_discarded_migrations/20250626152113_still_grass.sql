/*
  # Fix RLS for novedades table

  1. Changes
    - Enable RLS on novedades table (was disabled)
*/

-- Enable RLS on novedades table
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;