const generator = require("./generate");

describe("The payment generator", () => {

  describe("given a date before November", () => {
    it("adds months in the same year", () => {
      const today = new Date("10/23/2015");
      const hence = generator.addMonths(today, 2);
      expect(_months[hence.getMonth()]).toEqual("December");
      expect(hence.getYear() + 1900).toEqual(2015);
      expect(hence).toEqual(new Date("12/23/2015"))
    });
  });

  describe("given a date in November", () => {
    it("rolls over to January of the next year", () => {
      const today = new Date("11/12/2021");
      const hence = generator.addMonths(today, 2);
      expect(_months[hence.getMonth()]).toEqual("January");
      expect(hence.getYear() + 1900).toEqual(2022);
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
