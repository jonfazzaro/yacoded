const output = require("../stubs/output");
const input = require("../stubs/input");

module.exports = {
    update
}

async function update(record, table) {
    if (!record)
        return

    const remaining = record.getCellValue("Remaining")
    output.markdown(`\$${remaining} remaining.`)

    const textAmount = await input.textAsync("What's the new amount?")
    if (!textAmount)
        return

    const amount = parseFloat(textAmount)
    if (amount == remaining)
        return

    const difference = remaining - amount

    const total = record.getCellValue("Total")
    await table.updateRecordAsync(record.id, {
        "Total": (total - difference),
    });

    // output.markdown(`New remaining amount: \$${remaining - difference}`)

}