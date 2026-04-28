import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { getMockDashboard } from "@/mocks/data/dashboard.mock";
import {
  createMockShareLink,
  resetMockShareLink,
} from "@/mocks/data/sharing.mock";
import { server } from "@/mocks/server";

describe("PublicDashboardPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetMockShareLink();
    createMockShareLink();
    window.history.pushState({}, "", "/public/dashboard/xYz-abc-123-token");
  });

  it("renders the public dashboard in read-only mode", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /dashboard público/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/modo read-only/i)).toBeInTheDocument();
    expect(await screen.findByText(/distribuição por categoria/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/concreto usinado/i)).not.toHaveLength(0);
    expect(
      screen.queryByRole("link", { name: /novo gasto/i }),
    ).not.toBeInTheDocument();
  });

  it("defaults to all and lets the visitor filter the period", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      await screen.findByRole("button", { name: /tudo/i, pressed: true }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /mês/i }));

    expect(
      await screen.findByRole("button", { name: /mês/i, pressed: true }),
    ).toBeInTheDocument();
  });

  it("shows a clear error when the public link is invalid", async () => {
    server.use(
      http.get(/.*\/api\/public\/dashboard\/[^/]+$/, () =>
        HttpResponse.json(
          {
            message: "Public dashboard link was not found.",
          },
          { status: 404 },
        ),
      ),
    );

    window.history.pushState({}, "", "/public/dashboard/invalid-token");

    render(<App />);

    expect(
      await screen.findByText(/public dashboard link was not found\./i),
    ).toBeInTheDocument();
  });

  it("renders an empty state when the public link has no expenses", async () => {
    server.use(
      http.get(/.*\/api\/public\/dashboard\/[^/]+$/, () =>
        HttpResponse.json({
          ...getMockDashboard("ALL"),
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
      await screen.findByText(/ainda não há dados para exibir/i),
    ).toBeInTheDocument();
  });
});
