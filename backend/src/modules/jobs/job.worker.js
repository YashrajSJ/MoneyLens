import { Worker } from "bullmq";

import { redisConnection } from "../../db/redis.js";
import { logger } from "../../utils/logger.js";

import { generateInsightsService } from "../insight/insight.service.js";
import { processDueRecurringTransactionsService } from "../recurring/recurring.service.js";

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
        "Recurring job started"
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
    }
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
        "Insight job started"
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
    }
  );

  workers = [recurringWorker, insightWorker];

  workers.forEach((worker) => {
    worker.on("completed", (job) => {
      logger.info(
        {
          jobId: job.id,
          queueName: job.queueName,
        },
        "Job completed"
      );
    });

    worker.on("failed", (job, err) => {
      logger.error(
        {
          err,
          jobId: job?.id,
          queueName: job?.queueName,
        },
        "Job failed"
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