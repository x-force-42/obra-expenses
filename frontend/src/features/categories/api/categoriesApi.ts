import { fetchApiJson } from "@/shared/lib/api-client";

export type CategoryOption = {
  id: number;
  name: string;
  isDefault: boolean;
  active: boolean;
};

export async function listCategories(
  accessToken: string,
): Promise<CategoryOption[]> {
  return fetchApiJson<CategoryOption[]>("/categories", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
