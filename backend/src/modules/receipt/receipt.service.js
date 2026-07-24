import { GoogleGenerativeAI } from "@google/generative-ai";
import streamifier from "streamifier";

import { cloudinary } from "../../config/cloudinary.js";

import { Account } from "../account/account.model.js";
import {
  ALL_CATEGORIES,
  PAYMENT_METHODS,
} from "../transaction/transaction.constants.js";

import { createTransactionWithSession } from "../transaction/transaction.service.js";
import { withTransaction } from "../../utils/withTransaction.js";
import { deleteUserAnalyticsCache } from "../../utils/cache.js";

import { enqueueReceiptParsingJob } from "../jobs/job.producer.js";

import { Receipt } from "./receipt.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";

import {
  CLOUDINARY_RECEIPT_FOLDER,
  DEFAULT_RECEIPT_PAGE_SIZE,
  RECEIPT_STATUSES,
} from "./receipt.constants.js";

const uploadReceiptToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_RECEIPT_FOLDER,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new ApiError(502, "Cloudinary upload failed"));
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

const extractJsonFromAiText = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new ApiError(502, "AI response did not contain valid JSON");
  }

  return cleaned.slice(start, end + 1);
};

const normalizeExtractedReceiptData = (data) => {
  const amount = Number(data.amount);
  const parsedDate = data.date ? new Date(data.date) : undefined;

  const category = ALL_CATEGORIES.includes(data.category)
    ? data.category
    : "other-expense";

  const paymentMethod = PAYMENT_METHODS.includes(data.paymentMethod)
    ? data.paymentMethod
    : "OTHER";

  return {
    merchantName: data.merchantName || data.merchant || "",
    amount: Number.isNaN(amount) ? undefined : amount,
    date:
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : undefined,
    category,
    type: data.type === "INCOME" ? "INCOME" : "EXPENSE",
    paymentMethod,
    description:
      data.description ||
      data.merchantName ||
      data.merchant ||
      "Receipt transaction",
    confidence:
      typeof data.confidence === "number"
        ? Math.min(Math.max(data.confidence, 0), 1)
        : undefined,
  };
};

const validateExtractedReceiptData = (data) => {
  const errors = [];

  if (!data.amount || data.amount <= 0) {
    errors.push("Valid amount is required");
  }

  if (!data.date || Number.isNaN(new Date(data.date).getTime())) {
    errors.push("Valid date is required");
  }

  if (!data.description) {
    errors.push("Description is required");
  }

  if (errors.length > 0) {
    throw new ApiError(422, `Invalid receipt data: ${errors.join(", ")}`);
  }
};

const extractReceiptDataWithAI = async ({ imageUrl, mimeType }) => {
  if (!process.env.AI_API_KEY) {
    throw new ApiError(500, "AI API key is not configured");
  }

  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new ApiError(502, "Failed to download receipt image for parsing");
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.AI_MODEL || "gemini-3.1-flash-lite",
  });

  const prompt = `
Extract transaction data from this receipt image.

Return only valid JSON. Do not include markdown.

Schema:
{
  "merchantName": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "category": "groceries | food | shopping | travel | utilities | healthcare | entertainment | education | personal | bills | other-expense",
  "type": "EXPENSE",
  "paymentMethod": "CARD | CASH | BANK_TRANSFER | UPI | OTHER",
  "description": "string",
  "confidence": number
}

Rules:
- If it is not a valid receipt, return {}.
- amount must be the final total paid.
- type should usually be EXPENSE for receipts.
- Use only allowed category and payment method values.
`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType,
      },
    },
  ]);

  const text = result.response.text();
  const parsed = JSON.parse(extractJsonFromAiText(text));

  const normalized = normalizeExtractedReceiptData(parsed);
  validateExtractedReceiptData(normalized);

  return {
    raw: parsed,
    normalized,
  };
};

const ensureOwnedAccount = async ({ userId, accountId }) => {
  if (!accountId) return null;

  const account = await Account.findOne({
    _id: accountId,
    userId,
  }).lean();

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  return account;
};

