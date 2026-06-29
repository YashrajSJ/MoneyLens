import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  enqueueInsightJobService,
  enqueueRecurringJobService,
  getJobStatusService,
  scheduleRecurringJobService,
} from "./job.service.js";

const enqueueRecurringJob = asyncHandler(async (req, res) => {
  const result = await enqueueRecurringJobService({
    userId: req.user._id,
    body: req.body,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, result, "Recurring job queued successfully"));
});

const enqueueInsightJob = asyncHandler(async (req, res) => {
  const result = await enqueueInsightJobService({
    userId: req.user._id,
    body: req.body,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, result, "Insight job queued successfully"));
});

const scheduleRecurringJob = asyncHandler(async (req, res) => {
  const result = await scheduleRecurringJobService({
    userId: req.user._id,
    body: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recurring job scheduled successfully"));
});

const getJobStatus = asyncHandler(async (req, res) => {
  const result = await getJobStatusService({
    userId: req.user._id,
    queueName: req.params.queueName,
    jobId: req.params.jobId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Job status fetched successfully"));
});

export {
  enqueueRecurringJob,
  enqueueInsightJob,
  scheduleRecurringJob,
  getJobStatus,
};