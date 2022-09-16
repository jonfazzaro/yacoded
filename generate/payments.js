const base = require("../stubs/base");
const output = require("../stubs/output");

module.exports = {
  latestPaymentDate,
  generatePayments,
  addMonths,
};

///

("use strict");

function addMonths(date, months) {
  const d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) date.setDate(0);
  return date;
}

async function latestPaymentDate() {
  const query = await base
    .getTable("Payments")
    .selectRecordsAsync(byDateDescending());
  return date(query.records[0]);
}

function byDateDescending() {
  return {
    fields: ["Date"],
    sorts: [{ field: "Date", direction: "desc" }],
  };
}

async function generatePayments(date, budget) {
  const results = await queryPayingAccounts();
  const proposed = createPayments(results.records, date, budget);
  const created = await create(proposed);
  output.markdown(`Created ${created.length} of ${proposed.length} payments.`);
}

function createPayments(accounts, date, budget) {
  const payments = accounts
    .sort(by(balance))
    .map(toPaymentsOn(date))
    .filter(p => p.fields.Amount);

  if (budget) {
    let remaining = budget;
    for (const payment of payments) {
      if (remaining <= payment.fields.Amount)
        payment.fields.Amount = amount(remaining);

      remaining -= payment.fields.Amount;
    }

    for (const payment of payments) {
      const extra = amount(
        Math.min(remaining, balance(account(payment)) - payment.fields.Amount)
      );
      payment.fields.Amount += extra;
      remaining -= extra;
    }
  }

  return payments.filter(p => 0 < p.fields.Amount);
}

function account(payment) {
  return payment.fields.Account[0];
}

function amount(value) {
  return parseFloat(value.toFixed(2));
}

function balance(account) {
  return account.getCellValue("Remaining");
}

async function create(payments) {
  return await base.getTable("Payments").createRecordsAsync(payments);
}

function toPaymentsOn(date) {
  return account => ({
    fields: {
      Date: date,
      Amount: paymentAmount(account),
      Account: [account],
      "Payments Remaining": account.getCellValue("Payments Remaining"),
    },
  });
}

async function queryPayingAccounts() {
  return await base
    .getTable("Accounts")
    .getView("Paying")
    .selectRecordsAsync({ fields: [" Payment ", "Payments Remaining"] });
}

function date(payment) {
  return new Date(payment.getCellValue("Date"));
}

function paymentAmount(account) {
  return account.getCellValue(" Payment ");
}

function by(fn) {
  return (a, b) => fn(a) - fn(b);
}
