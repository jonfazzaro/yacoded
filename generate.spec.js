const generator = require("./generate");

describe("The payment generator", () => {
  describe("given a date before November", () => {
    it("adds months in the same year", () => {
        expectDateWhenAddingMonthsTo("10/23/2015", 2, "12/23/2015")
    });
  });

  describe("given a date in November", () => {
    it("rolls over to January of the next year", () => {
        expectDateWhenAddingMonthsTo("11/12/2021", 2, "1/12/2022")
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
