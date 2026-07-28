import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";


import mongoSanitize from "express-mongo-sanitize";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware.js";

import healthcheckRouter from "../src/modules/healthcheck/healthcheck.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRouter from "../src/modules/auth/auth.routes.js";
import accountRouter from "../src/modules/account/account.routes.js";
import transactionRouter from "../src/modules/transaction/transaction.route.js";
import budgetRouter from "../src/modules/budget/budget.routes.js";
import analyticsRouter from "../src/modules/analytics/analytics.route.js";
import recurringRouter from "../src/modules/recurring/recurring.route.js";
import receiptRouter from "../src/modules/receipt/receipt.route.js";
import insightRouter from "../src/modules/insight/insight.route.js";
import jobRouter from "../src/modules/jobs/job.route.js";
import notificationRouter from "../src/modules/notification/notification.route.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(express.static("public"));

app.use(globalRateLimiter);


app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/transaction", transactionRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/recurring", recurringRouter);
app.use("/api/v1/receipts", receiptRouter);
app.use("/api/v1/insights", insightRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use(errorHandler);

export default app;