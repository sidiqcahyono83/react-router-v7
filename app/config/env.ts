const required = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const env = {
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "Teranet Bill",

  API_URL: required(import.meta.env.VITE_API_URL, "VITE_API_URL"),

  APP_ENV: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
