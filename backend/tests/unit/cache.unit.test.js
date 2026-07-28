import { jest } from "@jest/globals";

const redisGetMock = jest.fn();
const redisSetMock = jest.fn();
const redisScanMock = jest.fn();
const redisDelMock = jest.fn();

jest.unstable_mockModule("../../src/db/redis.js", () => ({
  redisConnection: {
    get: redisGetMock,
    set: redisSetMock,
    scan: redisScanMock,
    del: redisDelMock,
  },
}));

const {
  buildCacheKey,
  getCache,
  setCache,
  deleteCacheByPattern,
} = await import("../../src/utils/cache.js");

describe("Cache Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should build cache key by ignoring empty values", () => {
    const key = buildCacheKey([
      "analytics",
      "dashboard",
      "user123",
      "",
      undefined,
      "month",
      7,
    ]);

    expect(key).toBe("analytics:dashboard:user123:month:7");
  });

  test("should read and parse cached JSON", async () => {
    redisGetMock.mockResolvedValue(JSON.stringify({ totalBalance: 10000 }));

    const result = await getCache("analytics:dashboard:user123");

    expect(redisGetMock).toHaveBeenCalledWith("analytics:dashboard:user123");
    expect(result).toEqual({ totalBalance: 10000 });
  });

  test("should return null when cache key is missing", async () => {
    redisGetMock.mockResolvedValue(null);

    const result = await getCache("missing:key");

    expect(result).toBeNull();
  });

  test("should stringify and store cache value with TTL", async () => {
    await setCache("test:key", { value: 42 }, 60);

    expect(redisSetMock).toHaveBeenCalledWith(
      "test:key",
      JSON.stringify({ value: 42 }),
      "EX",
      60,
    );
  });

  test("should delete keys by pattern using scan", async () => {
    redisScanMock
      .mockResolvedValueOnce(["5", ["analytics:dashboard:user1:a"]])
      .mockResolvedValueOnce(["0", ["analytics:dashboard:user1:b"]]);

    await deleteCacheByPattern("analytics:dashboard:user1:*");

    expect(redisScanMock).toHaveBeenCalledTimes(2);
    expect(redisDelMock).toHaveBeenCalledWith("analytics:dashboard:user1:a");
    expect(redisDelMock).toHaveBeenCalledWith("analytics:dashboard:user1:b");
  });
});