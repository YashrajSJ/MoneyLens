import {
  createAccount,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Ownership Enforcement", () => {
  test("user should not access another user's account", async () => {
    const userA = await registerAndLoginUser();
    const userB = await registerAndLoginUser();

    const accountResponse = await createAccount(userA.agent);
    const accountId = accountResponse.body.data.account._id;

    const response = await userB.agent.get(`/api/v1/account/${accountId}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("user should not create transaction for another user's account", async () => {
    const userA = await registerAndLoginUser();
    const userB = await registerAndLoginUser();

    const accountResponse = await createAccount(userA.agent);
    const accountId = accountResponse.body.data.account._id;

    const response = await userB.agent.post("/api/v1/transaction").send({
      accountId,
      type: "EXPENSE",
      amount: 500,
      description: "Unauthorized expense",
      category: "food",
      date: "2026-07-24",
      paymentMethod: "UPI",
      status: "COMPLETED",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});