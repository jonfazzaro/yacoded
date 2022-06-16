  const payee = {
    CompanyName: "KeyBridge",
    AccountNumber: "K268380",
    AddressLine1: "PO Box 1568",
    AddressLine2: "Lima, OH 45802-1568",
    City: "Lima",
    inputState: "OH",
    Zip5: "45802",
    Zip4: "1568",
    inputPhone1: "877",
    inputPhone2: "879",
    inputPhone3: "9822",
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

  function addAPayee() {
    fiserv.addbill.showLayer();
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
    else throw new Error(`Please click on "Add a Payee" first.`);
  }

  function seconds(count) {
    return new Promise(function (resolve) {
      setTimeout(resolve, count * 1000);
    });
  }
