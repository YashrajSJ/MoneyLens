import { GoogleGenerativeAI } from "@google/generative-ai";
import { cloudinary } from "../../config/cloudinary.js";

import { Account } from "../account/account.model.js";
import {ALL_CATEGORIES, PAYMENT_METHODS } from "../transaction/transaction.constants.js";

import { Receipt } from "./receipt.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";

import {
  CLOUDINARY_RECEIPT_FOLDER,
  DEFAULT_RECEIPT_PAGE_SIZE,
  RECEIPT_STATUSES,
} from "./receipt.constants.js";



const uploadReceiptToCloudinary = async (file) => {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  return await cloudinary.uploader.upload(dataUri, {
    folder: CLOUDINARY_RECEIPT_FOLDER,
    resource_type: "image",
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

const extractReceiptDataWithAI = async (file) => {
  if (!process.env.AI_API_KEY) {
    throw new ApiError(500, "AI API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.AI_MODEL || "gemini-1.5-flash",
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
- If a field is unclear, use a reasonable null-safe value.
- amount must be the final total paid.
- type should usually be EXPENSE for receipts.
`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
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
      "Receipt image is required. Use form-data field name 'receipt'."
    );
  }

  let uploadedImage;
  let receipt;

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
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await cloudinary.uploader.destroy(uploadedImage.public_id).catch(() => {});
    }

    throw error;
  }

  try {
    const extracted = await extractReceiptDataWithAI(file);

    receipt.status = RECEIPT_STATUSES.PARSED;
    receipt.extractedData = extracted.normalized;
    receipt.rawAiResponse = extracted.raw;
    receipt.errorMessage = undefined;

    await receipt.save();

    logger.info(
      {
        userId,
        receiptId: receipt._id,
      },
      "Receipt parsed successfully"
    );

    return receipt;
  } catch (error) {
    receipt.status = RECEIPT_STATUSES.FAILED;
    receipt.errorMessage = error.message;

    await receipt.save();

    logger.error(
      {
        err: error,
        userId,
        receiptId: receipt._id,
      },
      "Receipt parsing failed"
    );

    return receipt;
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
    Receipt.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

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

const deleteReceiptService = async ({ userId, receipt }) => {
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
      "Cloudinary receipt delete failed"
    );
  }

  await Receipt.deleteOne({
    _id: receipt._id,
    userId,
  });
};

export {
  scanReceiptService,
  getReceiptsService,
  getReceiptByIdService,
  prepareTransactionFromReceiptService,
  deleteReceiptService,
};