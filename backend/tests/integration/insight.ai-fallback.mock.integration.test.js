import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { Account } from "../../src/modules/account/account.model.js";
import { Transaction } from "../../src/modules/transaction/transaction.model.js";
import { Insight } from "../../src/modules/insight/insight.model.js";

const generateContentMock = jest.fn();

jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: generateContentMock,
    })),
  })),
}));

const { generateInsightsService } = await import(
  "../../src/modules/insight/insight.service.js"
);

describe("AI Insight Fallback With Mocked Gemini", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create rule-based insight when Gemini fails", async () => {
    const userId = new mongoose.Types.ObjectId();

    const account = await Account.create({
      userId,
      name: "Savings",
      type: "SAVINGS",
      balance: 10000,
      isDefault: true,
    });

    await Transaction.create([
      {
        userId,
        accountId: account._id,
        type: "INCOME",
        amount: 1000,
        description: "Small income",
        category: "salary",
        date: new Date("2026-07-05"),
        paymentMethod: "BANK_TRANSFER",
        status: "COMPLETED",
      },
      {
        userId,
        accountId: account._id,
        type: "EXPENSE",
        amount: 3000,
        description: "Large expense",
        category: "shopping",
        date: new Date("2026-07-10"),
        paymentMethod: "UPI",
        status: "COMPLETED",
      },
    ]);

    generateContentMock.mockRejectedValue(new Error("Gemini unavailable"));

    const result = await generateInsightsService({
      userId: String(userId),
      query: {
        month: 7,
        year: 2026,
      },
    });

    expect(result.fromCache).toBe(false);
    expect(result.insights.length).toBeGreaterThan(0);

    const savedInsights = await Insight.find({
      userId,
      month: 7,
      year: 2026,
    }).lean();

    expect(savedInsights.length).toBeGreaterThan(0);
    expect(savedInsights[0].title).toBeTruthy();
    expect(savedInsights[0].message).toBeTruthy();
  });
});