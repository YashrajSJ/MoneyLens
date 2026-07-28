import { Account } from "../../src/modules/account/account.model.js";
import {
  createAccount,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Account Module", () => {
  test("should create first account as default", async () => {
    const { agent, user } = await registerAndLoginUser();

    const response = await createAccount(agent);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.account.isDefault).toBe(true);

    const accountCount = await Account.countDocuments({
      userId: user._id,
    });

    expect(accountCount).toBe(1);
  });

  test("should fetch logged-in user's accounts", async () => {
    const { agent } = await registerAndLoginUser();

    await createAccount(agent);

    const response = await agent.get("/api/v1/account");

    expect(response.statusCode).toBe(200);
    expect(response.body.data.accounts).toHaveLength(1);
  });

  test("should not allow deleting the only account", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent);
    const accountId = accountResponse.body.data.account._id;

    const response = await agent.delete(`/api/v1/account/${accountId}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});