const generator = require("./generate");

describe("The payment generator", () => {

  describe("given a date before November", () => {
    it("adds months in the same year", () => {
      expect(generator.addMonths(new Date("10/23/2015"), 2))
        .toEqual(new Date("12/23/2015"))
    });
  });

  describe("given a date in November", () => {
    it("rolls over to January of the next year", () => {
        expect(generator.addMonths(new Date("11/12/2021"), 2))
        .toEqual(new Date("1/12/2022"))
    });
  });

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
