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

const receiptQueue = new Queue(QUEUE_NAMES.RECEIPT, {
  connection: redisConnection,
  defaultJobOptions,
});

const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: redisConnection,
  defaultJobOptions,
});

const queueMap = {
  [QUEUE_NAMES.RECURRING]: recurringQueue,
  [QUEUE_NAMES.INSIGHT]: insightQueue,
  [QUEUE_NAMES.RECEIPT]: receiptQueue,
  [QUEUE_NAMES.EMAIL]: emailQueue,
};

const closeJobQueues = async () => {
  await Promise.all([
    recurringQueue.close(),
    insightQueue.close(),
    receiptQueue.close(),
    emailQueue.close(),
  ]);
};

export {
  recurringQueue,
  insightQueue,
  receiptQueue,
  emailQueue,
  queueMap,
  closeJobQueues,
};