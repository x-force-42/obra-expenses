const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type ErrorResponse = {
  message?: string;
};

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

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = "Unexpected request failure.";

  try {
    const body = (await response.json()) as ErrorResponse;
    if (body.message) {
      message = body.message;
    }
  } catch {
    // Keep the default message when the response has no JSON body.
  }

  throw new Error(message);
}

export async function fetchApiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  return parseJsonResponse<T>(response);
}
