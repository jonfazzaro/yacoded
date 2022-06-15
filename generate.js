module.exports = {
    latestPaymentDate,
    generatePayments,
    addMonths
}

async function latestPaymentDate() {

    let query = await base.getTable("Payments").selectRecordsAsync({
        fields: ['Date'],
        sorts: [{
            field: "Date",
            direction: "desc"
        }]
    })

    return new Date(query.records[0].getCellValue("Date"))

}


async function generatePayments(date) {
    let accounts = await base.getTable("Accounts").getView("Paying").selectRecordsAsync({ fields: [" Payment "] })
    let payments = accounts.records
        .filter(account => 0 < account.getCellValue(" Payment "))
        .map(account => ({
        fields: {
            "Date": date,
            "Amount": account.getCellValue(" Payment "),
            "Account": [{ id: account.id }]
        }
    }))
    let created = await base.getTable("Payments").createRecordsAsync(payments)
    output.markdown(`Created ${created.length} of ${payments.length} payments.`)
}


function addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    // if (date.getDate() != d) {
    //     date.setDate(0);
    // }
    return date;
}