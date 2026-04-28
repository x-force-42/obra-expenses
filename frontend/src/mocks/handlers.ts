import { http, HttpResponse, type RequestHandler } from "msw";

import { mockCategories } from "@/mocks/data/categories.mock";
import { mockCurrentConstruction } from "@/mocks/data/construction.mock";
import { type DashboardPeriod } from "@/features/dashboard";
import { getMockDashboard } from "@/mocks/data/dashboard.mock";
import {
  addMockExpense,
  listMockExpenses,
} from "@/mocks/data/expenses.mock";
import {
  mockAuthenticatedSession,
  mockAuthSession,
  mockAuthToken,
  mockGoogleCredential,
} from "@/mocks/data/auth.mock";
import { mockStages } from "@/mocks/data/stages.mock";

export const handlers: RequestHandler[] = [
  http.post(/.*\/api\/auth\/google$/, async ({ request }) => {
    const body = (await request.json()) as { credential?: string };

    if (body.credential !== mockGoogleCredential) {
      return HttpResponse.json(
        {
          message: "Google credential is invalid.",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockAuthSession);
  }),
  http.get(/.*\/api\/auth\/me$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockAuthenticatedSession);
  }),
  http.get(/.*\/api\/constructions\/current$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      ...mockCurrentConstruction,
      createdAt: "2026-04-25T18:30:00Z",
    });
  }),
  http.get(/.*\/api\/categories$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockCategories);
  }),
  http.get(/.*\/api\/stages$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockStages);
  }),
  http.get(/.*\/api\/expenses$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const expenses = listMockExpenses();

    return HttpResponse.json({
      content: expenses,
      page: 0,
      size: 20,
      totalElements: expenses.length,
      totalPages: expenses.length === 0 ? 0 : 1,
    });
  }),
  http.get(/.*\/api\/dashboard$/, ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const requestedPeriod = new URL(request.url).searchParams.get("period");
    const period: DashboardPeriod =
      requestedPeriod === "LAST_30_DAYS" || requestedPeriod === "ALL"
        ? requestedPeriod
        : "MONTH";

    return HttpResponse.json(getMockDashboard(period));
  }),
  http.post(/.*\/api\/expenses$/, async ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${mockAuthToken}`) {
      return HttpResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      amount?: number;
      categoryId?: number;
      stageId?: number;
      description?: string;
    };

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return HttpResponse.json(
        {
          message: "Valor do gasto deve ser maior que zero",
        },
        { status: 400 },
      );
    }

    const category = mockCategories.find((item) => item.id === body.categoryId);
    const stage = mockStages.find((item) => item.id === body.stageId);

    if (!category || !stage) {
      return HttpResponse.json(
        {
          message: "Invalid category or stage.",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      addMockExpense({
        amount: body.amount,
        description: body.description ?? null,
        category: {
          id: category.id,
          name: category.name,
        },
        stage: {
          id: stage.id,
          name: stage.name,
        },
      }),
    );
  }),
];
