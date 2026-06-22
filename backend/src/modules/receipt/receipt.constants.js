export const RECEIPT_STATUSES = {
  PROCESSING: "PROCESSING",
  PARSED: "PARSED",
  FAILED: "FAILED",
};

export const RECEIPT_STATUS_VALUES = Object.values(RECEIPT_STATUSES);

export const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_RECEIPT_FILE_SIZE = 5 * 1024 * 1024;

export const DEFAULT_RECEIPT_PAGE_SIZE = 20;
export const MAX_RECEIPT_PAGE_SIZE = 50;

export const CLOUDINARY_RECEIPT_FOLDER = "moneylens/receipts";