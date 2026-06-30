import { Job } from "bullmq";

import { ApiError } from "../../utils/ApiError.js";

import { queueMap } from "./job.queue.js";

import {
  enqueueInsightGenerationJob,
  enqueueRecurringProcessingJob,
  upsertUserRecurringScheduler,
} from "./job.producer.js";

const buildSafeJobData = (data = {}) => {
  return {
    userId: data.userId,
    month: data.month,
    year: data.year,
    asOf: data.asOf,
    limit: data.limit,
    source: data.source,
    receiptId: data.receiptId,
  };
};

const enqueueRecurringJobService = async ({ userId, body }) => {
  const job = await enqueueRecurringProcessingJob({
    userId,
    asOf: body.asOf,
    limit: body.limit,
  });

  return {
    jobId: job.id,
    queueName: job.queueName,
  };
};

const enqueueInsightJobService = async ({ userId, body }) => {
  const now = new Date();

  const job = await enqueueInsightGenerationJob({
    userId,
    month: body.month || now.getUTCMonth() + 1,
    year: body.year || now.getUTCFullYear(),
  });

  return {
    jobId: job.id,
    queueName: job.queueName,
  };
};

const scheduleRecurringJobService = async ({ userId, body }) => {
  const job = await upsertUserRecurringScheduler({
    userId,
    pattern: body.pattern,
    limit: body.limit,
  });

  return {
    jobId: job.id,
    queueName: job.queueName,
    schedulerId: `user-recurring:${userId}`,
  };
};

const getJobStatusService = async ({ userId, queueName, jobId }) => {
  const queue = queueMap[queueName];

  if (!queue) {
    throw new ApiError(400, "Invalid queue name");
  }

  const job = await Job.fromId(queue, jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (String(job.data?.userId) !== String(userId)) {
    throw new ApiError(403, "You are not allowed to access this job");
  }

  const state = await job.getState();

  return {
    id: job.id,
    name: job.name,
    queueName,
    state,
    data: buildSafeJobData(job.data),
    progress: job.progress,
    failedReason: state === "failed" ? job.failedReason : undefined,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
};

export {
  enqueueRecurringJobService,
  enqueueInsightJobService,
  scheduleRecurringJobService,
  getJobStatusService,
};