# KoinX Reconciliation System Documentation

This document provides a technical overview of the functions, data ingestion process, and API usage for the KoinX Backend.

---

## 1. Core Functions & Responsibilities

### Data Ingestion (`src/services/ingestionService.js`)

Handles the flow of data from external CSV files into the system's database.

- **`ingestCSV(filePath, source)`**: The entry point for data loading.
  - **Why**: To centralize data loading and ensure idempotency (it clears old data before loading new data).
  - **How**: Streams the CSV file at `filePath`, validates each row, creates a `Transaction` model, and saves it to MongoDB.
- **`normalizeAsset(asset)`**:
  - **Why**: Different platforms use different naming conventions (e.g., "Bitcoin" vs "BTC").
  - **How**: Uses a mapping dictionary to convert raw strings into a canonical asset ID.
- **`validateRow(row)`**:
  - **Why**: To prevent corrupted or incomplete data from breaking the reconciliation engine.
  - **How**: Checks for required fields and proper data types, tagging invalid rows with specific error messages.

### Reconciliation Engine (`src/services/reconciliationService.js`)

The "brain" of the application that identifies matches and discrepancies.

- **`runMatchingEngine(runId, config)`**:
  - **Why**: To compare user-provided data against exchange records and find pairs.
  - **How**:
    1. Fetch all valid transactions.
    2. Filter exchange records by asset and transaction type.
    3. Check if they fall within the `timestampToleranceSeconds` and `quantityTolerancePct`.
    4. Create a `ReconciliationResult` record for every outcome.

---

## 2. Running & Injecting Data

### Step 1: Prepare Files

Ensure your CSV files are placed in the `data/` folder:

- `user_transactions.csv`
- `exchange_transactions.csv`

### Step 2: Trigger the Process

Call the **Reconcile API**. This single call performs three actions:

1.  **Reads** the CSV files.
2.  **Validates and Ingests** the data into the database.
3.  **Executes** the matching engine.

---

## 3. Postman API Reference

### A. Run Reconciliation (POST)

**Endpoint**: `POST /api/reconciliation/reconcile`  
**Description**: Starts a new reconciliation run.

**Body (JSON)**:

```json
{
  "TIMESTAMP_TOLERANCE_SECONDS": 60,
  "QUANTITY_TOLERANCE_PCT": 0.01
}
```

**Response**:
Returns a `runId`. You will need this for all subsequent GET requests.

---

### B. Fetch Summary (GET)

**Endpoint**: `GET /api/reconciliation/report/:runId/summary`  
**Description**: Get a high-level count of how many transactions matched vs. failed.

**Example**: `GET /api/reconciliation/report/abc-123/summary`

---

### C. Fetch Full Report (GET)

**Endpoint**: `GET /api/reconciliation/report/:runId`  
**Description**: Retrieve every single transaction outcome in JSON format.

**Export to CSV**:  
Add a query parameter to download a spreadsheet instead:  
`GET /api/reconciliation/report/:runId?format=csv`

---

### D. Fetch Unmatched Rows (GET)

**Endpoint**: `GET /api/reconciliation/report/:runId/unmatched`  
**Description**: Specifically retrieve transactions that couldn't be paired, along with the reason why (e.g., "No matching exchange ID found").

---

## 4. Database Models

- **Transaction**: The raw data from the CSV.
- **ReconciliationRun**: Metadata about a specific run (Time started, config used).
- **ReconciliationResult**: The final "verdict" for each transaction (Matched/Unmatched/Conflict).
