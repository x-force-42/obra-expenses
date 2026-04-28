import { afterEach, describe, expect, it, vi } from "vitest";

async function importApiClient() {
  vi.resetModules();
  return import("@/shared/lib/api-client");
}

describe("api-client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("prefixes /api when the configured base URL does not include it", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");

    const { buildApiUrl } = await importApiClient();

    expect(buildApiUrl("/expenses")).toBe("http://localhost:8080/api/expenses");
  });

  it("avoids duplicating /api when the configured base URL already includes it", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080/api");

    const { buildApiUrl } = await importApiClient();

    expect(buildApiUrl("/expenses")).toBe("http://localhost:8080/api/expenses");
  });

  it("keeps backend messages when parsing failed responses", async () => {
    const { parseJsonResponse } = await importApiClient();

    await expect(
      parseJsonResponse<{ ok: boolean }>(
        new Response(JSON.stringify({ message: "Backend failure." }), {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        }),
      ),
    ).rejects.toThrow("Backend failure.");
  });

  it("calls fetch with the normalized API URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        }),
      );

    const { fetchApiJson } = await importApiClient();

    await expect(fetchApiJson<{ ok: boolean }>("/health")).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/health",
      undefined,
    );
  });
});
