import type { AuthMeResponse, AuthResponse } from "@/features/auth/api/authApi";
import { mockCurrentConstruction } from "@/mocks/data/construction.mock";

export const mockGoogleCredential = "mock-google-credential";
export const mockAuthToken = "mock-app-jwt";

export const mockAuthSession: AuthResponse = {
  accessToken: mockAuthToken,
  tokenType: "Bearer",
  user: {
    id: 1,
    name: "Eliezer Alves",
    email: "eliezer@email.com",
    pictureUrl: "https://example.com/avatar.jpg",
  },
  currentConstruction: mockCurrentConstruction,
};

export const mockAuthenticatedSession: AuthMeResponse = {
  user: mockAuthSession.user,
  currentConstruction: mockAuthSession.currentConstruction,
};
