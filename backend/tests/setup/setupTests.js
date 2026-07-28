import mongoose from "mongoose";

import { closeRedisConnection } from "../../src/db/redis.js";
import { closeJobQueues } from "../../src/modules/jobs/job.queue.js";

beforeAll(async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must run with NODE_ENV=test");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for tests");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const databaseName = mongoose.connection.name;

  if (!databaseName.endsWith("_test")) {
    await mongoose.disconnect();

    throw new Error(
      `Refusing to run tests against unsafe database: ${databaseName}`,
    );
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await closeJobQueues().catch(() => {});
  await closeRedisConnection().catch(() => {});
  await mongoose.disconnect();
});