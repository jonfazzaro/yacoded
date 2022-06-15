const generator = require('./generate')

describe('The payment generator', () => {

    it('adds two months', () => {
        const today = new Date(2015, 4, 23)
        const twoMonthsHence = generator.addMonths(today, 2)
        expect(twoMonthsHence.getMonth()).toEqual(6)
    });
    
});