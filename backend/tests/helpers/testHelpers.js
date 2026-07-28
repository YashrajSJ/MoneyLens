import { randomUUID } from "node:crypto";
import request from "supertest";

import app from "../../src/app.js";

export const createTestUserPayload = (overrides = {}) => {
  const uniqueId = randomUUID();

  return {
    fullName: "Test User",
    username: `testuser_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: "Password123!",
    ...overrides,
  };
};

export const registerUser = async (payload = createTestUserPayload()) => {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(payload);

  return {
    response,
    payload,
  };
};

export const loginUser = async ({ email, password }) => {
  const agent = request.agent(app);

  const response = await agent.post("/api/v1/auth/login").send({
    email,
    password,
  });

  return {
    agent,
    response,
  };
};

export const registerAndLoginUser = async (overrides = {}) => {
  const payload = createTestUserPayload(overrides);

  const { response: registerResponse } = await registerUser(payload);

  if (registerResponse.statusCode !== 201) {
    throw new Error(
      `Test-user registration failed: ${JSON.stringify(registerResponse.body)}`,
    );
  }

  const { agent, response: loginResponse } = await loginUser({
    email: payload.email,
    password: payload.password,
  });

  if (loginResponse.statusCode !== 200) {
    throw new Error(
      `Test-user login failed: ${JSON.stringify(loginResponse.body)}`,
    );
  }

  const currentUserResponse = await agent.get("/api/v1/auth/current-user");

  if (currentUserResponse.statusCode !== 200) {
    throw new Error(
      `Current-user check failed: ${JSON.stringify(currentUserResponse.body)}`,
    );
  }

  return {
    agent,
    registerResponse,
    loginResponse,
    currentUserResponse,
    user: currentUserResponse.body.data,
    userPayload: payload,
  };
};

export const createAccount = async (agent, overrides = {}) => {
  const response = await agent.post("/api/v1/account").send({
    name: "HDFC Savings",
    type: "SAVINGS",
    balance: 10000,
    institutionName: "HDFC Bank",
    color: "#059669",
    ...overrides,
  });

  if (response.statusCode !== 201) {
    throw new Error(
      `Account creation failed: ${JSON.stringify(response.body)}`,
    );
  }

  return response;
};

export const createTransaction = async (
  agent,
  { accountId, ...overrides } = {},
) => {
  let resolvedAccountId = accountId;

  if (!resolvedAccountId) {
    const accountResponse = await createAccount(agent);
    resolvedAccountId = accountResponse.body.data.account._id;
  }

  const response = await agent.post("/api/v1/transaction").send({
    accountId: resolvedAccountId,
    type: "EXPENSE",
    amount: 1000,
    description: "Test expense",
    category: "food",
    date: "2026-07-24",
    paymentMethod: "UPI",
    status: "COMPLETED",
    ...overrides,
  });

  if (response.statusCode !== 201) {
    throw new Error(
      `Transaction creation failed: ${JSON.stringify(response.body)}`,
    );
  }

  return {
    response,
    accountId: resolvedAccountId,
  };
};