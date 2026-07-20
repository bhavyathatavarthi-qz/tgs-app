const fs = require('fs');
const mammoth = require('mammoth');

/**
 * Extracts raw text from a policy .docx file.
 */
async function extractRawText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Policy source file not found: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

// Field labels used in every policy block, in the order they normally appear.
const FIELD_LABELS = [
  'Category',
  'Policy Statement',
  'Authorized Role',
  'Environment',
  'Consent Required',
];

/**
 * Parses raw policy text into structured records. The source documents follow
 * a consistent pattern per policy:
 *
 *   POL-XXX -- Title
 *   Category: ...
 *   Policy Statement: ...
 *   Authorized Role: ...
 *   Environment: ...
 *   Consent Required: ...
 *
 * This parser is tolerant of line-wrapping and stray whitespace introduced by
 * DOCX -> plain-text extraction.
 */
function parsePolicies(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const policyHeaderRegex = /^(POL-\d{3,})\s*[-–—]{1,2}\s*(.+)$/i;
  const fieldRegex = new RegExp(`^(${FIELD_LABELS.join('|')})\\s*:\\s*(.*)$`, 'i');

  const records = [];
  let current = null;
  let activeField = null;

  const flushField = () => {
    if (current && activeField) {
      current[activeField] = current[activeField].trim();
    }
    activeField = null;
  };

  for (const line of lines) {
    const headerMatch = line.match(policyHeaderRegex);
    if (headerMatch) {
      flushField();
      if (current) records.push(current);
      current = {
        id: headerMatch[1].toUpperCase(),
        title: headerMatch[2].trim(),
        Category: '',
        'Policy Statement': '',
        'Authorized Role': '',
        Environment: '',
        'Consent Required': '',
      };
      continue;
    }

    if (!current) continue; // skip document title / preamble lines before POL-001

    const fieldMatch = line.match(fieldRegex);
    if (fieldMatch) {
      flushField();
      const label = FIELD_LABELS.find(
        (l) => l.toLowerCase() === fieldMatch[1].toLowerCase()
      );
      activeField = label;
      current[label] = fieldMatch[2] || '';
    } else if (activeField) {
      // continuation of a wrapped multi-line field (typically Policy Statement)
      current[activeField] += ` ${line}`;
    }
  }
  flushField();
  if (current) records.push(current);

  return records.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.Category,
    statement: r['Policy Statement'],
    authorizedRole: r['Authorized Role'],
    environment: r.Environment,
    consentRequired: r['Consent Required'],
  }));
}

/**
 * Loads and parses a company's policy document from disk.
 */
async function loadCompanyPolicies(sourceFile) {
  const rawText = await extractRawText(sourceFile);
  const policies = parsePolicies(rawText);
  if (policies.length === 0) {
    throw new Error(
      `No policies could be parsed from ${sourceFile}. Check the document structure.`
    );
  }
  return policies;
}

module.exports = { extractRawText, parsePolicies, loadCompanyPolicies };
