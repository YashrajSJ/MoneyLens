import { param, query } from "express-validator";

import {
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
  MAX_INSIGHT_PAGE_SIZE,
} from "./insight.constants.js";

const generateInsightsValidator = () => [
  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be valid")
    .toInt(),
];

const getInsightsValidator = () => [
  query("type")
    .optional()
    .isIn(INSIGHT_TYPES)
    .withMessage("Invalid insight type"),

  query("severity")
    .optional()
    .isIn(INSIGHT_SEVERITIES)
    .withMessage("Invalid insight severity"),

  query("isRead")
    .optional()
    .isBoolean()
    .withMessage("isRead must be true or false")
    .toBoolean(),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_INSIGHT_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${MAX_INSIGHT_PAGE_SIZE}`)
    .toInt(),

  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be valid")
    .toInt(),
];

const insightIdValidator = () => [
  param("insightId").isMongoId().withMessage("Invalid insight id"),
];

const monthlySummaryValidator = () => [
  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be valid")
    .toInt(),
];

export { generateInsightsValidator, getInsightsValidator, insightIdValidator, monthlySummaryValidator };
