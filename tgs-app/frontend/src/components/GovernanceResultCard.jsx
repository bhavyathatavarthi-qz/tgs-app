import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, Stack, Chip, Tooltip, IconButton } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
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
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (result.requestId) {
      navigator.clipboard.writeText(result.requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card sx={{ borderColor: meta.border, borderWidth: 1.5 }}>
      <CardContent>
        <Stack spacing={2}>
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

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<VerifiedUserOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                size="small"
                color="success"
                variant="outlined"
                label="Audit Logged"
              />
              <Chip
                size="small"
                variant="outlined"
                label={new Date(result.evaluatedAt).toLocaleString()}
                sx={{ borderColor: 'divider', color: 'text.secondary' }}
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: '1px dashed',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                AUDIT REQ ID:
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {result.requestId || 'N/A'}
              </Typography>
            </Stack>
            {result.requestId && (
              <Tooltip title={copied ? 'Copied!' : 'Copy Request ID'}>
                <IconButton size="small" onClick={handleCopyId} sx={{ p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
