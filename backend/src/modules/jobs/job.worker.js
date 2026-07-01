import { Worker } from "bullmq";

import { redisConnection } from "../../db/redis.js";
import { logger } from "../../utils/logger.js";

import { generateInsightsService } from "../insight/insight.service.js";
import { processDueRecurringTransactionsService } from "../recurring/recurring.service.js";
import {
  markReceiptParsingFailedService,
  processReceiptParsingJobService,
} from "../receipt/receipt.service.js";

import { sendQueuedEmailService } from "../notification/email.service.js";

import { JOB_NAMES, QUEUE_NAMES } from "./job.constants.js";

let workers = [];

const startJobWorkers = () => {
  if (workers.length > 0) {
    logger.warn("BullMQ workers already started");
    return;
  }

  const recurringWorker = new Worker(
    QUEUE_NAMES.RECURRING,
    async (job) => {
      if (job.name !== JOB_NAMES.PROCESS_DUE_RECURRING) {
        throw new Error(`Unknown recurring job: ${job.name}`);
      }

      const { userId, asOf, limit } = job.data;

      logger.info(
        {
          jobId: job.id,
          userId,
          action: job.name,
        },
        "Recurring job started",
      );

      return await processDueRecurringTransactionsService({
        userId,
        query: {
          asOf: asOf ? new Date(asOf) : new Date(),
          limit,
        },
        jobId: job.id,
      });
    },
    {
      connection: redisConnection,
      concurrency: 1,
    },
  );

  const insightWorker = new Worker(
    QUEUE_NAMES.INSIGHT,
    async (job) => {
      if (job.name !== JOB_NAMES.GENERATE_INSIGHTS) {
        throw new Error(`Unknown insight job: ${job.name}`);
      }

      const { userId, month, year } = job.data;

      logger.info(
        {
          jobId: job.id,
          userId,
          action: job.name,
          month,
          year,
        },
        "Insight job started",
      );

      return await generateInsightsService({
        userId,
        query: {
          month,
          year,
        },
      });
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  const receiptWorker = new Worker(
    QUEUE_NAMES.RECEIPT,
    async (job) => {
      if (job.name !== JOB_NAMES.PARSE_RECEIPT) {
        throw new Error(`Unknown receipt job: ${job.name}`);
      }

      const { userId, receiptId } = job.data;

      logger.info(
        {
          jobId: job.id,
          userId,
          receiptId,
          action: job.name,
        },
        "Receipt parsing job started",
      );

      try {
        return await processReceiptParsingJobService({
          userId,
          receiptId,
          jobId: job.id,
        });
      } catch (error) {
        if (error.statusCode === 422) {
          await markReceiptParsingFailedService({
            userId,
            receiptId,
            jobId: job.id,
            error,
          });

          return {
            receiptId,
            status: "FAILED",
            reason: error.message,
            permanentFailure: true,
          };
        }

        const maxAttempts = job.opts.attempts || 1;
        const currentAttempt = job.attemptsMade + 1;
        const isFinalAttempt = currentAttempt >= maxAttempts;

        if (isFinalAttempt) {
          await markReceiptParsingFailedService({
            userId,
            receiptId,
            jobId: job.id,
            error,
          });
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  const emailWorker = new Worker(
    QUEUE_NAMES.EMAIL,
    async (job) => {
      if (job.name !== JOB_NAMES.SEND_EMAIL) {
        throw new Error(`Unknown email job: ${job.name}`);
      }

      logger.info(
        {
          jobId: job.id,
          userId: job.data.userId,
          emailLogId: job.data.emailLogId,
          type: job.data.type,
        },
        "Email job started",
      );

      return await sendQueuedEmailService({
        jobId: job.id,
        ...job.data,
      });
    },
    {
      connection: redisConnection,
      concurrency: 3,
    },
  );

  workers = [recurringWorker, insightWorker, receiptWorker, emailWorker];

  workers.forEach((worker) => {
    worker.on("completed", (job) => {
      logger.info(
        {
          jobId: job.id,
          queueName: job.queueName,
        },
        "Job completed",
      );
    });

    worker.on("failed", (job, err) => {
      logger.error(
        {
          err,
          jobId: job?.id,
          queueName: job?.queueName,
        },
        "Job failed",
      );
    });

    worker.on("error", (err) => {
      logger.error(
        {
          err,
          queueName: worker.name,
        },
        "Worker error",
      );
    });
  });

  logger.info("BullMQ workers started");
};

const stopJobWorkers = async () => {
  if (workers.length === 0) {
    return;
  }

  await Promise.all(workers.map((worker) => worker.close()));
  workers = [];

  logger.info("BullMQ workers stopped");
};

export { startJobWorkers, stopJobWorkers };
