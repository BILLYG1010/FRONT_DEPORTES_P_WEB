export const ENV = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
  API_KEY: import.meta.env.VITE_API_KEY || "",
  ENABLE_MOCKS: String(import.meta.env.VITE_ENABLE_MOCKS || "false") === "true",
};

if (!ENV.BASE_URL) {
  // Para no romper en dev, solo avisa. En prod querrás lanzar error.
  console.warn("[ENV] VITE_API_BASE_URL no está definido");
}
