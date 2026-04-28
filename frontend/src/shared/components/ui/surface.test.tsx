import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Surface,
  SurfaceDescription,
  SurfaceTitle,
} from "@/shared/components/ui/surface";

describe("Surface", () => {
  it("renders the shared card container styles", () => {
    render(
      <Surface className="p-6" data-testid="surface">
        Conteúdo
      </Surface>,
    );

    const surface = screen.getByTestId("surface");

    expect(surface).toHaveClass("rounded-3xl");
    expect(surface).toHaveClass("border");
    expect(surface).toHaveClass("bg-white/90");
    expect(surface).toHaveClass("p-6");
  });

  it("renders title and description with the shared text hierarchy", () => {
    render(
      <Surface>
        <SurfaceTitle>Resumo financeiro</SurfaceTitle>
        <SurfaceDescription>Veja os dados principais primeiro.</SurfaceDescription>
      </Surface>,
    );

    expect(
      screen.getByRole("heading", { name: /resumo financeiro/i }),
    ).toHaveClass("font-semibold");
    expect(
      screen.getByText(/veja os dados principais primeiro\./i),
    ).toHaveClass("text-muted-foreground");
  });
});
