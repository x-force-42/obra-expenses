const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export function buildApiUrl(path: string) {
  return new URL(path, `${API_BASE_URL}/`).toString();
}

