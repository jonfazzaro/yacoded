const generator = require("./generate");

describe("The payment generator", () => {
  describe("given a date before November", () => {
    it("adds months", () => {
      const today = new Date(2015, _months.indexOf("October"), 23);
      const hence = generator.addMonths(today, 2);
      expect(_months[hence.getMonth()]).toEqual("December");
      expect(hence.getYear() + 1900).toEqual(2015);
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
