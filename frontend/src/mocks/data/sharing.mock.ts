import type { DashboardPeriod } from "@/features/dashboard";
import type { ShareLinkResponse } from "@/features/sharing";

const PUBLIC_BASE_URL = "http://localhost:5173/public/dashboard";
const INITIAL_TOKEN = "xYz-abc-123-token";
const REGENERATED_TOKEN = "new-token-456";

let active = false;
let token: string | null = null;
let createdAt: string | null = null;
let disabledAt: string | null = null;
let regeneratedAt: string | null = null;

function toUrl(currentToken: string | null) {
  return currentToken ? `${PUBLIC_BASE_URL}/${currentToken}` : null;
}

export function getMockShareLink(): ShareLinkResponse {
  return {
    active,
    token,
    url: toUrl(token),
    createdAt,
    disabledAt,
    regeneratedAt,
  };
}

export function createMockShareLink(): ShareLinkResponse {
  if (active) {
    return getMockShareLink();
  }

  active = true;
  token = INITIAL_TOKEN;
  createdAt = "2026-05-01T10:00:00Z";
  disabledAt = null;
  regeneratedAt = null;

  return getMockShareLink();
}

export function disableMockShareLink() {
  active = false;
  disabledAt = "2026-05-01T11:00:00Z";

  return {
    active,
    disabledAt,
  };
}

export function regenerateMockShareLink(): ShareLinkResponse {
  active = true;
  token = REGENERATED_TOKEN;
  createdAt = createdAt ?? "2026-05-01T10:00:00Z";
  disabledAt = null;
  regeneratedAt = "2026-05-01T12:00:00Z";

  return getMockShareLink();
}

export function isValidPublicShareToken(requestedToken: string) {
  return active && token === requestedToken;
}

export function getPublicDashboardPeriod(
  requestedPeriod: string | null,
): DashboardPeriod {
  if (requestedPeriod === "MONTH" || requestedPeriod === "LAST_30_DAYS") {
    return requestedPeriod;
  }

  return "ALL";
}

export function resetMockShareLink() {
  active = false;
  token = null;
  createdAt = null;
  disabledAt = null;
  regeneratedAt = null;
}
