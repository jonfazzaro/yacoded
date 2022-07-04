const output = require("../stubs/output");
const input = require("../stubs/input");

module.exports = { update }

async function update(record, table) {
    if (!record) return

    printRemaining();

    const textAmount = await input.textAsync("What's the new amount?")
    if (!isValid(textAmount))
        return

    if (!hasChanged(parseFloat(textAmount)))
        return

    await updateRecord(parseFloat(textAmount));

    async function updateRecord(amount) {
        await table.updateRecordAsync(record.id, {
            "Total": calculateNewTotal(amount),
        });

        output.markdown(`New remaining amount: \$${amount}`);
    }


    function calculateNewTotal(amount) {
        const remaining = record.getCellValue("Remaining");
        const total = record.getCellValue("Total");
        const updatedTotal = total - (remaining - amount);
        return updatedTotal;
    }

    function isValid(inputValue) {
        return !isNaN(parseFloat(inputValue))
    }

    function hasChanged(amount) {
        const remaining = record.getCellValue("Remaining");
        return remaining != amount
    }

    function printRemaining() {
        const remaining = record.getCellValue("Remaining");
        output.markdown(`\$${remaining} remaining.`);
    }
}
