const output = require("../stubs/output");
const input = require("../stubs/input");

module.exports = { update }

async function update(record, table) {
    if (!record) return

    printRemaining();

    const textAmount = await input.textAsync("What's the new amount?")
    validate(textAmount)

    if (!hasChanged(parseFloat(textAmount))) {
        output.markdown("That's already the remaining amount!")
        return
    }

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

    function validate(inputValue) {
        if (isNaN(parseFloat(inputValue)))
            throw new Error("Please enter a valid dollar amount.")
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
