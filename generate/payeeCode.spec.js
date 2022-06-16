const subject = require("./payeeCode");
const alert = require("../alert");
const setTimeout = require("../setTimeout");
jest.mock("../alert", () => jest.fn());
jest.mock("../setTimeout", () => jest.fn(fn => fn()));

describe("The generated payee code", () => {
  let js, document;
  beforeEach(async () => {
    arrangeDocument();
    document = _mocked.document;
    js = await eval(subject.code(_mocked.payment));
  });

  it("can be evaluated", () => {
    expect(typeof js.openAndFillForm).toEqual("function");
  });

  describe("given the Add a Payee dialog is not open yet", () => {
    beforeEach(async () => {
      _mocked.document.querySelector.mockReturnValue(null);
      js = await eval(subject.code(_mocked.payment));
    });

    it("displays a friendly reminder to open it", () => {
      expect(alert).toHaveBeenCalledWith(
        'Please click on "Add a Payee" first.'
      );
    });
  });

  it("navigates to the new payee form", () => {
    expect(_mocked.document.querySelector).toHaveBeenCalledWith(
      "a#ob-category-13"
    );
    expect(_mocked.document.querySelector).toHaveBeenCalledWith(
      "a.ob-logo-box.i-company"
    );
    expect(_mocked.element.click).toHaveBeenCalledTimes(2);
  });

  it("fills in the form fields", () => {
    const data = _mocked.payment;
    expectFormValue("CompanyName", data.payee);
    expectFormValue("AccountNumber", data.accountNumber);
    expectFormValue("AddressLine1", data.address.line1);
    expectFormValue("AddressLine2", data.address.line2);
    expectFormValue("City", data.address.city);
    expectFormValue("inputState", data.address.state);
    expectFormValue("Zip5", data.address.zip5);
    expectFormValue("Zip4", data.address.zip4);
    expectFormValue("inputPhone1", data.address.phone.area);
    expectFormValue("inputPhone2", data.address.phone.exchange);
    expectFormValue("inputPhone3", data.address.phone.last);
  });
});

describe("The payment record parser", () => {
  it("maps a simple address", () => {
    const data = subject.parse(
      new record("Maynard", "666", "777 Vine Yard\nArizona Bay, AZ 78901")
    );
    expect(data).toEqual({
      payee: "Maynard",
      accountNumber: "666",
      address: {
        line1: "777 Vine Yard",
        line2: null,
        city: "Arizona Bay",
        state: "AZ",
        zip5: "78901",
        zip4: null,
        phone: {
          area: null,
          exchange: null,
          last: null,
        },
      },
    });
  });

  it("maps a less straightforward address", () => {
    const data = subject.parse(
      new record("Justin", "4", "789 Peach Lane\nBuckets of Blood\nHaverford-on-Trentshire, UK 00000-1234")
    );
    expect(data).toEqual({
      payee: "Justin",
      accountNumber: "4",
      address: {
        line1: "789 Peach Lane",
        line2: "Buckets of Blood",
        city: "Haverford-on-Trentshire",
        state: "UK",
        zip5: "00000",
        zip4: "1234",
        phone: {
          area: null,
          exchange: null,
          last: null,
        },
      },
    });
  });

  it("maps an address with a phone number", () => {
    const data = subject.parse(
      new record("Danny", "88", "789 Five Street\nAttn: Cobham Stans\nKansas City, MO 75989-1239")
    );
    expect(data).toEqual({
      payee: "Danny",
      accountNumber: "88",
      address: {
        line1: "789 Five Street",
        line2: "Attn: Cobham Stans",
        city: "Kansas City",
        state: "MO",
        zip5: "75989",
        zip4: "1239",
        phone: {
          area: null,
          exchange: null,
          last: null,
        },
      },
    });
  });

  function record(payee, account, address) {
    const data = {
      Payee: payee,
      "Account Number": account,
      Address: [address],
    };
    data.getCellValue = key => data[key];
    return data;
  }
});

function arrangeDocument() {
  _mocked.document.querySelector.mockReturnValue(_mocked.element);
  _mocked.document.getElementById.mockImplementation(id => _mocked.form[id]);
  _mocked.element.click.mockClear();
}

function expectFormValue(field, value) {
  expect(_mocked.form[field].value).toEqual(value);
}

const _mocked = {
  payment: {
    payee: "KeyBridge",
    accountNumber: "K2699999",
    address: {
      line1: "PO Box 1568",
      line2: "Lima, OH 45802-1568",
      city: "Lima",
      state: "OH",
      zip5: "45802",
      zip4: "1568",
      phone: {
        area: "877",
        exchange: "879",
        last: "9822",
      },
    },
  },
  element: { click: jest.fn() },
  document: {
    querySelector: jest.fn(),
    getElementById: jest.fn(),
  },
};

_mocked.form = {
  CompanyName: field(),
  AccountNumber: field(),
  AddressLine1: field(),
  AddressLine2: field(),
  City: field(),
  inputState: field(),
  Zip5: field(),
  Zip4: field(),
  inputPhone1: field(),
  inputPhone2: field(),
  inputPhone3: field(),
};

function field() {
  return {
    value: null,
  };
}
