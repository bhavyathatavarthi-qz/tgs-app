import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
});

export async function fetchMeta() {
  const { data } = await client.get('/governance/meta');
  return data;
}

/**
 * @param {object} payload
 * @param {string} payload.username
 * @param {string} payload.role
 * @param {string} payload.department
 * @param {string} payload.company
 * @param {string} payload.environment
 * @param {string} payload.query
 * @param {{riskScore:number, zone:string}} payload.cas
 */
export async function analyzeGovernance(payload) {
  const { data } = await client.post('/governance', payload);
  return data;
}

export function extractErrorMessage(err) {
  if (err?.response?.data?.details) {
    return Array.isArray(err.response.data.details)
      ? err.response.data.details.join(' ')
      : String(err.response.data.details);
  }
  if (err?.response?.data?.detail) return err.response.data.detail;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return 'An unexpected error occurred while contacting the Trust & Governance Service.';
}

export default client;
