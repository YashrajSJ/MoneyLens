import { getBalanceEffect } from "../../src/modules/transaction/transaction.service.js";

describe("getBalanceEffect", () => {
  test.each([
    ["INCOME", "COMPLETED", 1000, 1000],
    ["EXPENSE", "COMPLETED", 1000, -1000],
    ["INCOME", "PENDING", 1000, 0],
    ["EXPENSE", "PENDING", 1000, 0],
    ["INCOME", "FAILED", 1000, 0],
    ["EXPENSE", "FAILED", 1000, 0],
  ])(
    "%s %s of %d should produce balance effect %d",
    (type, status, amount, expected) => {
      expect(
        getBalanceEffect({
          type,
          status,
          amount,
        }),
      ).toBe(expected);
    },
  );
});