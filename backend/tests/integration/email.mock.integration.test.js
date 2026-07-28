import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { EmailLog } from "../../src/modules/notification/emailLog.model.js";
import {
  EMAIL_STATUS,
  EMAIL_TYPES,
} from "../../src/modules/notification/notification.constants.js";

const sendMailMock = jest.fn();

jest.unstable_mockModule("../../src/config/mail.js", () => ({
  mailTransporter: {
    sendMail: sendMailMock,
  },
}));

jest.unstable_mockModule("../../src/modules/jobs/job.producer.js", () => ({
  enqueueEmailJob: jest.fn(),
}));

const { sendQueuedEmailService } = await import(
  "../../src/modules/notification/email.service.js"
);

describe("Email Service With Mocked SMTP", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should send queued email and mark email log as SENT", async () => {
    const userId = new mongoose.Types.ObjectId();

    const emailLog = await EmailLog.create({
      userId,
      to: "test@example.com",
      subject: "Test email",
      type: EMAIL_TYPES.TEST_EMAIL,
      status: EMAIL_STATUS.QUEUED,
    });

    sendMailMock.mockResolvedValue({
      messageId: "smtp-message-123",
    });

    const result = await sendQueuedEmailService({
      jobId: "job-1",
      emailLogId: emailLog._id,
      userId,
      to: "test@example.com",
      subject: "Test email",
      html: "<p>Hello</p>",
      text: "Hello",
      type: EMAIL_TYPES.TEST_EMAIL,
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.MAIL_FROM,
      to: "test@example.com",
      subject: "Test email",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(result.status).toBe(EMAIL_STATUS.SENT);
    expect(result.providerMessageId).toBe("smtp-message-123");

    const updatedEmailLog = await EmailLog.findById(emailLog._id).lean();

    expect(updatedEmailLog.status).toBe(EMAIL_STATUS.SENT);
    expect(updatedEmailLog.providerMessageId).toBe("smtp-message-123");
    expect(updatedEmailLog.sentAt).toBeTruthy();
  });

  test("should not send email again if email log is already SENT", async () => {
    const userId = new mongoose.Types.ObjectId();

    const emailLog = await EmailLog.create({
      userId,
      to: "test@example.com",
      subject: "Already sent",
      type: EMAIL_TYPES.TEST_EMAIL,
      status: EMAIL_STATUS.SENT,
      providerMessageId: "existing-message-id",
      sentAt: new Date(),
    });

    const result = await sendQueuedEmailService({
      jobId: "job-2",
      emailLogId: emailLog._id,
      userId,
      to: "test@example.com",
      subject: "Already sent",
      html: "<p>Hello</p>",
      text: "Hello",
      type: EMAIL_TYPES.TEST_EMAIL,
    });

    expect(sendMailMock).not.toHaveBeenCalled();
    expect(result.alreadySent).toBe(true);
    expect(result.status).toBe(EMAIL_STATUS.SENT);
    expect(result.providerMessageId).toBe("existing-message-id");
  });

  test("should mark email log as FAILED when SMTP send fails", async () => {
    const userId = new mongoose.Types.ObjectId();

    const emailLog = await EmailLog.create({
      userId,
      to: "test@example.com",
      subject: "Failing email",
      type: EMAIL_TYPES.TEST_EMAIL,
      status: EMAIL_STATUS.QUEUED,
    });

    sendMailMock.mockRejectedValue(new Error("SMTP unavailable"));

    await expect(
      sendQueuedEmailService({
        jobId: "job-3",
        emailLogId: emailLog._id,
        userId,
        to: "test@example.com",
        subject: "Failing email",
        html: "<p>Hello</p>",
        text: "Hello",
        type: EMAIL_TYPES.TEST_EMAIL,
      }),
    ).rejects.toThrow("SMTP unavailable");

    const updatedEmailLog = await EmailLog.findById(emailLog._id).lean();

    expect(updatedEmailLog.status).toBe(EMAIL_STATUS.FAILED);
    expect(updatedEmailLog.errorMessage).toBe("SMTP unavailable");
  });
});