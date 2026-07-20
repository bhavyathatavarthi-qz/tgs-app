import React from 'react';
import { Card, CardContent, Box, Typography, Stack, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { DECISION_META } from '../theme/constants';

const DECISION_ICON = {
  APPROVED: CheckCircleOutlineIcon,
  APPROVED_WITH_MODIFICATION: RuleOutlinedIcon,
  HELD: PauseCircleOutlineIcon,
  BLOCKED: BlockOutlinedIcon,
};

export default function GovernanceResultCard({ result }) {
  const meta = DECISION_META[result.decision] || DECISION_META.HELD;
  const Icon = DECISION_ICON[result.decision] || RuleOutlinedIcon;

  return (
    <Card sx={{ borderColor: meta.border, borderWidth: 1.5 }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: meta.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: meta.color, fontSize: 30 }} />
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Governance Decision
              </Typography>
              <Typography variant="h5" sx={{ color: meta.color, lineHeight: 1.1 }}>
                {meta.label}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              variant="outlined"
              label={`Request ${result.requestId?.slice(0, 8) || ''}`}
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={new Date(result.evaluatedAt).toLocaleString()}
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
