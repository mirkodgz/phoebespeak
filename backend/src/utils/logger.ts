export const logInfo = (message: string, meta?: unknown) => {
  if (meta) {
    console.log(`[INFO] ${message}`, meta);
  } else {
    console.log(`[INFO] ${message}`);
  }
};

export const logError = (message: string, error?: unknown) => {
  if (error) {
    console.error(`[ERROR] ${message}`, error);
  } else {
    console.error(`[ERROR] ${message}`);
  }
};

