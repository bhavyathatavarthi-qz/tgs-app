const { v4: uuidv4 } = require('uuid');
const config = require('./config');
const { retrievePolicies } = require('./vectorStoreManager');
const { callGroqJSON } = require('./groqClient');
const { SYSTEM_PROMPT, buildUserPrompt } = require('./promptBuilder');

const VALID_DECISIONS = ['APPROVED', 'APPROVED_WITH_MODIFICATION', 'HELD', 'BLOCKED'];
const VALID_STATUSES = ['pass', 'warning', 'fail'];
const REQUIRED_CHECKS = [
  'Authorized Role',
  'Environment',
  'Consent',
  'Policy Compliance',
  'Accountability',
];

class GovernanceValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'GovernanceValidationError';
    this.status = 400;
    this.details = details;
  }
}

function validateRequestPayload(body) {
  const errors = [];
  const requiredStrings = ['username', 'role', 'department', 'company', 'environment', 'query'];
  for (const field of requiredStrings) {
    if (!body || typeof body[field] !== 'string' || !body[field].trim()) {
      errors.push(`"${field}" is required and must be a non-empty string.`);
    }
  }

  if (!body || !body.cas || typeof body.cas !== 'object') {
    errors.push('"cas" object is required.');
  } else {
    const { riskScore, zone } = body.cas;
    if (typeof riskScore !== 'number' || riskScore < 0 || riskScore > 100) {
      errors.push('"cas.riskScore" must be a number between 0 and 100.');
    }
    if (!zone || !config.zones[zone]) {
      errors.push(`"cas.zone" must be one of: ${Object.keys(config.zones).join(', ')}`);
    }
  }

  if (body && body.company && !config.companyRegistry[body.company]) {
    errors.push(`"company" must be one of: ${Object.keys(config.companyRegistry).join(', ')}`);
  }

  if (errors.length) {
    throw new GovernanceValidationError('Invalid governance request payload.', errors);
  }
}

/**
 * Best-effort JSON parsing of the LLM's response, tolerant of stray
 * markdown code fences some models add despite instructions.
 */
function parseModelJSON(raw) {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Model response did not contain a JSON object.');
  }
  text = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(text);
}

/**
 * Validates and normalizes the LLM's parsed output, filling in safe defaults
 * for anything missing so the API contract is always honored even if the
 * model slightly deviates from instructions.
 */
function normalizeModelOutput(parsed, retrievedPolicies) {
  const decision = VALID_DECISIONS.includes(parsed.decision) ? parsed.decision : 'HELD';

  const incomingChecks = Array.isArray(parsed.checks) ? parsed.checks : [];
  const checks = REQUIRED_CHECKS.map((name) => {
    const found = incomingChecks.find(
      (c) => typeof c?.name === 'string' && c.name.toLowerCase() === name.toLowerCase()
    );
    const status = found && VALID_STATUSES.includes(found.status) ? found.status : 'warning';
    const detail =
      found && typeof found.detail === 'string' && found.detail.trim()
        ? found.detail.trim()
        : 'Not explicitly evaluated by the reasoning model; treat as requiring manual review.';
    return { name, status, detail };
  });

  const policyLookup = new Map(retrievedPolicies.map((p) => [p.policyId, p]));
  const incomingPolicies = Array.isArray(parsed.policies) ? parsed.policies : [];
  let policies = incomingPolicies
    .filter((p) => p && typeof p.id === 'string' && policyLookup.has(p.id))
    .map((p) => {
      const source = policyLookup.get(p.id);
      return {
        id: p.id,
        title: (p.title && String(p.title).trim()) || source.title,
        category: source.category,
        summary: (p.summary && String(p.summary).trim()) || source.content,
      };
    });

  // Fallback: if the model cited nothing usable, surface the raw retrieval
  // set so the UI is never empty.
  if (policies.length === 0) {
    policies = retrievedPolicies.slice(0, 5).map((p) => ({
      id: p.policyId,
      title: p.title,
      category: p.category,
      summary: `Authorized Role: ${p.authorizedRole} · Environment: ${p.environment} · Consent Required: ${p.consentRequired}`,
    }));
  }

  const reason =
    typeof parsed.reason === 'string' && parsed.reason.trim()
      ? parsed.reason.trim()
      : 'The reasoning model did not return a detailed explanation for this decision. Manual review is recommended.';

  const recommendation =
    typeof parsed.recommendation === 'string' && parsed.recommendation.trim()
      ? parsed.recommendation.trim()
      : 'Route to an administrator for manual review.';

  return { decision, checks, policies, reason, recommendation };
}

/**
 * End-to-end governance evaluation: validate -> retrieve -> prompt -> LLM ->
 * normalize -> return.
 */
async function evaluateGovernance(rawRequest) {
  validateRequestPayload(rawRequest);

  const zoneMeta = config.zones[rawRequest.cas.zone];
  const request = {
    ...rawRequest,
    cas: { ...rawRequest.cas, zoneLabel: zoneMeta.label, zoneColor: zoneMeta.color },
  };

  const retrievedPolicies = await retrievePolicies(request.company, request.query, config.retrievalTopK);

  const userPrompt = buildUserPrompt({ request, retrievedPolicies });
  const rawModelResponse = await callGroqJSON({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });

  const parsed = parseModelJSON(rawModelResponse);
  const normalized = normalizeModelOutput(parsed, retrievedPolicies);

  return {
    requestId: uuidv4(),
    evaluatedAt: new Date().toISOString(),
    company: request.company,
    cas: request.cas,
    ...normalized,
  };
}

module.exports = { evaluateGovernance, GovernanceValidationError };
