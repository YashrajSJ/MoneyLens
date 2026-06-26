import mongoose from "mongoose";

import { Insight } from "./insight.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const resolveInsight = asyncHandler(async (req, res, next) => {
  const { insightId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(insightId)) {
    throw new ApiError(400, "Invalid insight id");
  }

  const insight = await Insight.findOne({
    _id: insightId,
    userId: req.user._id,
  }).lean();

  if (!insight) {
    throw new ApiError(404, "Insight not found");
  }

  req.insight = insight;
  next();
});

export { resolveInsight };