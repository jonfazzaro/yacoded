const output = require("../output");
// const alert = require("../alert");
// const setTimeout = require("../setTimeout");

module.exports = {
  code,
  parse,
};

////////////////////////////////

function show(snippet) {
    output.markdown("### To add this as a new payee");
    output.markdown(
        "1. Sign in to [Ally Bank](https://secure.ally.com).\n" +
        "1. Open [this link to Ally Bill Pay](https://secure.ally.com/capi-gw/sso/billpay) in a new tab (Cmd+Click).\n" +
        "1. Press Cmd+Option+C to open the developer console.\n" +
        "1. Copy and paste this code into the console:");

    output.markdown("```" + snippet);
}

function parse(record) {
    return {
        payee: record.getCellValue("Payee"),
        accountNumber: record.getCellValue("Account Number"),
        address: parseAddress(record.getCellValue("Address")[0])
    }
}

function parseAddress(address) {
    const meta = metadata(address)

    return {
        line1: meta.line1,
        line2: meta.line2,
        city: meta.cityStateZip.split(',')[0],
        state: capture(meta.cityStateZip, / ([A-Z]{2}) /),
        zip5: capture(meta.cityStateZip, /([0-9]{5})/),
        zip4: capture(meta.cityStateZip, /-([0-9]{4})/),
        phone: parsePhone(meta.phoneNumber)
    }
}

function parsePhone(phoneNumber) {
    const phoneNumberParts = phoneNumber ? phoneNumber.split("-") : [null, null, null]

    return {
        area: phoneNumberParts[0],
        exchange: phoneNumberParts[1],
        last: phoneNumberParts[2],
    }
}

function metadata(address) {
    const lines = address.split("\n")
    const lastLine = lines[lines.length - 1]
    const phoneNumber = lastLine.match(/^[0-9]/) ? lastLine : null
    const cityStateZip = phoneNumber ? lines[lines.length - 2] : lastLine
    const hasLine2 = lines.length > (phoneNumber ? 3 : 2)

    return {
        line1: lines[0],
        line2: hasLine2 ? lines[1] : null,
        cityStateZip,
        phoneNumber
    }
}

function capture(fromString, expression) {
    const match = fromString.match(expression)
    if (match)
        return match[1];
    return null
}

function code(data) {
    return `\n((document) => {
  const payee = {
    CompanyName: "${data.payee.replace(/"/g, "")}",
    AccountNumber: "${data.accountNumber}",
    AddressLine1: "${data.address.line1}",
    AddressLine2: "${data.address.line2}",
    City: "${data.address.city}",
    inputState: "${data.address.state}",
    Zip5: "${data.address.zip5}",
    Zip4: "${data.address.zip4}",
    inputPhone1: "${data.address.phone.area}",
    inputPhone2: "${data.address.phone.exchange}",
    inputPhone3: "${data.address.phone.last}",
  };

  openAndFillForm(0.5);
  async function openAndFillForm(delay) {
    try {
      everythingElse();
      otherCompany();
      await seconds(delay);
      fillForm(payee);
    } catch (e) {
      alert(e.message);
    }
  }

  function fillForm(payee) {
    for (let field in payee) fill(field, payee);
  }

  function fill(field, payee) {
    document.getElementById(field).value = payee[field];
  }

  function everythingElse() {
    click("a#ob-category-13");
  }

  function otherCompany() {
    click("a.ob-logo-box.i-company");
  }

  function click(selector) {
    const element = document.querySelector(selector);
    if (element) element.click();
    else throw new Error('Please click on "Add a Payee" first.');
  }

  function seconds(count) {
    return new Promise(function (resolve) {
      setTimeout(resolve, count * 1000);
    });
  }

  return {
    payee,
    openAndFillForm
  }
})(document);`.replaceAll('"null"', 'null')
}

