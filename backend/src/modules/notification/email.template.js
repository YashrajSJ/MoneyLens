const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatAmount = (amount = 0) => {
  const value = Number(amount);

  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
};

const getMonthName = (month) => {
  return new Date(Date.UTC(1000, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
  });
};

const generateTestEmailTemplate = ({ name }) => {
  const safeName = escapeHtml(name || "there");

  return {
    subject: "MoneyLens email test",
    html: `
      <h2>Email setup is working</h2>
      <p>Hi ${safeName},</p>
      <p>This is a test email from your MoneyLens backend.</p>
      <p>If you received this, your notification email worker is working correctly.</p>
    `,
    text: `Hi ${name || "there"}, this is a test email from your MoneyLens backend.`,
  };
};

const generatePasswordResetTemplate = ({
  name,
  resetUrl,
  token,
  expiresInMinutes = 15,
}) => {
  const safeName = escapeHtml(name || "there");
  const safeResetUrl = escapeHtml(resetUrl);
  const safeToken = escapeHtml(token);

  return {
    subject: "Reset your MoneyLens password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your MoneyLens password.</p>
      <p>This reset link will expire in ${expiresInMinutes} minutes.</p>
      <p><a href="${safeResetUrl}">Reset your password</a></p>
      <p>If the link does not work, use this token:</p>
      <p><strong>${safeToken}</strong></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
    text: `Hi ${
      name || "there"
    }, reset your MoneyLens password using this link: ${resetUrl}. Token: ${token}. This expires in ${expiresInMinutes} minutes.`,
  };
};

const generateEmailVerificationTemplate = ({
  name,
  verificationUrl,
  token,
  expiresInMinutes = 20,
}) => {
  const safeName = escapeHtml(name || "there");
  const safeVerificationUrl = escapeHtml(verificationUrl);
  const safeToken = escapeHtml(token);

  return {
    subject: "Verify your MoneyLens email",
    html: `
      <h2>Verify Your Email</h2>
      <p>Hi ${safeName},</p>
      <p>Welcome to MoneyLens. Please verify your email address to secure your account.</p>
      <p>This verification link will expire in ${expiresInMinutes} minutes.</p>
      <p><a href="${safeVerificationUrl}">Verify email</a></p>
      <p>If the link does not work, use this token:</p>
      <p><strong>${safeToken}</strong></p>
    `,
    text: `Hi ${
      name || "there"
    }, verify your MoneyLens email using this link: ${verificationUrl}. Token: ${token}. This expires in ${expiresInMinutes} minutes.`,
  };
};

const generateMonthlyReportTemplate = ({ name, month, year, dashboard }) => {
  const safeName = escapeHtml(name || "there");
  const monthName = getMonthName(month);

  const summary = dashboard?.summary || {};

  const totalIncome = summary.totalIncome ?? summary.income ?? 0;
  const totalExpenses = summary.totalExpenses ?? summary.expenses ?? 0;
  const netSavings = summary.netSavings ?? totalIncome - totalExpenses;
  const transactionCount = summary.transactionCount ?? 0;

  const categories =
    dashboard?.categories || dashboard?.categoryBreakdown || [];

  const categoryRows = categories
    .slice(0, 5)
    .map(
      (category) =>
        `<li>${escapeHtml(category.category)}: ${formatAmount(
          category.totalSpent,
        )}</li>`,
    )
    .join("");

  return {
    subject: `Your ${monthName} ${year} financial report`,
    html: `
      <h2>${monthName} ${year} Financial Report</h2>
      <p>Hi ${safeName},</p>
      <p>Here is your monthly MoneyLens summary.</p>

      <h3>Summary</h3>
      <ul>
       <li>Total income: ${formatAmount(totalIncome)}</li>
       <li>Total expenses: ${formatAmount(totalExpenses)}</li>
       <li>Net savings: ${formatAmount(netSavings)}</li>
       <li>Transactions: ${transactionCount}</li>
      </ul>

      <h3>Top spending categories</h3>
      <ul>
        ${categoryRows || "<li>No expense categories found.</li>"}
      </ul>
    `,
    text: `${monthName} ${year} report: income ${formatAmount(
      totalIncome,
    )}, expenses ${formatAmount(totalExpenses)}, net savings ${formatAmount(
      netSavings,
    )}.`,
  };
};

const generateBudgetAlertTemplate = ({
  name,
  accountName,
  spentAmount,
  budgetAmount,
  percentageUsed,
  threshold,
}) => {
  const safeName = escapeHtml(name || "there");
  const safeAccountName = escapeHtml(accountName || "your account");

  return {
    subject: "Budget alert from MoneyLens",
    html: `
      <h2>Budget Alert</h2>
      <p>Hi ${safeName},</p>
      <p>Your budget for ${safeAccountName} has crossed ${threshold}%.</p>
      <ul>
        <li>Spent: ${formatAmount(spentAmount)}</li>
        <li>Budget: ${formatAmount(budgetAmount)}</li>
        <li>Usage: ${formatAmount(percentageUsed)}%</li>
      </ul>
    `,
    text: `Budget alert: ${safeAccountName} crossed ${threshold}%. Spent ${formatAmount(
      spentAmount,
    )} out of ${formatAmount(budgetAmount)}.`,
  };
};

export {
  generateTestEmailTemplate,
  generatePasswordResetTemplate,
  generateEmailVerificationTemplate,
  generateMonthlyReportTemplate,
  generateBudgetAlertTemplate,
};
