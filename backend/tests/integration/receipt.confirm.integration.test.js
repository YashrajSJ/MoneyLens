import { Account } from "../../src/modules/account/account.model.js";
import { Receipt } from "../../src/modules/receipt/receipt.model.js";
import { Transaction } from "../../src/modules/transaction/transaction.model.js";
import {
  createAccount,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Receipt Confirm Transaction", () => {
  const createParsedReceipt = async (userId) => {
    return await Receipt.create({
      userId,
      imageUrl: "https://example.com/receipt.jpg",
      publicId: "test/receipt",
      originalName: "receipt.jpg",
      mimeType: "image/jpeg",
      size: 1000,
      status: "PARSED",
      extractedData: {
        merchantName: "D-Mart",
        amount: 1200,
        date: new Date("2026-07-24"),
        category: "groceries",
        type: "EXPENSE",
        paymentMethod: "UPI",
        description: "D-Mart receipt",
        confidence: 0.95,
      },
    });
  };

  const createConfirmPayload = (accountId) => ({
    accountId,
    type: "EXPENSE",
    amount: 1200,
    description: "D-Mart receipt",
    category: "groceries",
    date: "2026-07-24",
    paymentMethod: "UPI",
    merchantName: "D-Mart",
  });

  test("should create transaction from parsed receipt and link receipt", async () => {
    const { agent, user } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;
    const receipt = await createParsedReceipt(user._id);

    const response = await agent
      .post(`/api/v1/receipts/${receipt._id}/confirm-transaction`)
      .send(createConfirmPayload(accountId));

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.data.transaction.receiptId).toBe(String(receipt._id));
    expect(response.body.data.receipt.transactionId).toBe(
      response.body.data.transaction._id,
    );

    const account = await Account.findById(accountId).lean();
    const updatedReceipt = await Receipt.findById(receipt._id).lean();

    expect(account.balance).toBe(8800);
    expect(String(updatedReceipt.transactionId)).toBe(
      response.body.data.transaction._id,
    );
  });

  test("should not confirm same receipt twice", async () => {
    const { agent, user } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;
    const receipt = await createParsedReceipt(user._id);
    const payload = createConfirmPayload(accountId);

    const firstResponse = await agent
      .post(`/api/v1/receipts/${receipt._id}/confirm-transaction`)
      .send(payload);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await agent
      .post(`/api/v1/receipts/${receipt._id}/confirm-transaction`)
      .send(payload);

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body.success).toBe(false);

    const transactionCount = await Transaction.countDocuments({
      receiptId: receipt._id,
    });

    expect(transactionCount).toBe(1);
  });
});