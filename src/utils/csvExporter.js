/**
 * CSV export utility for generating reconciliation report files.
 */

const { stringify } = require("csv-stringify/sync");


function exportToCSV(results) {
  if (!results || results.length === 0) {
    return "";
  }

  const rows = results.map((r) => ({
    Category: r.category,
    Reason: r.reason,
    User_TransactionID: r.userTransaction?.transactionId || "",
    User_Date: r.userTransaction?.date || "",
    User_Type: r.userTransaction?.type || "",
    User_Asset: r.userTransaction?.asset || "",
    User_Amount: r.userTransaction?.amount ?? "",
    Exchange_TransactionID: r.exchangeTransaction?.transactionId || "",
    Exchange_Date: r.exchangeTransaction?.date || "",
    Exchange_Type: r.exchangeTransaction?.type || "",
    Exchange_Asset: r.exchangeTransaction?.asset || "",
    Exchange_Amount: r.exchangeTransaction?.amount ?? "",
  }));

  return stringify(rows, { header: true });
}

module.exports = { exportToCSV };
