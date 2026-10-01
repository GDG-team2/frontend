// The base URL includes the version prefix; native devices need a reachable host.
export const USE_MSW = process.env.EXPO_PUBLIC_USE_MSW === "true";
export const API_BASE_URL: string = (
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://ohakkom-backend.onrender.com/api/v1"
).replace(/\/$/, "");
