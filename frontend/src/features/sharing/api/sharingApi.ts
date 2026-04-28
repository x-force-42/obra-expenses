import { fetchApiJson } from "@/shared/lib/api-client";

export type ShareLinkResponse = {
  active: boolean;
  token: string | null;
  url: string | null;
  createdAt: string | null;
  disabledAt?: string | null;
  regeneratedAt?: string | null;
};

export type DisableShareLinkResponse = {
  active: boolean;
  disabledAt: string | null;
};

export async function getShareLink(
  accessToken: string,
): Promise<ShareLinkResponse> {
  return fetchApiJson<ShareLinkResponse>("/share-link", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createShareLink(
  accessToken: string,
): Promise<ShareLinkResponse> {
  return fetchApiJson<ShareLinkResponse>("/share-link", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function disableShareLink(
  accessToken: string,
): Promise<DisableShareLinkResponse> {
  return fetchApiJson<DisableShareLinkResponse>("/share-link", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function regenerateShareLink(
  accessToken: string,
): Promise<ShareLinkResponse> {
  return fetchApiJson<ShareLinkResponse>("/share-link/regenerate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
