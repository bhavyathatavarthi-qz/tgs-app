const express = require('express');
const { evaluateGovernance } = require('../governanceEngine');
const config = require('../config');

const router = express.Router();

/**
 * POST /api/governance
 * Body: { username, role, department, company, environment, query, cas: { riskScore, zone } }
 */
router.post('/governance', async (req, res, next) => {
  try {
    const result = await evaluateGovernance(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/governance/meta
 * Static dropdown options + zone metadata for the frontend to render without
 * hardcoding enums on the client.
 */
router.get('/governance/meta', (req, res) => {
  res.json({
    roles: config.roles,
    departments: config.departments,
    environments: config.environments,
    companies: Object.keys(config.companyRegistry),
    zones: config.zones,
  });
});

module.exports = router;