const scanReceiptService = async ({ userId, file }) => {
  if (!file) {
    throw new ApiError(
      400,
      "Receipt image is required. Use form-data field name 'receipt'.",
    );
  }

  let uploadedImage;
  let receipt;
  let job;

  try {
    uploadedImage = await uploadReceiptToCloudinary(file);

    receipt = await Receipt.create({
      userId,
      imageUrl: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: RECEIPT_STATUSES.PROCESSING,
      processingStartedAt: new Date(),
    });

    job = await enqueueReceiptParsingJob({
      userId,
      receiptId: receipt._id,
    });

    receipt.parsingJobId = job.id;
    await receipt.save();

    logger.info(
      {
        userId,
        receiptId: receipt._id,
        jobId: job.id,
      },
      "Receipt uploaded and parsing job queued",
    );

    return {
      receipt,
      job: {
        jobId: job.id,
        queueName: job.queueName,
      },
    };
  } catch (error) {
    if (job?.id) {
      await job.remove().catch(() => {});
    }

    if (receipt?._id) {
      await Receipt.deleteOne({ _id: receipt._id }).catch(() => {});
    }

    if (uploadedImage?.public_id) {
      await cloudinary.uploader
        .destroy(uploadedImage.public_id)
        .catch(() => {});
    }

    throw error;
  }
};

const processReceiptParsingJobService = async ({
  userId,
  receiptId,
  jobId,
}) => {
  const receipt = await Receipt.findOne({
    _id: receiptId,
    userId,
  });

  if (!receipt) {
    throw new ApiError(404, "Receipt not found");
  }

  if (receipt.status === RECEIPT_STATUSES.PARSED) {
    return {
      receiptId: receipt._id,
      status: receipt.status,
      alreadyParsed: true,
    };
  }

  if (receipt.status !== RECEIPT_STATUSES.PROCESSING) {
    throw new ApiError(409, "Receipt is not in processing state");
  }

  const extracted = await extractReceiptDataWithAI({
    imageUrl: receipt.imageUrl,
    mimeType: receipt.mimeType,
  });

  receipt.status = RECEIPT_STATUSES.PARSED;
  receipt.extractedData = extracted.normalized;
  receipt.rawAiResponse = extracted.raw;
  receipt.errorMessage = undefined;
  receipt.parsedAt = new Date();
  receipt.parsingJobId = jobId;

  await receipt.save();

  logger.info(
    {
      userId,
      receiptId: receipt._id,
      jobId,
    },
    "Receipt parsed successfully",
  );

  return {
    receiptId: receipt._id,
    status: receipt.status,
  };
};

const markReceiptParsingFailedService = async ({
  userId,
  receiptId,
  jobId,
  error,
}) => {
  const receipt = await Receipt.findOne({
    _id: receiptId,
    userId,
  });

  if (!receipt) {
    return;
  }

  if (receipt.status === RECEIPT_STATUSES.PARSED) {
    return;
  }

  receipt.status = RECEIPT_STATUSES.FAILED;
  receipt.errorMessage = error.message;
  receipt.parsingJobId = jobId;

  await receipt.save();

  logger.error(
    {
      err: error,
      userId,
      receiptId,
      jobId,
    },
    "Receipt parsing failed after final attempt",
  );
};

const retryReceiptParsingService = async ({ userId, receipt }) => {
  if (String(receipt.userId) !== String(userId)) {
    throw new ApiError(403, "You are not allowed to access this receipt");
  }

  if (receipt.status === RECEIPT_STATUSES.PROCESSING) {
    throw new ApiError(409, "Receipt parsing is already in progress");
  }

  if (receipt.status === RECEIPT_STATUSES.PARSED) {
    throw new ApiError(409, "Receipt is already parsed");
  }

  const updatedReceipt = await Receipt.findOneAndUpdate(
    {
      _id: receipt._id,
      userId,
    },
    {
      $set: {
        status: RECEIPT_STATUSES.PROCESSING,
        errorMessage: undefined,
        processingStartedAt: new Date(),
      },
      $unset: {
        parsingJobId: "",
      },
    },
    {
      new: true,
    },
  );

  if (!updatedReceipt) {
    throw new ApiError(404, "Receipt not found");
  }

  try {
    const job = await enqueueReceiptParsingJob({
      userId,
      receiptId: updatedReceipt._id,
      source: "RETRY",
    });

    updatedReceipt.parsingJobId = job.id;
    await updatedReceipt.save();

    return {
      receipt: updatedReceipt,
      job: {
        jobId: job.id,
        queueName: job.queueName,
      },
    };
  } catch (error) {
    await Receipt.findOneAndUpdate(
      {
        _id: updatedReceipt._id,
        userId,
      },
      {
        $set: {
          status: RECEIPT_STATUSES.FAILED,
          errorMessage: error.message,
        },
      },
    );

    throw error;
  }
};

