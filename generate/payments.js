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
  const proposed = payments(results.records, date, budget);
  const created = await create(proposed);
  output.markdown(`Created ${created.length} of ${proposed.length} payments.`);
}

function payments(accounts, date, budget) {
  const results = accounts.sort(by(balance)).map(toPaymentsOn(date));

  if (budget) {
    let remaining = budget;
    for (const payment of results) {
      if (remaining >= payment.fields.Amount) {
        remaining -= payment.fields.Amount;
      } else {
        payment.fields.Amount = parseFloat(remaining.toFixed(2));
      }
    }
  }

  return results.filter(p => 0 < p.fields.Amount);
}

function balance(account) {
  return account["Payments Remaining"] * paymentAmount(account);
}

async function create(payments) {
  return await base.getTable("Payments").createRecordsAsync(payments);
}

function outZeroDollarPayments(account) {
  return 0 < paymentAmount(account);
}

function toPaymentsOn(date) {
  return account => ({
    fields: {
      Date: date,
      Amount: paymentAmount(account),
      Account: [{ id: account.id }],
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
