import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app/App";
import { AUTH_TOKEN_STORAGE_KEY } from "@/features/auth";
import { mockAuthSession, mockAuthToken } from "@/mocks/data/auth.mock";
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
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(
      await screen.findByText(/minha obra · etapa atual: fundação/i),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(mockAuthSession.user.name)).not.toHaveLength(0);
    expect(await screen.findByLabelText(/valor/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/categoria/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/etapa/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/descricao/i)).toBeInTheDocument();
  });

  it("preselects the default category and the current construction stage", async () => {
    render(<App />);

    const categorySelect = await screen.findByLabelText(
      /categoria/i,
    );
    const stageSelect = await screen.findByLabelText(/etapa/i);

    expect(categorySelect).toHaveValue("1");
    expect(stageSelect).toHaveValue("1");
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

  it.each(["0", "-5"])(
    "does not submit non-positive amount values like %s",
    async (amountValue) => {
      const user = userEvent.setup();
      const createExpenseSpy = vi.fn();

      server.use(
        http.post(/.*\/api\/expenses$/, async ({ request }) => {
          createExpenseSpy(await request.json());

          return HttpResponse.json({
            id: 999,
            amount: 999,
            description: "Should not be created",
            category: {
              id: 1,
              name: "Material",
            },
            stage: {
              id: 1,
              name: "Fundação",
            },
            occurredAt: "2026-04-26T10:00:00Z",
          });
        }),
      );

      render(<App />);

      fireEvent.change(await screen.findByLabelText(/valor/i), {
        target: {
          value: amountValue,
        },
      });
      await user.selectOptions(screen.getByLabelText(/categoria/i), "1");
      await user.selectOptions(screen.getByLabelText(/etapa/i), "1");
      await user.click(screen.getByRole("button", { name: /salvar gasto/i }));

      expect(createExpenseSpy).not.toHaveBeenCalled();
      expect(
        screen.queryByText(/should not be created/i),
      ).not.toBeInTheDocument();
    },
  );

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

  it("shows the backend error when expense submission fails", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(/.*\/api\/expenses$/, () =>
        HttpResponse.json(
          {
            message: "Categoria não permitida.",
          },
          { status: 400 },
        ),
      ),
    );

    render(<App />);

    await user.type(await screen.findByLabelText(/valor/i), "120");
    await user.selectOptions(screen.getByLabelText(/categoria/i), "2");
    await user.selectOptions(screen.getByLabelText(/etapa/i), "2");
    await user.click(screen.getByRole("button", { name: /salvar gasto/i }));

    expect(
      await screen.findByText(/categoria não permitida\./i),
    ).toBeInTheDocument();
  });

  it("renders a consistent list error state when expenses fail to load", async () => {
    server.use(
      http.get(/.*\/api\/expenses$/, () =>
        HttpResponse.json(
          {
            message: "Erro ao carregar despesas.",
          },
          { status: 500 },
        ),
      ),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /novo gasto/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/erro ao carregar despesas\./i),
    ).toBeInTheDocument();
  });

  it("renders a consistent form error state when bootstrap data fails", async () => {
    server.use(
      http.get(/.*\/api\/categories$/, () =>
        HttpResponse.json(
          {
            message: "Categorias indisponíveis.",
          },
          { status: 500 },
        ),
      ),
    );

    render(<App />);

    expect(
      await screen.findByText(/categorias indisponíveis\./i),
    ).toBeInTheDocument();
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
    expect(screen.getByLabelText(/valor/i)).toHaveValue(null);
    expect(screen.getByLabelText(/descricao/i)).toHaveValue("");
    expect(screen.getByLabelText(/categoria/i)).toHaveValue("2");
    expect(screen.getByLabelText(/etapa/i)).toHaveValue("2");
  });
});
