import { fetchApiJson } from "@/shared/lib/api-client";

export type StageSummary = {
  id: number;
  name: string;
};

export type CurrentConstruction = {
  id: number;
  name: string;
  currentStage: StageSummary | null;
};

export type UserSummary = {
  id: number;
  name: string;
  email: string;
  pictureUrl: string | null;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  user: UserSummary;
  currentConstruction: CurrentConstruction;
};

export type AuthMeResponse = {
  user: UserSummary;
  currentConstruction: CurrentConstruction;
};

export async function authenticateWithGoogle(
  credential: string,
): Promise<AuthResponse> {
  return fetchApiJson<AuthResponse>("/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });
}

export async function getAuthenticatedSession(
  accessToken: string,
): Promise<AuthMeResponse> {
  return fetchApiJson<AuthMeResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
