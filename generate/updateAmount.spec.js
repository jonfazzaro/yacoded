const subject = require("./updateAmount")
const output = require("../stubs/output");
const input = require("../stubs/input");
jest.mock("../stubs/output");
jest.mock("../stubs/input");

describe('When updating a balance', () => {
    beforeEach(arrange);

    describe('given no record', () => {
        beforeEach(async () => {
            input.textAsync.mockClear()
            await subject.update()
        });

        it('does not prompt', () => {
            expect(input.textAsync).not.toHaveBeenCalled()
        });

        itDoesNotUpdate()
    });

    describe('given a record and a table', () => {
        it('should print the remaining amount', () => {
            expect(output.markdown).toHaveBeenCalledWith("$15.37 remaining.")
        });

        it('prompts for the new amount', () => {
            expect(input.textAsync).toHaveBeenCalledWith("What's the new amount?")
        });

        describe('given no amount', () => {
            itDoesNotUpdate();

            describe('in whitespace', () => {
                beforeEach(async () => {
                    arrangeAmount("  ")
                    await update()
                });
                itDoesNotUpdate()
            });
        });

        describe('given an updated amount', () => {
            describe('that is the same as the remaining', () => {
                beforeEach(async () => {
                    arrangeAmount("15.37");
                    await update()
                });
                itDoesNotUpdate()
            });

            describe('that is less than the remaining', () => {
                beforeEach(async () => {
                    arrangeAmount("14.45")
                    await update()
                });

                it('update the total by the difference', () => {
                    expect(_mocked.table.updateRecordAsync)
                        .toHaveBeenCalledWith(234, { "Total": 34.75 })
                });
            });
        });
    });

    async function arrange() {
        output.markdown = jest.fn();
        input.textAsync = jest.fn(async () => { })
        await update();
    }

    async function update() {
        await subject.update(_mocked.record, _mocked.table);
    }

    function arrangeAmount(amount) {
        input.textAsync.mockReturnValue(Promise.resolve(amount));
    }

    function itDoesNotUpdate() {
        it('does not update the record', () => {
            expect(_mocked.table.updateRecordAsync).not.toHaveBeenCalled();
        });
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

