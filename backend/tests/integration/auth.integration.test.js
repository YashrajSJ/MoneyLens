import request from "supertest";

import app from "../../src/app.js";
import {
  createTestUserPayload,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Auth Module", () => {
  test("should register a new user", async () => {
    const payload = createTestUserPayload();

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(payload.email);
    expect(response.body.data.user.password).toBeUndefined();
  });

  test("should login user and return current user using cookie", async () => {
    const { agent, userPayload } = await registerAndLoginUser();

    const response = await agent.get("/api/v1/auth/current-user");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userPayload.email);
  });

  test("should reject current-user without login", async () => {
    const response = await request(app).get("/api/v1/auth/current-user");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});