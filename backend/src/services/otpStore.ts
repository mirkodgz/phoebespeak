// Almacenamiento temporal de códigos OTP en memoria
// En producción, considera usar Redis para mejor escalabilidad

interface OTPEntry {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPEntry>();
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 5; // Máximo de intentos de verificación

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

export const generateOTP = (): string => {
  // Generar código de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email: string, code: string): void => {
  otpStore.set(email.toLowerCase(), {
    code,
    email: email.toLowerCase(),
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
    attempts: 0,
  });
};

export const verifyOTP = (email: string, code: string): boolean => {
  const entry = otpStore.get(email.toLowerCase());
  
  if (!entry) {
    return false; // No existe código para este email
  }

  if (entry.expiresAt < Date.now()) {
    otpStore.delete(email.toLowerCase());
    return false; // Código expirado
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email.toLowerCase());
    return false; // Demasiados intentos fallidos
  }

  entry.attempts++;

  if (entry.code !== code) {
    return false; // Código incorrecto
  }

  // Código correcto - eliminar de la store
  otpStore.delete(email.toLowerCase());
  return true;
};

export const deleteOTP = (email: string): void => {
  otpStore.delete(email.toLowerCase());
};

