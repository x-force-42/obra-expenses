import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth";
import { mockAuthToken } from "@/mocks/data/auth.mock";
import { resetMockExpenses } from "@/mocks/data/expenses.mock";
import { server } from "@/mocks/server";

describe("ExpensesPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, mockAuthToken);
    window.history.pushState({}, "", "/expenses");
    resetMockExpenses();
  });

  it("renders amount, category, stage, and description fields", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /despesas/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/etapa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descricao/i)).toBeInTheDocument();
  });

  it("allows empty description and submits a valid expense", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/valor/i), "450");
    await user.selectOptions(screen.getByLabelText(/categoria/i), "1");
    await user.selectOptions(screen.getByLabelText(/etapa/i), "1");
    await user.clear(screen.getByLabelText(/descricao/i));
    await user.click(screen.getByRole("button", { name: /salvar gasto/i }));

    expect(await screen.findByText(/r\$ 450,00/i)).toBeInTheDocument();
  });

  it("requires amount before submitting", async () => {
    const user = userEvent.setup();

    render(<App />);

    await screen.findByRole("option", { name: /material/i });
    await user.selectOptions(await screen.findByLabelText(/categoria/i), "1");
    await user.selectOptions(screen.getByLabelText(/etapa/i), "1");
    await user.click(screen.getByRole("button", { name: /salvar gasto/i }));

    expect(
      await screen.findByText(/informe um valor valido\./i),
    ).toBeInTheDocument();
  });

  it("renders empty state when the API returns no expenses", async () => {
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
      await screen.findByText(/nenhum gasto cadastrado ainda\./i),
    ).toBeInTheDocument();
  });

  it("renders mocked API expenses", async () => {
    render(<App />);

    expect(await screen.findByText(/locação container/i)).toBeInTheDocument();
    expect(screen.getByText(/material · fundação/i)).toBeInTheDocument();
  });

  it("refreshes the list after submitting a new expense", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(await screen.findByLabelText(/valor/i), "120");
    await user.selectOptions(screen.getByLabelText(/categoria/i), "2");
    await user.selectOptions(screen.getByLabelText(/etapa/i), "2");
    await user.type(screen.getByLabelText(/descricao/i), "Concreto usinado");
    await user.click(screen.getByRole("button", { name: /salvar gasto/i }));

    await waitFor(() => {
      expect(screen.getByText(/concreto usinado/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/mão de obra · estrutura/i)).toBeInTheDocument();
  });
});
