import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  deleteInsight,
  generateInsights,
  getInsightById,
  getInsights,
  getMonthlySummary,
  markInsightAsRead,
} from "./insight.controller.js";

import { resolveInsight } from "./insight.middleware.js";

import {
  generateInsightsValidator,
  getInsightsValidator,
  insightIdValidator,
  monthlySummaryValidator,
} from "./insight.validator.js";

import { aiRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.use(verifyJWT);  

router
  .route("/generate")
  .post(generateInsightsValidator(), validate, aiRateLimiter, generateInsights);

router
  .route("/monthly-summary")
  .get(monthlySummaryValidator(), validate, getMonthlySummary);

router.route("/").get(getInsightsValidator(), validate, getInsights);

router
  .route("/:insightId/read")
  .patch(insightIdValidator(), validate, resolveInsight, markInsightAsRead);

router
  .route("/:insightId")
  .get(insightIdValidator(), validate, resolveInsight, getInsightById)
  .delete(insightIdValidator(), validate, resolveInsight, deleteInsight);

export default router;
