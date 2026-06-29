import { Queue } from "bullmq";

import { redisConnection } from "../../db/redis.js";
import { QUEUE_NAMES } from "./job.constants.js";

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    age: 60 * 60 * 24,
    count: 1000,
  },
  removeOnFail: {
    age: 60 * 60 * 24 * 7,
  },
};

const recurringQueue = new Queue(QUEUE_NAMES.RECURRING, {
  connection: redisConnection,
  defaultJobOptions,
});

const insightQueue = new Queue(QUEUE_NAMES.INSIGHT, {
  connection: redisConnection,
  defaultJobOptions,
});

const queueMap = {
  [QUEUE_NAMES.RECURRING]: recurringQueue,
  [QUEUE_NAMES.INSIGHT]: insightQueue,
};

const closeJobQueues = async () => {
  await Promise.all([recurringQueue.close(), insightQueue.close()]);
};

export { recurringQueue, insightQueue, queueMap, closeJobQueues };