import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  enqueueInsightJob,
  enqueueRecurringJob,
  getJobStatus,
  scheduleRecurringJob,
} from "./job.controller.js";

import {
  enqueueInsightJobValidator,
  enqueueRecurringJobValidator,
  jobStatusValidator,
  scheduleRecurringJobValidator,
} from "./job.validator.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/recurring/process-due")
  .post(enqueueRecurringJobValidator(), validate, enqueueRecurringJob);

router
  .route("/recurring/schedule")
  .post(scheduleRecurringJobValidator(), validate, scheduleRecurringJob);

router
  .route("/insights/generate")
  .post(enqueueInsightJobValidator(), validate, enqueueInsightJob);

router
  .route("/:queueName/:jobId")
  .get(jobStatusValidator(), validate, getJobStatus);

export default router;