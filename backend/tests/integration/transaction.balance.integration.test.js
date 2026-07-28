import { Account } from "../../src/modules/account/account.model.js";
import { Transaction } from "../../src/modules/transaction/transaction.model.js";
import {
  createAccount,
  createTransaction,
  registerAndLoginUser,
} from "../helpers/testHelpers.js";

describe("Transaction Balance Logic", () => {
  test("completed expense should decrease account balance", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 1500,
      description: "Groceries",
      category: "groceries",
    });

    expect(response.statusCode).toBe(201);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(8500);
  });

  test("completed income should increase account balance", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response } = await createTransaction(agent, {
      accountId,
      type: "INCOME",
      amount: 5000,
      description: "Salary",
      category: "salary",
      paymentMethod: "BANK_TRANSFER",
    });

    expect(response.statusCode).toBe(201);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(15000);
  });

  test("pending transaction should not affect account balance", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 2000,
      description: "Pending bill",
      category: "bills",
      status: "PENDING",
    });

    expect(response.statusCode).toBe(201);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(10000);
  });

  test("deleting completed expense should restore account balance", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response: transactionResponse } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 3000,
      description: "Shopping",
      category: "shopping",
    });

    const transactionId = transactionResponse.body.data.transaction._id;

    const deleteResponse = await agent.delete(
      `/api/v1/transaction/${transactionId}`,
    );

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    const account = await Account.findById(accountId).lean();
    const transactionCount = await Transaction.countDocuments({
      _id: transactionId,
    });

    expect(account.balance).toBe(10000);
    expect(transactionCount).toBe(0);
  });

  test("updating completed expense amount should update balance by net effect", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response: transactionResponse } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 1000,
      category: "food",
    });

    const transactionId = transactionResponse.body.data.transaction._id;

    const updateResponse = await agent
      .patch(`/api/v1/transaction/${transactionId}`)
      .send({
        amount: 1500,
      });

    expect(updateResponse.statusCode).toBe(200);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(8500);
  });

  test("changing completed expense to income should reverse old effect and apply new effect", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response: transactionResponse } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 1000,
      category: "food",
    });

    const transactionId = transactionResponse.body.data.transaction._id;

    const updateResponse = await agent
      .patch(`/api/v1/transaction/${transactionId}`)
      .send({
        type: "INCOME",
        category: "salary",
      });

    expect(updateResponse.statusCode).toBe(200);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(11000);
  });

  test("changing completed transaction to pending should reverse balance effect", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response: transactionResponse } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 1000,
      category: "food",
      status: "COMPLETED",
    });

    const transactionId = transactionResponse.body.data.transaction._id;

    const updateResponse = await agent
      .patch(`/api/v1/transaction/${transactionId}`)
      .send({
        status: "PENDING",
      });

    expect(updateResponse.statusCode).toBe(200);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(10000);
  });

  test("changing pending transaction to completed should apply balance effect", async () => {
    const { agent } = await registerAndLoginUser();

    const accountResponse = await createAccount(agent, {
      balance: 10000,
    });

    const accountId = accountResponse.body.data.account._id;

    const { response: transactionResponse } = await createTransaction(agent, {
      accountId,
      type: "EXPENSE",
      amount: 1000,
      category: "food",
      status: "PENDING",
    });

    const transactionId = transactionResponse.body.data.transaction._id;

    const updateResponse = await agent
      .patch(`/api/v1/transaction/${transactionId}`)
      .send({
        status: "COMPLETED",
      });

    expect(updateResponse.statusCode).toBe(200);

    const account = await Account.findById(accountId).lean();

    expect(account.balance).toBe(9000);
  });

  test("moving completed transaction to another account should update both balances", async () => {
    const { agent } = await registerAndLoginUser();

    const firstAccountResponse = await createAccount(agent, {
      name: "Savings",
      balance: 10000,
      isDefault: true,
    });

    const secondAccountResponse = await createAccount(agent, {
      name: "Wallet",
      type: "CASH",
      balance: 20000,
      isDefault: false,
    });

    const firstAccountId = firstAccountResponse.body.data.account._id;
    const secondAccountId = secondAccountResponse.body.data.account._id;

    const { response: transactionResponse } = await createTransaction(agent, {
      accountId: firstAccountId,
      type: "EXPENSE",
      amount: 1000,
      category: "food",
      status: "COMPLETED",
    });

    const transactionId = transactionResponse.body.data.transaction._id;

    const updateResponse = await agent
      .patch(`/api/v1/transaction/${transactionId}`)
      .send({
        accountId: secondAccountId,
      });

    expect(updateResponse.statusCode).toBe(200);

    const firstAccount = await Account.findById(firstAccountId).lean();
    const secondAccount = await Account.findById(secondAccountId).lean();

    expect(firstAccount.balance).toBe(10000);
    expect(secondAccount.balance).toBe(19000);
  });
});