import type { CurrentConstruction } from "@/features/auth/api/authApi";

export const mockCurrentConstruction: CurrentConstruction = {
  id: 1,
  name: "Minha obra",
  currentStage: {
    id: 1,
    name: "Fundação",
  },
};
