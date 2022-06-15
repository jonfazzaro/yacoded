const base = require("./base");
const generator = require("./generate");

describe("The payment generator", () => {
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
      base.getTable = _mocked.getTable;
      result = await generator.latestPaymentDate();
    });

    it("queries the Payments table", () => {
      expect(base.getTable).toHaveBeenCalledWith("Payments");
    });

    it('returns the date of the first record', () => {
      expect(result.toLocaleDateString()).toEqual("11/14/2001");
    });
  });
});

jest.mock("./base");

const _mocked = {
  record: { getCellValue: jest.fn(() => "11/14/2001") },
};

_mocked.selectRecordsAsync = jest.fn(() =>
  Promise.resolve({ records: [_mocked.record] })
);

_mocked.getTable = jest.fn(() => ({
  selectRecordsAsync: _mocked.selectRecordsAsync,
}));
