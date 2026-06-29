import { body, param } from "express-validator";

import {
  DEFAULT_RECURRING_JOB_LIMIT,
  QUEUE_NAMES,
} from "./job.constants.js";

const enqueueRecurringJobValidator = () => [
  body("asOf")
    .optional()
    .isISO8601()
    .withMessage("asOf must be a valid date"),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
];

const enqueueInsightJobValidator = () => [
  body("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  body("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be valid")
    .toInt(),
];

const scheduleRecurringJobValidator = () => [
  body("pattern")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Pattern must be a valid cron expression"),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage(
      `Limit must be between 1 and 50`
    )
    .toInt(),
];

const jobStatusValidator = () => [
  param("queueName")
    .isIn(Object.values(QUEUE_NAMES))
    .withMessage("Invalid queue name"),

  param("jobId").notEmpty().withMessage("Job id is required"),
];

export {
  enqueueRecurringJobValidator,
  enqueueInsightJobValidator,
  scheduleRecurringJobValidator,
  jobStatusValidator,
};