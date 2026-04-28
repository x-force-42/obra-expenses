import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/shared/components/ui/button";

describe("Button", () => {
  it("renders with the shared default visual treatment", () => {
    render(<Button>Salvar</Button>);

    const button = screen.getByRole("button", { name: /salvar/i });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("rounded-xl");
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-primary-foreground");
  });

  it("applies the requested size and variant consistently", () => {
    render(
      <Button size="lg" variant="secondary">
        Novo gasto
      </Button>,
    );

    const button = screen.getByRole("button", { name: /novo gasto/i });

    expect(button).toHaveClass("bg-slate-900");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("px-5");
    expect(button).toHaveClass("py-3");
  });
});
