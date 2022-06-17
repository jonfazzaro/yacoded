jest.mock("../stubs/base");
jest.mock("../stubs/output");

const base = require("../stubs/base");
const output = require("../stubs/output");
const subject = require("./payments");

describe("The payment generator", () => {
  beforeEach(() => {
    _mocked.getTable.mockClear();
    base.getTable = _mocked.getTable;
    output.markdown = jest.fn()
  });
  describe("when adding months", () => {
    describe("given a date in the middle of the year", () => {
      it("adds months in the same year", () => {
        expectDateWhenAddingMonthsTo("5/23/2015", 3, "8/23/2015");
      });
    });

    describe("given a date near the end of the year", () => {
      it("rolls over to January of the next year", () => {
        expectDateWhenAddingMonthsTo("11/12/2021", 2, "1/12/2022");
      });
    });

    describe("given the target date is at the end of February", () => {
      it("still lands in February", () => {
        expectDateWhenAddingMonthsTo("1/31/2021", 1, "2/28/2021");
      });
    });

    function expectDateWhenAddingMonthsTo(date, months, expected) {
      expect(subject.addMonths(new Date(date), months)).toEqual(
        new Date(expected)
      );
    }
  });

  describe("when querying the last payment date", () => {
    let result;
    beforeEach(async () => {
      _mocked.paymentRecord.getCellValue.mockReturnValue("11/14/2001");
      _mocked.records = [_mocked.paymentRecord];
      result = await subject.latestPaymentDate();
    });

    it("queries the Payments table", () => {
      expect(_mocked.getTable).toHaveBeenCalledWith("Payments");
    });

    it("requests the Date field", () => {
      expect(_mocked.selectRecordsAsync).toHaveBeenCalledWith(
        expect.objectContaining({ fields: ["Date"] })
      );
    });

    it("sorts descending by Date", () => {
      expect(_mocked.selectRecordsAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sorts: [
            {
              field: "Date",
              direction: "desc",
            },
          ],
        })
      );
    });

    it("returns the date of the first record", () => {
      expect(_mocked.paymentRecord.getCellValue).toHaveBeenCalledWith("Date");
      expect(result.toLocaleDateString()).toEqual("11/14/2001");
    });
  });

  describe("when generating payments", () => {
    beforeEach(async () => {
      _mocked.records = [hospitalPayment, doctorPayment, dentistPayment];
      await subject.generatePayments(_mocked.today);
    });

    it("queries the Paying Accounts", () => {
      expect(_mocked.getTable).toHaveBeenCalledWith("Accounts");
      expect(_mocked.getView).toHaveBeenCalledWith("Paying");
    });

    it("requests the Payment field", () => {
      expect(_mocked.selectRecordsAsync).toHaveBeenCalledWith(
          expect.objectContaining({ fields: expect.arrayContaining([" Payment "]) })
      );
    });

    xit("requests the Payments Remaining field", () => {
      expect(_mocked.selectRecordsAsync).toHaveBeenCalledWith(
        expect.objectContaining({ fields: ["Payments Remaining"] })
      );
    });

    it("reads the Payment field on each account", () => {
      _mocked.records.forEach(r => {
        expect(r.getCellValue).toHaveBeenCalledWith(" Payment ");
      });
    });

    it("creates Payments", () => {
      expect(_mocked.getTable).toHaveBeenCalledWith("Payments");
      expect(_mocked.createRecordsAsync).toHaveBeenCalledWith(
        expect.arrayContaining(_expected.payments)
      );
    });

    it("does not create zero dollar payments", () => {
      expect(_mocked.createRecordsAsync).not.toHaveBeenCalledWith(
        expect.arrayContaining([ _expected.zeroDollarPayment ])
      );
    });

    it('outputs the results', () => {
        expect(output.markdown).toHaveBeenCalledWith("Created 3 of 2 payments.")
    });
  });
});

const _mocked = {
  records: [],
  paymentRecord: { getCellValue: jest.fn() },
  today: new Date("3/4/2005"),
};

const hospitalPayment = { id: 3, getCellValue: jest.fn(() => 25.19) };
const doctorPayment = { id: 4, getCellValue: jest.fn(() => 20.0) };
const dentistPayment = { id: 7, getCellValue: jest.fn(() => 0.0) };

const _expected = { 
    payments: [
        {
          fields: {
            Date: _mocked.today,
            Amount: 25.19,
            Account: [{ id: 3 }],
          },
        },
        {
          fields: {
            Date: _mocked.today,
            Amount: 20.0,
            Account: [{ id: 4 }],
          },
        },
      ],
      zeroDollarPayment: {
        fields: {
          Date: _mocked.today,
          Amount: 0,
          Account: [{ id: 7 }],
        },
      }
}

_mocked.selectRecordsAsync = jest.fn(() =>
  Promise.resolve({ records: _mocked.records })
);

_mocked.createRecordsAsync = jest.fn(() => Promise.resolve([1, 2, 3]));

_mocked.getView = jest.fn();

_mocked.getTable = jest.fn(() => ({
  selectRecordsAsync: _mocked.selectRecordsAsync,
  createRecordsAsync: _mocked.createRecordsAsync,
  getView: _mocked.getView,
}));

_mocked.getView.mockImplementation(_mocked.getTable);
