import { Account } from "./account.model.js";
import { withTransaction } from "../../utils/withTransaction.js";

import { deleteUserAnalyticsCache } from "../../utils/cache.js";

const createAccountService = async ({ userId, payload }) => {
   const account =await withTransaction(
    async (session) => {
      const {
        name,
        type,
        balance = 0,
        isDefault = false,
        institutionName,
        color,
      } = payload;

      const existingAccountsCount = await Account.countDocuments({
        userId,
      }).session(session);

      const shouldBeDefault = existingAccountsCount === 0 || isDefault === true;

      if (shouldBeDefault) {
        await Account.updateMany(
          { userId, isDefault: true },
          { $set: { isDefault: false } },
          { session }
        );
      }

      const [account] = await Account.create(
        [
          {
            userId,
            name,
            type,
            balance,
            isDefault: shouldBeDefault,
            institutionName,
            color,
          },
        ],
        { session }
      );

      return account;
    },
    { action: "createAccount", userId }
  );
  await deleteUserAnalyticsCache(userId);

  return account;
};

const getAccountsService = async ({ userId }) => {
  return await Account.find({ userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

const updateAccountService = async ({ userId, account, payload }) => {
  const updatedAccount = await withTransaction(
    async (session) => {
      if (payload.isDefault === true) {
        await Account.updateMany(
          {
            userId,
            _id: { $ne: account._id },
            isDefault: true,
          },
          { $set: { isDefault: false } },
          { session }
        );
      }

      const allowedFields = [
        "name",
        "type",
        "balance",
        "isDefault",
        "institutionName",
        "color",
      ];

      allowedFields.forEach((field) => {
        if (payload[field] !== undefined) {
          account[field] = payload[field];
        }
      });

      await account.save({ session });

      return account;
    },
    { action: "updateAccount", userId, accountId: account._id }
  );
  await deleteUserAnalyticsCache(userId);

  return updatedAccount;
};

const setDefaultAccountService = async ({ userId, account}) => {
  const updatedAccount = await withTransaction(
    async (session) => {
      await Account.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );

      account.isDefault = true;
      await account.save({ session });

      return account;
    },
    { action: "setDefaultAccount", userId, accountId: account._id }
  );
  await deleteUserAnalyticsCache(userId);

  return updatedAccount;
};

const deleteAccountService = async ({ userId, account }) => {
  const result = await withTransaction(
    async (session) => {
      const wasDefault = account.isDefault;

      await Account.deleteOne(
        {
          _id: account._id,
          userId,
        },
        { session }
      );

      if (wasDefault) {
        const nextAccount = await Account.findOne({ userId })
          .sort({ createdAt: -1 })
          .session(session);

        if (nextAccount) {
          nextAccount.isDefault = true;
          await nextAccount.save({ session });
        }
      }

      return null;
    },
    { action: "deleteAccount", userId, accountId: account._id}
  );
  await deleteUserAnalyticsCache(userId);

  return result;
};

export {
  createAccountService,
  getAccountsService,
  updateAccountService,
  setDefaultAccountService,
  deleteAccountService,
};