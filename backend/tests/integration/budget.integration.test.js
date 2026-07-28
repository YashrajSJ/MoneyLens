import { Budget } from "../../src/modules/budget/budget.model.js";
import {
  createAccount,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Budget Module", () => {
  test("should create monthly budget for account", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent);
    const accountId = accountResponse.body.data.account._id;

    const response = await agent.post("/api/v1/budgets").send({
      accountId,
      amount: 10000,
      month: 7,
      year: 2026,
      alertThreshold: 80,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.budget.amount).toBe(10000);
  });

  test("should reject duplicate budget for same account month and year", async () => {
    const { agent, user } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent);
    const accountId = accountResponse.body.data.account._id;

    const payload = {
      accountId,
      amount: 10000,
      month: 7,
      year: 2026,
      alertThreshold: 80,
    };

    const firstResponse = await agent.post("/api/v1/budgets").send(payload);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await agent.post("/api/v1/budgets").send(payload);

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body.success).toBe(false);

    const budgetCount = await Budget.countDocuments({
      userId: user._id,
      accountId,
      month: 7,
      year: 2026,
    });

    expect(budgetCount).toBe(1);
  });
});