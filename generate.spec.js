const generator = require("./generate");

describe("The payment generator", () => {
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
    it("still returns a valid date", () => {
      expectDateWhenAddingMonthsTo("1/31/2021", 1, "2/28/2021");
    });
  });

  function expectDateWhenAddingMonthsTo(date, months, expected) {
    expect(generator.addMonths(new Date(date), months)).toEqual(
      new Date(expected)
    );
  }
});

const _months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
