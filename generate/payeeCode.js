const output = require("../stubs/output");

module.exports = {
    code,
    parse,
    show,
    strings
};

////////////////////////////////

'use strict';

function warnIfTheresNo(phone) {
    if (!phone)
        output.markdown(strings().warnNoPhone);
}

function show(snippet) {
    output.markdown(strings().instructions);
    output.markdown("```" + snippet);
}

function parse(record) {
    warnIfTheresNo(record.getCellValue("Phone"))

    return {
        payee: stripQuotes(record.getCellValue("Payee")),
        accountNumber: first(record.getCellValue("Account Number")),
        address: parseAddress(first(record.getCellValue("Address"))),
        phone: parsePhone(first(record.getCellValue("Phone"))),
    }
}

function first(list) {
    return (list || [null])[0]
}

function stripQuotes(fromString) {
    return fromString.replace(/"/g, "")
}

function parseAddress(address) {
    const lines = address.split("\n")
    const cityStateZip = lines[lines.length - 1];
    const hasLine2 = lines.length > 2;

    return {
        line1: first(lines),
        line2: hasLine2 ? lines[1] : null,
        city: first(cityStateZip.split(',')),
        state: first(capture(cityStateZip, rex().state)),
        zip5: first(capture(cityStateZip, rex().zip5)),
        zip4: first(capture(cityStateZip, rex().zip4)),
    }
}

function parsePhone(phoneNumber) {
    const parts = capture(phoneNumber, rex().phone, 3)

    return {
        area: parts[0],
        exchange: parts[1],
        last: parts[2],
    }
}

function capture(fromString, expression, count = 1) {
    const match = (fromString || "").match(expression)
    return match ? match.slice(1, count + 1) : Array(count).fill(null);
}

function mapToForm(data) {
    return {
        CompanyName: data.payee,
        AccountNumber: data.accountNumber,
        AddressLine1: data.address.line1,
        AddressLine2: data.address.line2,
        City: data.address.city,
        inputState: data.address.state,
        Zip5: data.address.zip5,
        Zip4: data.address.zip4,
        inputPhone1: data.phone.area,
        inputPhone2: data.phone.exchange,
        inputPhone3: data.phone.last,
    };
}

function rex() {
    return {
        phone: /\((\d{3})\) (\d{3})-(\d{4})/,
        state: / ([A-Z]{2}) /,
        zip5: /(\d{5})/,
        zip4: /-(\d{4})/,
    }
}

function strings() {
    return {
        warnNoPhone: "#### ⚠️ This payee does not have a phone number.\n" +
            "Ally's bill pay system requires one, and it's much easier to enter here first.",
        instructions: "### To add this as a new payee\n" +
            "1. Sign in to [Ally Bank](https://secure.ally.com) in a new tab.\n" +
            "1. Open [this link to Ally Bill Pay](https://secure.ally.com/capi-gw/sso/billpay) in another new tab.\n" +
            "1. Press Cmd+Option+C to open the developer console.\n" +
            "1. Copy and paste the code below into the console.\n" +
            "1. Hit enter to run it. If everything looks good, submit the form.",
    }
}

function code(data) {
    return `\n((document) => {
  const payee = ${JSON.stringify(mapToForm(data), null, '\t')}

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
})(document);`
}
