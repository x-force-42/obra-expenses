import { Button } from "@/shared/components/ui/button";

export function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <section className="rounded-[28px] border border-border/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(85,57,16,0.08)] backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Obra Expenses
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Controle da sua obra sem planilha.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O bootstrap prepara a estrutura da aplicacao. A autenticacao Google
          entra na proxima task.
        </p>
        <Button className="mt-6 w-full" disabled type="button">
          Continuar com Google
        </Button>
      </section>
    </main>
  );
}

