import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth";
import { mockAuthSession, mockAuthToken } from "@/mocks/data/auth.mock";
import { resetMockExpenses } from "@/mocks/data/expenses.mock";
import { server } from "@/mocks/server";

describe("DashboardPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, mockAuthToken);
    window.history.pushState({}, "", "/dashboard");
    resetMockExpenses();
  });

  it("renders the financial overview using loaded expenses", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /novo gasto/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /despesas/i })).toBeInTheDocument();
    expect(
      await screen.findByText(/distribuição por categoria/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/últimos lançamentos/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/locação container/i)).not.toHaveLength(0);
    expect(
      await screen.findByText(/minha obra · etapa atual: fundação/i),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(mockAuthSession.user.name)).not.toHaveLength(0);
  });

  it("renders the calculated summary metrics from the loaded expenses", async () => {
    server.use(
      http.get(/.*\/api\/expenses$/, () =>
        HttpResponse.json({
          content: [
            {
              id: 1,
              amount: 300,
              description: "Concreto",
              category: {
                id: 1,
                name: "Material",
              },
              stage: {
                id: 1,
                name: "Fundação",
              },
              occurredAt: "2026-04-25T10:00:00Z",
            },
            {
              id: 2,
              amount: 150,
              description: "Ferro",
              category: {
                id: 1,
                name: "Material",
              },
              stage: {
                id: 1,
                name: "Fundação",
              },
              occurredAt: "2026-04-24T10:00:00Z",
            },
            {
              id: 3,
              amount: 250,
              description: "Equipe",
              category: {
                id: 2,
                name: "Mão de Obra",
              },
              stage: {
                id: 2,
                name: "Estrutura",
              },
              occurredAt: "2026-04-23T10:00:00Z",
            },
          ],
          page: 0,
          size: 20,
          totalElements: 8,
          totalPages: 1,
        }),
      ),
    );

    render(<App />);

    expect(
      await screen.findByText(/baseado nos lançamentos carregados/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/r\$\s*700,00/i)).toBeInTheDocument();
    expect(screen.getByText(/r\$\s*233,33/i)).toBeInTheDocument();
    expect(screen.getAllByText(/r\$\s*450,00/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/r\$\s*300,00/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/material/i)).not.toHaveLength(0);
    expect(screen.getByText(/64%/i)).toBeInTheDocument();
  });

  it("renders the empty dashboard state with a primary action", async () => {
    server.use(
      http.get(/.*\/api\/expenses$/, () =>
        HttpResponse.json({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
      ),
    );

    render(<App />);

    expect(
      await screen.findByText(/seu dashboard começa com o primeiro lançamento/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /cadastrar primeiro gasto/i }),
    ).toBeInTheDocument();
  });

  it("renders a consistent error state when dashboard loading fails", async () => {
    server.use(
      http.get(/.*\/api\/expenses$/, () =>
        HttpResponse.json(
          {
            message: "Falha ao carregar dashboard.",
          },
          { status: 500 },
        ),
      ),
    );

    render(<App />);

    expect(
      await screen.findByText(/não foi possível carregar o dashboard/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/falha ao carregar dashboard\./i)).toBeInTheDocument();
  });
});
