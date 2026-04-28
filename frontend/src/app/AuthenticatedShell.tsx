import type { PropsWithChildren, ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { useAuthSession } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type AuthenticatedShellProps = PropsWithChildren<{
  actions?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}>;

function NavigationLink({
  label,
  to,
}: {
  label: string;
  to: string;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "inline-flex min-w-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-slate-900 text-white shadow-sm shadow-slate-950/10"
            : "text-muted-foreground hover:bg-white hover:text-foreground",
        )
      }
      to={to}
    >
      {label}
    </NavLink>
  );
}

export function AuthenticatedShell({
  actions,
  children,
  eyebrow,
  subtitle,
  title,
}: AuthenticatedShellProps) {
  const { currentConstruction, logout, user } = useAuthSession();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Obra Expenses
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {currentConstruction?.name ?? "Minha obra"}
                {currentConstruction?.currentStage?.name
                  ? ` · Etapa atual: ${currentConstruction.currentStage.name}`
                  : ""}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button onClick={logout} size="sm" variant="ghost">
                Sair
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/80 p-1">
              <NavigationLink label="Dashboard" to="/dashboard" />
              <NavigationLink label="Despesas" to="/expenses" />
            </div>

            <div className="flex items-center justify-between gap-3 sm:hidden">
              <span className="truncate text-sm text-muted-foreground">
                {user?.name}
              </span>
              <Button onClick={logout} size="sm" variant="ghost">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>

        {children}
      </main>
    </div>
  );
}
