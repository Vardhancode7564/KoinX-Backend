const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const ReconciliationRun = require('../models/ReconciliationRun');
const ReconciliationResult = require('../models/ReconciliationResult');
const { ingestCSV } = require('../services/ingestionService');
const { runMatchingEngine } = require('../services/reconciliationService');
const { exportToCSV } = require('../utils/csvExporter');
const defaults = require('../config/defaults');

// Trigger reconciliation run
router.post('/reconcile', async (req, res) => {
  try {
    const runId = uuidv4();
    const config = {
      timestampToleranceSeconds: req.body.TIMESTAMP_TOLERANCE_SECONDS || defaults.TIMESTAMP_TOLERANCE_SECONDS,
      quantityTolerancePct: req.body.QUANTITY_TOLERANCE_PCT || defaults.QUANTITY_TOLERANCE_PCT
    };

    const run = new ReconciliationRun({ runId, config, status: 'processing' });
    await run.save();

  
    
    // 1. Ingest Data
    const userPath = path.join(__dirname, '../../data/user_transactions.csv');
    const exchangePath = path.join(__dirname, '../../data/exchange_transactions.csv');
    
    await ingestCSV(userPath, 'user');
    await ingestCSV(exchangePath, 'exchange');

    // 2. Run Engine
    const summary = await runMatchingEngine(runId, config);

    // 3. Update Run Status
    run.status = 'completed';
    run.summary = summary;
    run.completedAt = new Date();
    await run.save();

    res.json({ message: 'Reconciliation completed', runId, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reconciliation failed', details: err.message });
  }
});

// Fetch full report
router.get('/report/:runId', async (req, res) => {
  try {
    const results = await ReconciliationResult.find({ runId: req.params.runId });
    
    // Check for format=csv query param
    if (req.query.format === 'csv') {
      const csv = exportToCSV(results);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reconciliation_report_${req.params.runId}.csv`);
      return res.send(csv);
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Fetch summary
router.get('/report/:runId/summary', async (req, res) => {
  try {
    const run = await ReconciliationRun.findOne({ runId: req.params.runId });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run.summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Fetch unmatched rows with reasons
router.get('/report/:runId/unmatched', async (req, res) => {
  try {
    const results = await ReconciliationResult.find({ 
      runId: req.params.runId,
      category: { $in: ['Unmatched (User only)', 'Unmatched (Exchange only)'] }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unmatched rows' });
  }
});

module.exports = router;
