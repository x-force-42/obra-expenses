import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth";
import { mockAuthSession, mockAuthToken } from "@/mocks/data/auth.mock";
import { getMockDashboard } from "@/mocks/data/dashboard.mock";
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
    expect(screen.getByRole("button", { name: /mês/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /últimos 30 dias/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/distribuição por categoria/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/distribuição por etapa/i)).toBeInTheDocument();
    expect(await screen.findByText(/evolução mensal/i)).toBeInTheDocument();
    expect(await screen.findByText(/últimos lançamentos/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/locação container/i)).not.toHaveLength(0);
    expect(await screen.findAllByText(/concreto usinado/i)).not.toHaveLength(0);
    expect(
      await screen.findByText(/minha obra · etapa atual: fundação/i),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(mockAuthSession.user.name)).not.toHaveLength(0);
  });

  it("updates the dashboard when the period filter changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findAllByText(/concreto usinado/i)).not.toHaveLength(0);

    await user.click(screen.getByRole("button", { name: /últimos 30 dias/i }));

    expect(
      await screen.findByRole("button", { name: /últimos 30 dias/i, pressed: true }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(/cobertura provisória/i)).not.toHaveLength(0);
    expect(await screen.findAllByText(/ferramentas/i)).not.toHaveLength(0);
    expect(await screen.findAllByText(/cobertura/i)).not.toHaveLength(0);
    expect(screen.getByText(/r\$\s*862,50/i)).toBeInTheDocument();
  });

  it("renders the empty dashboard state with a primary action", async () => {
    server.use(
      http.get(/.*\/api\/dashboard$/, () =>
        HttpResponse.json({
          ...getMockDashboard("MONTH"),
          monthSpent: 0,
          totalSpent: 0,
          averageTicket: 0,
          mainCategory: null,
          mainStage: null,
          currentVsPreviousMonth: {
            currentMonthAmount: 0,
            previousMonthAmount: 0,
            differenceAmount: 0,
            differencePercentage: 0,
          },
          byCategory: [],
          byStage: [],
          monthlyEvolution: [],
          latestExpenses: [],
          topExpenses: [],
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
      http.get(/.*\/api\/dashboard$/, () =>
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
