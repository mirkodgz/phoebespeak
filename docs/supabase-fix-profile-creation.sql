-- Script para solucionar el problema de creación de perfiles durante el registro
-- Ejecuta este script en el SQL Editor de Supabase

-- Opción 1: Agregar política RLS para permitir INSERT durante el registro
-- Esta política permite que un usuario cree su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Opción 2 (RECOMENDADA): Crear un trigger que cree automáticamente el perfil
-- cuando se crea un usuario en auth.users
-- Esto es más seguro y funciona incluso si el usuario no tiene sesión activa

-- Función que se ejecutará cuando se cree un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, level, has_premium, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'Alumno'
    ),
    'beginner',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Si el perfil ya existe, no hacer nada
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger que se ejecuta después de insertar un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar que el trigger se creó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';


