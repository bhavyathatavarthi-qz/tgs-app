import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Stack,
  Alert,
  Skeleton,
  Typography,
  Box,
} from '@mui/material';

import RequestInfoCard from '../components/RequestInfoCard';
import CasAssessmentCard from '../components/CasAssessmentCard';
import AnalyzeSection from '../components/AnalyzeSection';
import GovernanceResultCard from '../components/GovernanceResultCard';
import GovernanceChecksCard from '../components/GovernanceChecksCard';
import PoliciesReferencedCard from '../components/PoliciesReferencedCard';
import ExplanationCard from '../components/ExplanationCard';
import RecommendationCard from '../components/RecommendationCard';

import { fetchMeta, analyzeGovernance, extractErrorMessage } from '../api/governanceApi';

const DEFAULT_META = {
  roles: ['Developer', 'QA Engineer', 'Senior Developer', 'DevOps Engineer', 'Database Administrator', 'Security Administrator', 'Manager'],
  departments: ['Engineering', 'QA', 'Infrastructure', 'Security'],
  companies: ['ABC Bank', 'XYZ Solutions'],
  environments: ['Development', 'QA', 'UAT', 'Production'],
};

export default function Dashboard() {
  const [meta, setMeta] = useState(DEFAULT_META);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);

  const [form, setForm] = useState({
    username: '',
    role: DEFAULT_META.roles[0],
    department: DEFAULT_META.departments[0],
    company: DEFAULT_META.companies[0],
    environment: DEFAULT_META.environments[0],
    query: '',
  });
  const [cas, setCas] = useState({ riskScore: 45, zone: 'Zone 2' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchMeta()
      .then((data) => {
        if (!mounted) return;
        setMeta(data);
        setForm((f) => ({
          ...f,
          role: data.roles[0],
          department: data.departments[0],
          company: data.companies[0],
          environment: data.environments[0],
        }));
      })
      .catch((err) => {
        if (!mounted) return;
        setMetaError(
          'Could not reach the TGS backend to load dropdown options — using defaults. Is the backend running on the configured port?'
        );
      })
      .finally(() => mounted && setMetaLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const canAnalyze = form.username.trim() && form.query.trim() && !loading;

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = { ...form, cas };
      const data = await analyzeGovernance(payload);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Governance Request Console</Typography>
        <Typography variant="body2" color="text.secondary">
          Submit an action request with CAS context to receive a policy-grounded governance
          decision.
        </Typography>
      </Box>

      {metaError && !metaLoading && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {metaError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {metaLoading ? (
              <Skeleton variant="rounded" height={360} />
            ) : (
              <RequestInfoCard form={form} onChange={setForm} meta={meta} />
            )}
            {metaLoading ? (
              <Skeleton variant="rounded" height={320} />
            ) : (
              <CasAssessmentCard cas={cas} onChange={setCas} />
            )}
            <AnalyzeSection loading={loading} disabled={!canAnalyze} onAnalyze={handleAnalyze} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          {!result && !loading && (
            <Box
              sx={{
                height: '100%',
                minHeight: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                color: 'text.secondary',
                textAlign: 'center',
                px: 4,
              }}
            >
              <Typography variant="body2">
                Governance results — decision, checks, referenced policies, and explanation —
                will appear here after you run an analysis.
              </Typography>
            </Box>
          )}

          {result && (
            <Stack spacing={3}>
              <GovernanceResultCard result={result} />
              <GovernanceChecksCard checks={result.checks} />
              <PoliciesReferencedCard policies={result.policies} />
              <ExplanationCard reason={result.reason} />
              <RecommendationCard recommendation={result.recommendation} />
            </Stack>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
