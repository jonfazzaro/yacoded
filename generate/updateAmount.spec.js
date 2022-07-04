const subject = require("./updateAmount")
const output = require("../stubs/output");
const input = require("../stubs/input");
jest.mock("../stubs/output");
jest.mock("../stubs/input");

describe('When updating a balance', () => {
    beforeEach(async () => {
        output.markdown = jest.fn();
        input.textAsync = jest.fn(async () => { })
        await update();

    });

    describe('given no record', () => {
        it('does nothing', async () => {
            await subject.update()
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

                it('does not update the record', async () => {
                    input.textAsync.mockReturnValue(Promise.resolve("15.37"))
                    await update()
                    expect(_mocked.table.updateRecordAsync).not.toHaveBeenCalled()
                });
            });

            describe('that is less than the remaining', () => {
                it('update the total by the difference', async () => {
                    input.textAsync.mockReturnValue(Promise.resolve("14.45"))
                    await update()
                    expect(_mocked.table.updateRecordAsync)
                        .toHaveBeenCalledWith(234, { "Total": 34.75 })
                });
            });
        });
    });

    async function update() {
        await subject.update(_mocked.record, _mocked.table);
    }

    const _mocked = {
        table: { updateRecordAsync: jest.fn() },
        record: {
            id: 234,
            getCellValue: fieldName => {
                return {
                    "Remaining": 15.37,
                    "Total": 35.67
                }[fieldName]
            }
        }
    }
});