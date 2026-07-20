import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, LinearProgress, Stepper, Step, StepLabel, Paper } from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { ANALYSIS_STAGES } from '../theme/constants';

export default function AnalyzeSection({ loading, disabled, onAnalyze }) {
  const [activeStage, setActiveStage] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setActiveStage(0);
      intervalRef.current = setInterval(() => {
        setActiveStage((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
      }, 900);
    } else {
      clearInterval(intervalRef.current);
      setActiveStage(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  return (
    <Box>
      <Button
        fullWidth
        size="large"
        variant="contained"
        color="primary"
        startIcon={<BoltOutlinedIcon />}
        disabled={disabled || loading}
        onClick={onAnalyze}
        sx={{ py: 1.5, fontSize: '1rem' }}
      >
        {loading ? 'Analyzing…' : 'Analyze Governance'}
      </Button>

      {loading && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
          <Stepper activeStep={activeStage} alternativeLabel sx={{ mb: 1.5 }}>
            {ANALYSIS_STAGES.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <LinearProgress />
        </Paper>
      )}
    </Box>
  );
}
