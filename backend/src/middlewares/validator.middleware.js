import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];

  errors.array().forEach((error) => {
    extractedErrors.push({
      [error.path]: error.msg,
    });
  });

  throw new ApiError(422, "Received data is not valid", extractedErrors);
};

export { validate };