import { http, HttpResponse, type RequestHandler } from "msw";

import {
  mockAuthenticatedSession,
  mockAuthSession,
  mockAuthToken,
  mockGoogleCredential,
} from "@/mocks/data/auth.mock";

export const handlers: RequestHandler[] = [
  http.post(/.*\/api\/auth\/google$/, async ({ request }) => {
    const body = (await request.json()) as { credential?: string };

    if (body.credential !== mockGoogleCredential) {
      return HttpResponse.json(
        {
          message: "Google credential is invalid.",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockAuthSession);
  }),
  http.get(/.*\/api\/auth\/me$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockAuthenticatedSession);
  }),
];
