const output = require("../stubs/output");
const input = require("../stubs/input");

module.exports = { update }

async function update(record, table) {
    if (!record) return

    const remaining = record.getCellValue("Remaining")
    output.markdown(`\$${remaining} remaining.`)

    const textAmount = await input.textAsync("What's the new amount?")
    if (!isValid(textAmount))
        return

    const amount = parseFloat(textAmount)
    if (amount == remaining)
        return

    await updateRecord(amount);

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
}

function isValid(inputValue) {
    return !isNaN(parseFloat(inputValue))
}