import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth/session-context";
import {
  mockAuthToken,
} from "@/mocks/data/auth.mock";
import { server } from "@/mocks/server";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/login");
  });

  it("renders the Google login action", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /controle da sua obra sem planilha/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continuar com google/i }),
    ).toBeEnabled();
  });

  it("logs in and redirects to the authenticated area", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      await screen.findByRole("button", { name: /continuar com google/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /despesas/i }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(
      mockAuthToken,
    );
  });

  it("redirects a guest away from private routes", async () => {
    window.history.pushState({}, "", "/dashboard");

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /controle da sua obra sem planilha/i,
      }),
    ).toBeInTheDocument();
  });

  it("restores the authenticated session from localStorage", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, mockAuthToken);
    window.history.pushState({}, "", "/expenses");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /despesas/i }),
    ).toBeInTheDocument();
  });

  it("shows a login error when the backend rejects the credential", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(/.*\/api\/auth\/google$/, () =>
        HttpResponse.json(
          {
            message: "Google credential is invalid.",
          },
          { status: 401 },
        ),
      ),
    );

    render(<App />);

    await user.click(
      await screen.findByRole("button", { name: /continuar com google/i }),
    );

    expect(
      await screen.findByText(/google credential is invalid\./i),
    ).toBeInTheDocument();
  });
});
