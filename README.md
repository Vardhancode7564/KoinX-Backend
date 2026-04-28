# KoinX Transaction Reconciliation Engine



As part of our internal tools at KoinX, this backend service is designed to automate the reconciliation between user-provided transaction logs and official exchange records. Handling thousands of transactions manually is error-prone, so this system uses a flexible matching engine to identify discrepancies in timestamps and quantities.



# What this does

1. **Ingestion**: Reads raw CSV files from our `data/` folder and       cleans them.
2.  **Normalization**: Standardizes asset names (e.g., "bit-coin"  "BTC") and transaction types so they can be compared fairly.
3.  **Matching**: Pairs transactions based on a configurable "Tolerance Level" (how many seconds apart they can be, or how much the quantity can differ).
4.  **Reporting**: Generates a summary of what matched, what conflicted, and what was missing entirely.

---

## Getting Started

### 1. Setup

First, make sure you have your CSV files in the right place:

- Put your user file in: `data/user_transactions.csv`
- Put the exchange file in: `data/exchange_transactions.csv`

Then, install dependencies and start the server:

```bash
npm install
npm start
```

### 2. Running a Reconciliation

We use Postman to trigger the engine.

**Endpoint**: `POST /api/reconcile`  
**JSON Body**:

```json
{
  "TIMESTAMP_TOLERANCE_SECONDS": 300,
  "QUANTITY_TOLERANCE_PCT": 0.01
}
```


## API Guide for Developers

### How to Retrieve Results

Once you have your `runId` from the step above, use these endpoints:

1.  **Get the Stats**: To see a quick pass/fail count.
    - `GET /api/report/:runId/summary`
2.  **View Errors**: To see exactly which transactions failed to match.
    - `GET /api/report/:runId/unmatched`
3.  **Download CSV**: To get a full spreadsheet of the results.
    - `GET /api/report/:runId?format=csv`

---

## Project Structure

- `src/services/ingestionService.js`: Logic for reading and cleaning CSVs.
- `src/services/reconciliationService.js`: The core logic for pairing transactions.
- `src/models/`: Database schemas for MongoDB.
- `src/utils/`: Helper scripts for standardizing assets and types.

---

## Technical Notes

- **Normalization**: If a new coin name or type is appearing incorrectly, check `src/utils/assetAliases.js`.
- **Idempotency**: Every time you run the reconciliation, the system clears old data for those specific files to avoid duplicates.

**Request Body (Optional):**

```json
{
  "TIMESTAMP_TOLERANCE_SECONDS": 600,
  "QUANTITY_TOLERANCE_PCT": 0.05
}
```

### 2. Get Summary

`GET /api/report/:runId/summary`

Returns counts for Matched, Conflicting, and Unmatched transactions.

### 3. Get Full Report

`GET /api/report/:runId`

Returns a list of all reconciliation results. Add `?format=csv` to download as a CSV file.

### 4. Get Unmatched Rows

`GET /api/report/:runId/unmatched`

Returns only the rows that could not be matched, with reasons.

## Key Design Decisions

1. **Database Selection**: MongoDB was chosen for its flexibility in storing potentially messy transaction rows and its ease of horizontal scaling.
2. **Matching Strategy**: The engine first filters candidates by asset and compatible types before applying mathematical tolerances. This improves performance as the dataset grows.
3. **Data Quality**: Rows with missing IDs, invalid timestamps, or non-numeric quantities are saved to the database but flagged with `isValid: false` and specific `qualityIssues`. They are excluded from matching to prevent false positives.
4. **Type Mapping**: We maintain a mapping for "opposite perspective" types. For example, a `TRANSFER_OUT` in the user's records is logically the same event as a `TRANSFER_IN` in the exchange's records.
5. **Asset Normalization**: A utility maps common aliases (Bitcoin -> BTC) ensuring consistency across different data sources.

## Assumptions

- Transactions in `data/user_transactions.csv` and `data/exchange_transactions.csv` are the primary inputs.
- The same transaction might have a slightly different timestamp (up to 5 mins) or quantity (up to 0.01%) due to fees or processing delays.