const getReceiptsService = async ({ userId, query }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || DEFAULT_RECEIPT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  const filter = {
    userId,
  };

  if (query.status) {
    filter.status = query.status;
  }

  const [receipts, total] = await Promise.all([
    Receipt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

    Receipt.countDocuments(filter),
  ]);

  return {
    receipts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getReceiptByIdService = async ({ receipt }) => {
  return receipt;
};

const prepareTransactionFromReceiptService = async ({
  userId,
  receipt,
  accountId,
}) => {
  if (String(receipt.userId) !== String(userId)) {
    throw new ApiError(403, "You are not allowed to access this receipt");
  }

  if (receipt.transactionId) {
    throw new ApiError(409, "Receipt is already linked to a transaction");
  }

  if (accountId) {
    await ensureOwnedAccount({ userId, accountId });
  }

  if (receipt.status !== RECEIPT_STATUSES.PARSED) {
    throw new ApiError(400, "Receipt is not parsed yet");
  }

  const data = receipt.extractedData || {};

  validateExtractedReceiptData(data);

  return {
    transactionDraft: {
      accountId: accountId || undefined,
      type: data.type || "EXPENSE",
      amount: data.amount,
      description:
        data.description || data.merchantName || "Receipt transaction",
      category: data.category || "other-expense",
      date: data.date,
      paymentMethod: data.paymentMethod || "OTHER",
      merchantName: data.merchantName || "",
      receiptUrl: receipt.imageUrl,
      receiptId: receipt._id,
    },
  };
};

const confirmReceiptTransactionService = async ({
  userId,
  receipt,
  payload,
}) => {
  if (String(receipt.userId) !== String(userId)) {
    throw new ApiError(403, "You are not allowed to access this receipt");
  }

  if (receipt.status !== RECEIPT_STATUSES.PARSED) {
    throw new ApiError(400, "Receipt is not parsed yet");
  }

  if (receipt.transactionId) {
    throw new ApiError(409, "Receipt is already linked to a transaction");
  }

  const transaction = await withTransaction(async (session) => {
    const lockedReceipt = await Receipt.findOneAndUpdate(
      {
        _id: receipt._id,
        userId,
        status: RECEIPT_STATUSES.PARSED,
        $or: [{ transactionId: { $exists: false } }, { transactionId: null }],
      },
      {
        $set: {
          transactionId: null,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!lockedReceipt) {
      throw new ApiError(409, "Receipt is already linked to a transaction");
    }

    const createdTransaction = await createTransactionWithSession({
      userId,
      payload: {
        accountId: payload.accountId,
        type: payload.type,
        amount: payload.amount,
        description:
          payload.description ||
          lockedReceipt.extractedData?.description ||
          lockedReceipt.extractedData?.merchantName ||
          "Receipt transaction",
        category: payload.category,
        date: payload.date,
        paymentMethod: payload.paymentMethod || "OTHER",
        merchantName:
          payload.merchantName ||
          lockedReceipt.extractedData?.merchantName ||
          "",
        receiptUrl: lockedReceipt.imageUrl,
        receiptId: lockedReceipt._id,
        status: "COMPLETED",
        isRecurring: false,
      },
      session,
    });

    lockedReceipt.transactionId = createdTransaction._id;
    await lockedReceipt.save({ session });

    return createdTransaction;
  }, "confirmReceiptTransaction failed");

  await deleteUserAnalyticsCache(userId);

  const updatedReceipt = await Receipt.findOne({
    _id: receipt._id,
    userId,
  }).lean();

  return {
    receipt: updatedReceipt,
    transaction,
  };
};

const deleteReceiptService = async ({ userId, receipt }) => {
  if (receipt.status === RECEIPT_STATUSES.PROCESSING) {
    throw new ApiError(
      409,
      "Cannot delete receipt while parsing is in progress",
    );
  }

  if (receipt.transactionId) {
    throw new ApiError(409, "Cannot delete receipt linked to a transaction");
  }

  try {
    await cloudinary.uploader.destroy(receipt.publicId);
  } catch (error) {
    logger.error(
      {
        err: error,
        userId,
        receiptId: receipt._id,
        publicId: receipt.publicId,
      },
      "Cloudinary receipt delete failed",
    );
  }

  const result = await Receipt.deleteOne({
    _id: receipt._id,
    userId,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Receipt not found");
  }
};

export {
  scanReceiptService,
  processReceiptParsingJobService,
  markReceiptParsingFailedService,
  retryReceiptParsingService,
  getReceiptsService,
  getReceiptByIdService,
  prepareTransactionFromReceiptService,
  confirmReceiptTransactionService,
  deleteReceiptService,
};
