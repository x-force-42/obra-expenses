import { Surface, SurfaceDescription, SurfaceTitle } from "@/shared/components/ui/surface";

export function PublicDashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-10 sm:px-6">
      <Surface className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Compartilhamento público
        </p>
        <SurfaceTitle className="mt-3 text-2xl">
          Dashboard público indisponível neste momento
        </SurfaceTitle>
        <SurfaceDescription className="mt-3">
          Esta URL existe apenas como placeholder visual no bootstrap atual. O
          compartilhamento por link ainda não faz parte da implementação funcional.
        </SurfaceDescription>
      </Surface>
    </main>
  );
}
