const output = require("../stubs/output");
const input = require("../stubs/input");

module.exports = {
    update
}

function update(record) {
    if (!record)
        return

    const remaining = record.getCellValue("Remaining")
    output.markdown(`\$${remaining} remaining.`)

    // const amount = await 
    input.textAsync("What's the new amount?")
    // if (!amount)
        output.markdown("Kthxbye!")
    // const difference = remaining - parseFloat(amount);

    // const total = record.getCellValue("Total")
    // await table.updateRecordAsync(record.id, {
    //     "Total": (total - difference),
    // });

    // output.markdown(`New remaining amount: \$${remaining - difference}`)

}