import { jest } from "@jest/globals";

const recurringAddMock = jest.fn();
const insightAddMock = jest.fn();
const receiptAddMock = jest.fn();
const emailAddMock = jest.fn();
const recurringSchedulerMock = jest.fn();

jest.unstable_mockModule("../../src/modules/jobs/job.queue.js", () => ({
  recurringQueue: {
    add: recurringAddMock,
    upsertJobScheduler: recurringSchedulerMock,
  },
  insightQueue: {
    add: insightAddMock,
  },
  receiptQueue: {
    add: receiptAddMock,
  },
  emailQueue: {
    add: emailAddMock,
  },
}));

const {
  enqueueRecurringProcessingJob,
  enqueueInsightGenerationJob,
  enqueueReceiptParsingJob,
  enqueueEmailJob,
  upsertUserRecurringScheduler,
} = await import("../../src/modules/jobs/job.producer.js");

describe("Job Producer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should enqueue recurring processing job with stable job id", async () => {
    recurringAddMock.mockResolvedValue({
      id: "recurring-job-1",
      queueName: "recurring-jobs",
    });

    await enqueueRecurringProcessingJob({
      userId: "user1",
      asOf: "2026-07-28T00:00:00.000Z",
      limit: 20,
    });

    expect(recurringAddMock).toHaveBeenCalledWith(
      "process-due-recurring",
      {
        userId: "user1",
        asOf: "2026-07-28T00:00:00.000Z",
        limit: 20,
      },
      {
        jobId: "recurring:user1:2026-07-28T00:00:00.000Z",
      },
    );
  });

  test("should enqueue insight generation job with month-year job id", async () => {
    insightAddMock.mockResolvedValue({
      id: "insight-job-1",
      queueName: "insight-jobs",
    });

    await enqueueInsightGenerationJob({
      userId: "user1",
      month: 7,
      year: 2026,
    });

    expect(insightAddMock).toHaveBeenCalledWith(
      "generate-insights",
      {
        userId: "user1",
        month: 7,
        year: 2026,
      },
      {
        jobId: "insights:user1:2026:7",
      },
    );
  });

  test("should enqueue receipt parsing job with receipt job id", async () => {
    receiptAddMock.mockResolvedValue({
      id: "receipt-job-1",
      queueName: "receipt-jobs",
    });

    await enqueueReceiptParsingJob({
      userId: "user1",
      receiptId: "receipt1",
    });

    expect(receiptAddMock).toHaveBeenCalledWith(
      "parse-receipt",
      {
        userId: "user1",
        receiptId: "receipt1",
        source: "INITIAL",
      },
      {
        jobId: "receipt-parse:receipt1",
      },
    );
  });

  test("should enqueue email job with uniqueEmailKey as job id", async () => {
    emailAddMock.mockResolvedValue({
      id: "email-job-1",
      queueName: "email-jobs",
    });

    await enqueueEmailJob({
      userId: "user1",
      emailLogId: "emailLog1",
      to: "test@example.com",
      subject: "Hello",
      html: "<p>Hello</p>",
      text: "Hello",
      type: "TEST_EMAIL",
      uniqueEmailKey: "test-email-user1",
    });

    expect(emailAddMock).toHaveBeenCalledWith(
      "send-email",
      {
        userId: "user1",
        emailLogId: "emailLog1",
        to: "test@example.com",
        subject: "Hello",
        html: "<p>Hello</p>",
        text: "Hello",
        type: "TEST_EMAIL",
      },
      {
        jobId: "email:test-email-user1",
      },
    );
  });

  test("should upsert user recurring scheduler", async () => {
    recurringSchedulerMock.mockResolvedValue({
      id: "scheduler-1",
    });

    await upsertUserRecurringScheduler({
      userId: "user1",
      limit: 20,
    });

    expect(recurringSchedulerMock).toHaveBeenCalledWith(
      "user-recurring:user1",
      {
        pattern: "0 2 * * *",
      },
      expect.objectContaining({
        name: "process-due-recurring",
        data: expect.objectContaining({
          userId: "user1",
          asOf: null,
          limit: 20,
          source: "SCHEDULER",
        }),
      }),
    );
  });
});