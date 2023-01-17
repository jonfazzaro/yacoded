const base = require("../stubs/base");
const output = require("../stubs/output");

module.exports = {
  latestPaymentDate,
  generatePayments,
  addMonths,
};

///

"use strict";

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
  const payments = copy(accounts)
    .filter(hasBalance)
    .sort(byCollectionThenBalance)
    .map(toPaymentsOn(date))
    .filter(nonZero);

  if (budget) distribute(remainingAfterMinimum(payments, budget), payments);

  updateNumberOfRemaining(payments);

  return payments.filter(nonZero);
}

function updateNumberOfRemaining(payments) {
  for (const payment of payments) {
    payment.fields["Payments Remaining"] = Math.ceil(
      balanceAfter(payment) / paymentAmount(account(payment)).toFixed(0)
    );
  }
}

function hasBalance(account) {
  return account.getCellValue("Remaining");
}

function nonZero(payment) {
  return payment.fields.Amount;
}

function distribute(snowball, payments) {
  let remaining = snowball;
  for (const payment of payments) {
    const extra = amount(Math.min(remaining, balanceAfter(payment)));
    payment.fields.Amount += extra;
    remaining -= extra;
  }
}

function balanceAfter(payment) {
  return balance(account(payment)) - payment.fields.Amount;
}

function remainingAfterMinimum(payments, budget) {
  let remaining = budget;
  for (const payment of payments) {
    if (remaining <= payment.fields.Amount)
      payment.fields.Amount = amount(remaining);

    remaining -= payment.fields.Amount;
  }
  return remaining;
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
    .selectRecordsAsync({
      fields: [
        " Payment ",
        "Payments Remaining",
        "Remaining",
        "IsInCollection",
      ],
    });
}

function date(payment) {
  return new Date(payment.getCellValue("Date"));
}

function paymentAmount(account) {
  return account.getCellValue(" Payment ");
}

function isCollection(account) {
  return account.getCellValue("IsInCollection");
}

function byCollectionThenBalance(a, b) {
  return isCollection(b) - isCollection(a) || balance(a) - balance(b);
}

function copy(array) {
  return array.slice();
}