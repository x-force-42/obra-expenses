import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
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
      await screen.findByRole("heading", { name: /dashboard/i }),
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

  it("returns the user to the requested private route after login", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/expenses");

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /controle da sua obra sem planilha/i,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /continuar com google/i }));

    expect(
      await screen.findByRole("heading", { name: /despesas/i }),
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

  it("clears an invalid stored session and shows the login screen again", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, mockAuthToken);
    window.history.pushState({}, "", "/dashboard");

    server.use(
      http.get(/.*\/api\/auth\/me$/, () =>
        HttpResponse.json(
          {
            message: "Unauthorized",
          },
          { status: 401 },
        ),
      ),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /controle da sua obra sem planilha/i,
      }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("shows the session loading state while restoring access", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, mockAuthToken);
    window.history.pushState({}, "", "/dashboard");

    server.use(
      http.get(/.*\/api\/auth\/me$/, async () => {
        await delay(150);

        return HttpResponse.json({
          user: {
            id: 1,
            name: "Eliezer Alves",
            email: "eliezer@email.com",
            pictureUrl: "https://example.com/avatar.jpg",
          },
          currentConstruction: {
            id: 1,
            name: "Minha obra",
            currentStage: {
              id: 1,
              name: "Fundação",
            },
          },
        });
      }),
    );

    render(<App />);

    expect(
      screen.getByText(/carregando sessão\.\.\./i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it("logs out from the authenticated shell and clears the local session", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, mockAuthToken);
    window.history.pushState({}, "", "/dashboard");

    render(<App />);

    await screen.findByRole("heading", { name: /dashboard/i });
    await user.click(screen.getAllByRole("button", { name: /sair/i })[0]);

    expect(
      await screen.findByRole("heading", {
        name: /controle da sua obra sem planilha/i,
      }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
