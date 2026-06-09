import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(
    {
      err,
      method: req.method,
      path: req.originalUrl,
    },
    "Request failed"
  );

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  return res.status(500).json({
    statusCode: 500,
    success: false,
    message: "Internal Server Error",
    errors: [],
    data: null,
  });
};

export { errorHandler };