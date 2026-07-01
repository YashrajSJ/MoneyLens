import { mailTransporter } from "../../config/mail.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";

import { enqueueEmailJob } from "../jobs/job.producer.js";

import { EmailLog } from "./emailLog.model.js";
import { EMAIL_STATUS } from "./notification.constants.js";

const queueEmailDeliveryService = async ({
  userId,
  to,
  subject,
  html,
  text,
  type,
  metadata = {},
  dedupeKey,
}) => {
  const emailLog = await EmailLog.create({
    userId,
    to,
    subject,
    type,
    status: EMAIL_STATUS.QUEUED,
    metadata,
  });

  try {
    const job = await enqueueEmailJob({
      userId,
      emailLogId: emailLog._id,
      to,
      subject,
      html,
      text,
      type,
      dedupeKey,
    });

    emailLog.jobId = job.id;
    await emailLog.save();

    return {
      emailLogId: emailLog._id,
      jobId: job.id,
      queueName: job.queueName,
    };
  } catch (error) {
    await EmailLog.findByIdAndUpdate(emailLog._id, {
      $set: {
        status: EMAIL_STATUS.FAILED,
        errorMessage: error.message,
      },
    });

    throw error;
  }
};

const sendQueuedEmailService = async ({
  jobId,
  emailLogId,
  userId,
  to,
  subject,
  html,
  text,
  type,
}) => {
  const emailLog = await EmailLog.findOne({
    _id: emailLogId,
    userId,
  });

  if (!emailLog) {
    throw new ApiError(404, "Email log not found");
  }

  if (emailLog.status === EMAIL_STATUS.SENT) {
    return {
      emailLogId,
      providerMessageId: emailLog.providerMessageId,
      status: EMAIL_STATUS.SENT,
      alreadySent: true,
    };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    emailLog.status = EMAIL_STATUS.SENT;
    emailLog.providerMessageId = info.messageId;
    emailLog.sentAt = new Date();
    emailLog.errorMessage = undefined;

    await emailLog.save();

    logger.info(
      {
        jobId,
        userId,
        emailLogId,
        type,
      },
      "Email sent successfully",
    );

    return {
      emailLogId,
      providerMessageId: info.messageId,
      status: EMAIL_STATUS.SENT,
    };
  } catch (error) {
    emailLog.status = EMAIL_STATUS.FAILED;
    emailLog.errorMessage = error.message;

    await emailLog.save();

    logger.error(
      {
        err: error,
        jobId,
        userId,
        emailLogId,
        type,
      },
      "Email sending failed",
    );

    throw error;
  }
};

export { queueEmailDeliveryService, sendQueuedEmailService };
