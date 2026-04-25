const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function buildApiUrl(path: string) {
  const baseUrl = new URL(API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`);
  const normalizedBasePath = baseUrl.pathname.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const hasApiBasePath = normalizedBasePath === "/api";

  let apiPath = normalizedPath;

  if (hasApiBasePath && (normalizedPath === "api" || normalizedPath.startsWith("api/"))) {
    apiPath = normalizedPath.slice(4);
  } else if (!hasApiBasePath && normalizedPath !== "api" && !normalizedPath.startsWith("api/")) {
    apiPath = `api/${normalizedPath}`;
  }

  return new URL(apiPath, baseUrl).toString();
}
