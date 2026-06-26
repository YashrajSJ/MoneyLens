import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  deleteInsightService,
  generateInsightsService,
  getInsightByIdService,
  getInsightsService,
  getMonthlySummaryService,
  markInsightAsReadService,
} from "./insight.service.js";

const generateInsights = asyncHandler(async (req, res) => {
  const result = await generateInsightsService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "AI insights generated successfully"));
});

const getInsights = asyncHandler(async (req, res) => {
  const result = await getInsightsService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Insights fetched successfully"));
});

const getInsightById = asyncHandler(async (req, res) => {
  const insight = await getInsightByIdService({
    insight: req.insight,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { insight }, "Insight fetched successfully"));
});

const getMonthlySummary = asyncHandler(async (req, res) => {
  const result = await getMonthlySummaryService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Monthly summary fetched successfully"));
});

const markInsightAsRead = asyncHandler(async (req, res) => {
  const insight = await markInsightAsReadService({
    userId: req.user._id,
    insightId: req.insight._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { insight }, "Insight marked as read"));
});

const deleteInsight = asyncHandler(async (req, res) => {
  await deleteInsightService({
    userId: req.user._id,
    insightId: req.insight._id,
  });

  logger.info(
    {
      userId: req.user._id,
      insightId: req.insight._id,
    },
    "Insight deleted",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Insight deleted successfully"));
});

export {
  generateInsights,
  getInsights,
  getInsightById,
  getMonthlySummary,
  markInsightAsRead,
  deleteInsight,
};
