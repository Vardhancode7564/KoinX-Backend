const { stringify } = require("csv-stringify/sync");

function exportToCSV(results) {
  if (!results || results.length === 0) {
    return "";
  }

  const rows = results.map((r) => {
    const user = r.details?.user || {};
    const exchange = r.details?.exchange || {};

    return {
      Category: r.category,
      Reason: r.reason,
      User_TransactionID: user.externalId || "",
      User_Timestamp: user.timestamp ? new Date(user.timestamp).toISOString(): "",
      User_Type: user.type || "",
      User_Asset: user.asset || "",
      User_Quantity: user.quantity ?? "",
      Exchange_TransactionID: exchange.externalId || "",
      Exchange_Timestamp: exchange.timestamp ? new Date(exchange.timestamp).toISOString():"",
      Exchange_Type: exchange.type || "",
      Exchange_Asset: exchange.asset || "",
      Exchange_Quantity: exchange.quantity ?? "",
    };
  });

  return stringify(rows, { header: true });
}

module.exports = { exportToCSV };
