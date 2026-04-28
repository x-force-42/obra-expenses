import { fetchApiJson } from "@/shared/lib/api-client";

export type StageOption = {
  id: number;
  name: string;
  isDefault: boolean;
  active: boolean;
};

export async function listStages(accessToken: string): Promise<StageOption[]> {
  return fetchApiJson<StageOption[]>("/stages", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
