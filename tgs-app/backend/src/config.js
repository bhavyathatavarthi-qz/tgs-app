require('dotenv').config();
const path = require('path');

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim()),
  retrievalTopK: parseInt(process.env.RETRIEVAL_TOP_K || '5', 10),
  rebuildIndexOnStart: (process.env.REBUILD_INDEX_ON_START || 'true').toLowerCase() === 'true',
  dataDir: path.join(__dirname, '..', 'data'),
  vectorStoreDir: path.join(__dirname, '..', 'vectorstores'),
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
};

// Registry mapping the "Company" dropdown value to its policy source document
// and the on-disk vector store namespace. Add new companies here — no other
// code changes required as long as the source .docx follows the same
// POL-XXX / Category / Policy Statement / Authorized Role / Environment /
// Consent Required structure used by ABC Bank and XYZ Solutions.
config.companyRegistry = {
  'ABC Bank': {
    slug: 'abc_bank',
    sourceFile: path.join(config.dataDir, 'abc_bank.docx'),
  },
  'XYZ Solutions': {
    slug: 'xyz_solutions',
    sourceFile: path.join(config.dataDir, 'xyz_solutions.docx'),
  },
};

config.roles = [
  'Developer',
  'Senior Developer',
  'QA Engineer',
  'DevOps Engineer',
  'Senior DevOps Engineer',
  'Database Administrator',
  'Senior DBA',
  'Infrastructure Engineer',
  'IAM Administrator',
  'Security Administrator',
  'Network Engineer',
  'Data Administrator',
  'ML Engineer',
  'Site Reliability Engineer',
  'Incident Commander',
  'Manager',
];

config.departments = ['Engineering', 'QA', 'Infrastructure', 'Security'];

config.environments = ['Development', 'QA', 'UAT', 'Production'];

// CAS zone metadata — TGS only ever *receives* these, never computes them.
config.zones = {
  'Zone 1': { label: 'Auto Respond', color: 'green' },
  'Zone 2': { label: 'Ask Clarification', color: 'blue' },
  'Zone 3': { label: 'Escalate', color: 'orange' },
  'Zone 4': { label: 'Reject', color: 'red' },
};

module.exports = config;
