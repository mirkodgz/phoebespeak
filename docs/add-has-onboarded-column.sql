-- Script para agregar la columna has_onboarded a la tabla profiles
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar la columna has_onboarded si no existe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT false;

-- Crear un índice para mejorar las consultas (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_profiles_has_onboarded 
ON public.profiles(has_onboarded);

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'has_onboarded';

