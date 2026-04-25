import { render, screen } from "@testing-library/react";

import { App } from "@/app/App";

describe("App", () => {
  it("renders the bootstrap login screen", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /controle da sua obra sem planilha/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continuar com google/i }),
    ).toBeDisabled();
  });
});

