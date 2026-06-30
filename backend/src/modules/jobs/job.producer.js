import {
  DEFAULT_RECURRING_JOB_LIMIT,
  JOB_NAMES,
  RECURRING_SCHEDULER_PATTERNS,
} from "./job.constants.js";

import { insightQueue, recurringQueue, receiptQueue } from "./job.queue.js";

const enqueueRecurringProcessingJob = async ({ userId, asOf, limit }) => {
  const safeAsOf = asOf ?? new Date().toISOString();
  const safeLimit = limit ?? DEFAULT_RECURRING_JOB_LIMIT;

  return await recurringQueue.add(
    JOB_NAMES.PROCESS_DUE_RECURRING,
    {
      userId: String(userId),
      asOf: safeAsOf,
      limit: safeLimit,
    },
    {
      jobId: `recurring:${userId}:${safeAsOf}`,
    },
  );
};

const enqueueInsightGenerationJob = async ({ userId, month, year }) => {
  return await insightQueue.add(
    JOB_NAMES.GENERATE_INSIGHTS,
    {
      userId: String(userId),
      month,
      year,
    },
    {
      jobId: `insights:${userId}:${year}:${month}`,
    },
  );
};

const enqueueReceiptParsingJob = async ({
  userId,
  receiptId,
  source = "INITIAL",
}) => {
  const timestamp = Date.now();

  return await receiptQueue.add(
    JOB_NAMES.PARSE_RECEIPT,
    {
      userId: String(userId),
      receiptId: String(receiptId),
      source,
    },
    {
      jobId:
        source === "RETRY"
          ? `receipt-parse:${receiptId}:retry:${timestamp}`
          : `receipt-parse:${receiptId}`,
    }
  );
};

const upsertUserRecurringScheduler = async ({
  userId,
  pattern = RECURRING_SCHEDULER_PATTERNS.DAILY_2_AM,
  limit = DEFAULT_RECURRING_JOB_LIMIT,
}) => {
  return await recurringQueue.upsertJobScheduler(
    `user-recurring:${userId}`,
    {
      pattern,
    },
    {
      name: JOB_NAMES.PROCESS_DUE_RECURRING,
      data: {
        userId: String(userId),
        asOf: null,
        limit,
        source: "SCHEDULER",
      },
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    },
  );
};

export {
  enqueueRecurringProcessingJob,
  enqueueInsightGenerationJob,
  enqueueReceiptParsingJob,
  upsertUserRecurringScheduler,
};
