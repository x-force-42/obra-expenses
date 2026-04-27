import { buildApiUrl } from "@/shared/lib/api-client";

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

type ErrorResponse = {
  message?: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
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

export async function authenticateWithGoogle(
  credential: string,
): Promise<AuthResponse> {
  const response = await fetch(buildApiUrl("/auth/google"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  return parseJsonResponse<AuthResponse>(response);
}

export async function getAuthenticatedSession(
  accessToken: string,
): Promise<AuthMeResponse> {
  const response = await fetch(buildApiUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseJsonResponse<AuthMeResponse>(response);
}
