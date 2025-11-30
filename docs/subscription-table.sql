-- ============================================================================
-- TABLA DE SUSCRIPCIONES PARA STRIPE
-- ============================================================================
-- Esta tabla almacena la información de las suscripciones de Stripe
-- ============================================================================

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'monthly', 'quarterly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Crear índice para búsquedas por stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Crear índice para búsquedas por stripe_subscription_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Habilitar Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden leer sus propias suscripciones
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Solo el sistema (usando service_role) puede insertar/actualizar suscripciones
-- Esto se hace a través de webhooks de Stripe
-- Nota: Para desarrollo, puedes crear una política temporal que permita a los usuarios insertar
-- pero en producción esto debe hacerse solo desde el backend con service_role

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at (solo crear si no existe)
-- Nota: Si el trigger ya existe, puedes ignorar el error o eliminarlo manualmente primero
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_subscriptions_updated_at' 
    AND tgrelid = 'public.subscriptions'::regclass
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_subscriptions_updated_at();
  END IF;
END $$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
-- Esta tabla se actualiza principalmente a través de webhooks de Stripe
-- El backend debe escuchar los eventos de Stripe y actualizar esta tabla
-- Eventos importantes:
-- - customer.subscription.created
-- - customer.subscription.updated
-- - customer.subscription.deleted
-- - invoice.payment_succeeded
-- - invoice.payment_failed
-- ============================================================================

