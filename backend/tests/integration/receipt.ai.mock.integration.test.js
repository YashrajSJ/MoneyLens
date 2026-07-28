import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { Receipt } from "../../src/modules/receipt/receipt.model.js";
import { RECEIPT_STATUSES } from "../../src/modules/receipt/receipt.constants.js";

const generateContentMock = jest.fn();

jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: generateContentMock,
    })),
  })),
}));

const { processReceiptParsingJobService, markReceiptParsingFailedService } =
  await import("../../src/modules/receipt/receipt.service.js");

describe("Receipt AI Parsing With Mocked Gemini", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const imageBytes = new Uint8Array([1, 2, 3]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => imageBytes.buffer,
    });
  });

  test("should parse receipt and save normalized extracted data", async () => {
    const userId = new mongoose.Types.ObjectId();

    const receipt = await Receipt.create({
      userId,
      imageUrl: "https://example.com/receipt.jpg",
      publicId: "test/receipt",
      originalName: "receipt.jpg",
      mimeType: "image/jpeg",
      size: 1000,
      status: RECEIPT_STATUSES.PROCESSING,
    });

    generateContentMock.mockResolvedValue({
      response: {
        text: () => `
Here is the extracted JSON:
{
  "merchantName": "D-Mart",
  "amount": 1200,
  "date": "2026-07-24",
  "category": "groceries",
  "type": "EXPENSE",
  "paymentMethod": "UPI",
  "description": "D-Mart receipt",
  "confidence": 0.95
}
`,
      },
    });

    const result = await processReceiptParsingJobService({
      userId,
      receiptId: receipt._id,
      jobId: "receipt-job-1",
    });

    expect(result.status).toBe(RECEIPT_STATUSES.PARSED);

    const updatedReceipt = await Receipt.findById(receipt._id).lean();

    expect(updatedReceipt.status).toBe(RECEIPT_STATUSES.PARSED);
    expect(updatedReceipt.extractedData.merchantName).toBe("D-Mart");
    expect(updatedReceipt.extractedData.amount).toBe(1200);
    expect(updatedReceipt.extractedData.category).toBe("groceries");
    expect(updatedReceipt.extractedData.paymentMethod).toBe("UPI");
    expect(updatedReceipt.parsedAt).toBeTruthy();
  });

  test("should mark receipt as FAILED when parsing permanently fails", async () => {
    const userId = new mongoose.Types.ObjectId();

    const receipt = await Receipt.create({
      userId,
      imageUrl: "https://example.com/receipt.jpg",
      publicId: "test/receipt",
      originalName: "receipt.jpg",
      mimeType: "image/jpeg",
      size: 1000,
      status: RECEIPT_STATUSES.PROCESSING,
    });

    await markReceiptParsingFailedService({
      userId,
      receiptId: receipt._id,
      jobId: "receipt-job-2",
      error: new Error("AI response did not contain valid JSON"),
    });

    const updatedReceipt = await Receipt.findById(receipt._id).lean();

    expect(updatedReceipt.status).toBe(RECEIPT_STATUSES.FAILED);
    expect(updatedReceipt.errorMessage).toBe(
      "AI response did not contain valid JSON",
    );
    expect(updatedReceipt.parsingJobId).toBe("receipt-job-2");
  });
});