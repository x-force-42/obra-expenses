import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/features/auth";
import {
  createShareLink,
  disableShareLink,
  getShareLink,
  regenerateShareLink,
} from "@/features/sharing/api/sharingApi";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  Surface,
  SurfaceDescription,
  SurfaceTitle,
} from "@/shared/components/ui/surface";
import { cn } from "@/shared/lib/utils";

export function ShareLinkCard() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthSession();
  const [actionError, setActionError] = useState<string | null>(null);

  const shareLinkQuery = useQuery({
    queryKey: ["share-link", accessToken],
    queryFn: () => getShareLink(accessToken!),
    enabled: Boolean(accessToken),
  });

  async function refreshShareLink() {
    await queryClient.invalidateQueries({
      queryKey: ["share-link", accessToken],
    });
  }

  const createMutation = useMutation({
    mutationFn: () => createShareLink(accessToken!),
    onSuccess: async () => {
      setActionError(null);
      await refreshShareLink();
    },
    onError: (error) => {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o link público.",
      );
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => disableShareLink(accessToken!),
    onSuccess: async () => {
      setActionError(null);
      await refreshShareLink();
    },
    onError: (error) => {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar o link público.",
      );
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateShareLink(accessToken!),
    onSuccess: async () => {
      setActionError(null);
      await refreshShareLink();
    },
    onError: (error) => {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível regenerar o link público.",
      );
    },
  });

  const isSubmitting =
    createMutation.isPending ||
    disableMutation.isPending ||
    regenerateMutation.isPending;

  return (
    <Surface className="mb-6 p-6 sm:mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <SurfaceTitle>Compartilhamento público</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Gere um link read-only para compartilhar a visão financeira sem expor
            ações de edição ou autenticação.
          </SurfaceDescription>
        </div>

        {shareLinkQuery.data?.active && shareLinkQuery.data.url ? (
          <a
            className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
            href={shareLinkQuery.data.url}
            rel="noreferrer"
            target="_blank"
          >
            Abrir dashboard público
          </a>
        ) : null}
      </div>

      {shareLinkQuery.isLoading ? (
        <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
          Carregando status do link público...
        </div>
      ) : null}

      {!shareLinkQuery.isLoading && shareLinkQuery.error ? (
        <div className="mt-6 rounded-2xl border border-destructive/20 bg-background px-4 py-5 text-sm text-destructive">
          {shareLinkQuery.error instanceof Error
            ? shareLinkQuery.error.message
            : "Não foi possível carregar o status do link público."}
        </div>
      ) : null}

      {!shareLinkQuery.isLoading && !shareLinkQuery.error ? (
        <div className="mt-6 space-y-4">
          {shareLinkQuery.data?.active && shareLinkQuery.data.url ? (
            <>
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Link ativo
                </p>
                <p className="mt-3 break-all rounded-xl bg-slate-50 px-3 py-3 font-mono text-sm text-foreground">
                  {shareLinkQuery.data.url}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Qualquer pessoa com esse endereço pode ver o dashboard em modo
                  somente leitura.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    regenerateMutation.mutate();
                  }}
                  variant="outline"
                >
                  Regenerar link
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    disableMutation.mutate();
                  }}
                  variant="ghost"
                >
                  Desativar link
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Nenhum link público ativo no momento.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gere um link quando quiser compartilhar a visão read-only da obra.
                </p>
              </div>
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  setActionError(null);
                  createMutation.mutate();
                }}
                variant="secondary"
              >
                Gerar link público
              </Button>
            </div>
          )}

          {actionError ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
        </div>
      ) : null}
    </Surface>
  );
}
