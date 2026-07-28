import {
  createAccount,
  createTransaction,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Transaction Filtered Totals", () => {
  test("should return totals for full filtered result, not only current page", async () => {
    const userA = await registerAndLoginUser();
    const userB = await registerAndLoginUser();

    const accountResponse = await createAccount(userA.agent, {
      balance: 50000,
    });

    const accountId = accountResponse.body.data.account._id;

    await createTransaction(userA.agent, {
      accountId,
      type: "INCOME",
      amount: 10000,
      description: "Salary part 1",
      category: "salary",
      date: "2026-07-01",
      paymentMethod: "BANK_TRANSFER",
      status: "COMPLETED",
    });

    await createTransaction(userA.agent, {
      accountId,
      type: "EXPENSE",
      amount: 3000,
      description: "Groceries",
      category: "groceries",
      date: "2026-07-02",
      paymentMethod: "UPI",
      status: "COMPLETED",
    });

    await createTransaction(userA.agent, {
      accountId,
      type: "EXPENSE",
      amount: 2000,
      description: "Food",
      category: "food",
      date: "2026-07-03",
      paymentMethod: "UPI",
      status: "COMPLETED",
    });

    await createTransaction(userA.agent, {
      accountId,
      type: "EXPENSE",
      amount: 9000,
      description: "Outside range",
      category: "travel",
      date: "2026-08-01",
      status: "COMPLETED",
    });

    await createTransaction(userA.agent, {
      accountId,
      type: "EXPENSE",
      amount: 7000,
      description: "Pending expense",
      category: "shopping",
      date: "2026-07-04",
      status: "PENDING",
    });

    const userBAccountResponse = await createAccount(userB.agent, {
      balance: 50000,
    });

    await createTransaction(userB.agent, {
      accountId: userBAccountResponse.body.data.account._id,
      type: "EXPENSE",
      amount: 9999,
      description: "Other user expense",
      category: "food",
      date: "2026-07-05",
      status: "COMPLETED",
    });

    const response = await userA.agent.get(
      `/api/v1/transaction?accountId=${accountId}&from=2026-07-01&to=2026-07-31&page=1&limit=1`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.data.transactions).toHaveLength(1);

    expect(response.body.data.totals.totalIncome).toBe(10000);
    expect(response.body.data.totals.totalExpenses).toBe(5000);
    expect(response.body.data.totals.netMovement).toBe(5000);
    expect(response.body.data.totals.transactionCount).toBe(3);
  });
});