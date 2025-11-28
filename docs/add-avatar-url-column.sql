-- Script para agregar la columna avatar_url a la tabla profiles
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar la columna avatar_url si no existe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'avatar_url';


