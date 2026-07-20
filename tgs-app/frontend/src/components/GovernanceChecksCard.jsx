import React from 'react';
import { Card, CardHeader, CardContent, Avatar, Stack, Box, Typography } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import { CHECK_STATUS_META } from '../theme/constants';

const STATUS_ICON = {
  pass: CheckCircleIcon,
  warning: WarningAmberIcon,
  fail: CancelIcon,
};

export default function GovernanceChecksCard({ checks }) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <FactCheckOutlinedIcon fontSize="small" />
          </Avatar>
        }
        title="Governance Checks"
        titleTypographyProps={{ variant: 'subtitle1' }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.25}>
          {checks.map((check) => {
            const meta = CHECK_STATUS_META[check.status] || CHECK_STATUS_META.warning;
            const Icon = STATUS_ICON[check.status] || WarningAmberIcon;
            return (
              <Box
                key={check.name}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Icon sx={{ color: meta.color, mt: '2px' }} fontSize="small" />
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {check.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: meta.color, textTransform: 'uppercase' }}
                    >
                      {meta.label}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {check.detail}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
