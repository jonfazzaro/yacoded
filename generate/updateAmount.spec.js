const subject = require("./updateAmount")
const output = require("../stubs/output");
const input = require("../stubs/input");
jest.mock("../stubs/output");
jest.mock("../stubs/input");

describe('When updating a balance', () => {
    beforeEach(() => {
        output.markdown = jest.fn();
        input.textAsync = jest.fn(async () => { })
        subject.update(_mocked.record, _mocked.table);
    });

    describe('given no record', () => {
        it('does nothing', () => {
            subject.update()
        });
    });

    describe('given a record and a table', () => {
        it('should print the remaining amount', () => {
            expect(output.markdown).toHaveBeenCalledWith("$15.37 remaining.")
        });

        it('prompts for the new amount', () => {
            expect(input.textAsync).toHaveBeenCalledWith("What's the new amount?")
        });

        describe('given no amount', () => {
            it('does not update the record', () => {
                expect(_mocked.table.updateRecordAsync).not.toHaveBeenCalled()
            });
        });

        describe('given an amount', () => {
            describe('that is the same as the remaining', () => {
                it('does not update the record', () => {
                    expect(_mocked.table.updateRecordAsync).not.toHaveBeenCalled()
                });
            });
            
        });
    });

    const _mocked = {
        table: { updateRecordAsync: jest.fn() },
        record: {
            getCellValue: fieldName => {
                return {
                    "Remaining": 15.37,
                    "Total": 35.67
                }[fieldName]
            }
        }
    }
});