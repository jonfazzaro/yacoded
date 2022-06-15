const base = require("./base");
const output = require("./output");

module.exports = {
  latestPaymentDate,
  generatePayments,
  addMonths,
};

function addMonths(date, months) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) 
    date.setDate(0);
  
  return date;
}

async function latestPaymentDate() {
  let query = await base
    .getTable("Payments")
    .selectRecordsAsync(byDateDescending);
  return date(query.records[0]);
}

async function generatePayments(date) {
  let results = await queryPayingAccounts();
  let payments = results.records
    .filter(outZeroDollarPayments)
    .map(account => ({
      fields: {
        Date: date,
        Amount: paymentAmount(account),
        Account: [{ id: account.id }],
      },
    }));
  let created = await base.getTable("Payments").createRecordsAsync(payments);
    output.markdown(`Created ${created.length} of ${payments.length} payments.`);
}

function outZeroDollarPayments(account) {
    return 0 < paymentAmount(account)
}

async function queryPayingAccounts() {
  return await base
    .getTable("Accounts")
    .getView("Paying")
    .selectRecordsAsync({ fields: [" Payment "] });
}

function date(payment) {
  return new Date(payment.getCellValue("Date"));
}

function paymentAmount(account) {
  return account.getCellValue(" Payment ");
}

const byDateDescending = {
  fields: ["Date"],
  sorts: [{ field: "Date", direction: "desc" }],
};
