export const ZONE_META = {
  'Zone 1': { label: 'Auto Respond', color: '#1E8E5A', bg: '#E5F5EC', border: '#BFE6D2' },
  'Zone 2': { label: 'Ask Clarification', color: '#1E5FA8', bg: '#E8F0FB', border: '#C4D9F3' },
  'Zone 3': { label: 'Escalate', color: '#B7791F', bg: '#FDF3E2', border: '#F3DBA6' },
  'Zone 4': { label: 'Reject', color: '#B3261E', bg: '#FBE9E7', border: '#F3C6C1' },
};

export const DECISION_META = {
  APPROVED: { label: 'Approved', color: '#1E8E5A', bg: '#E5F5EC', border: '#1E8E5A' },
  APPROVED_WITH_MODIFICATION: {
    label: 'Approved with Modification',
    color: '#1E5FA8',
    bg: '#E8F0FB',
    border: '#1E5FA8',
  },
  HELD: { label: 'Held', color: '#B7791F', bg: '#FDF3E2', border: '#B7791F' },
  BLOCKED: { label: 'Blocked', color: '#B3261E', bg: '#FBE9E7', border: '#B3261E' },
};

export const CHECK_STATUS_META = {
  pass: { color: '#1E8E5A', label: 'Pass' },
  warning: { color: '#B7791F', label: 'Warning' },
  fail: { color: '#B3261E', label: 'Fail' },
};

export const ANALYSIS_STAGES = [
  'User Request',
  'CAS Inputs',
  'Policy Retrieval',
  'LLM Analysis',
  'Governance Decision',
];
