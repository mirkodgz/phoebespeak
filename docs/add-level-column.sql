-- Script para agregar la columna 'level' a la tabla 'profiles'
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar la columna 'level' si no existe
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS level text DEFAULT 'beginner';

-- Actualizar los registros existentes que tengan level NULL
UPDATE public.profiles
SET level = 'beginner'
WHERE level IS NULL;

-- Verificar que la columna se creó correctamente
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'level';

