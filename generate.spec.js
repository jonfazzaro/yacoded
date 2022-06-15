const base = require("./base");
const generator = require("./generate");

describe("The payment generator", () => {
  beforeEach(() => {
    base.getTable = _mocked.getTable;
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
      expect(generator.addMonths(new Date(date), months)).toEqual(
        new Date(expected)
      );
    }
  });

  describe("when querying the last payment date", () => {
    let result;
    beforeEach(async () => {
      _mocked.paymentRecord.getCellValue.mockReturnValue("11/14/2001");
      _mocked.records = [_mocked.paymentRecord];
      result = await generator.latestPaymentDate();
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
      await generator.generatePayments(new Date());
    });
    it("queries the Paying Accounts", () => {
      expect(_mocked.getTable).toHaveBeenCalledWith("Accounts");
      expect(_mocked.getView).toHaveBeenCalledWith("Paying");
    });

    it("requests the Payment field", () => {
      expect(_mocked.selectRecordsAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: [" Payment "],
        })
      );
    });
  });
});

jest.mock("./base");

const _mocked = {
  records: [],
  paymentRecord: { getCellValue: jest.fn() },
};

_mocked.selectRecordsAsync = jest.fn(() =>
  Promise.resolve({ records: _mocked.records })
);

_mocked.getView = jest.fn();

_mocked.getTable = jest.fn(() => ({
  selectRecordsAsync: _mocked.selectRecordsAsync,
  getView: _mocked.getView,
}));

_mocked.getView.mockImplementation(_mocked.getTable);
