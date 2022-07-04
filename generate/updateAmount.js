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
        const remaining = record.getCellValue("Remaining")
        const total = record.getCellValue("Total");
        await table.updateRecordAsync(record.id, {
            "Total": (total - (remaining - amount)),
        });

        output.markdown(`New remaining amount: \$${amount}`);
    }

}

function isValid(inputValue) {
    return !isNaN(parseFloat(inputValue))
}