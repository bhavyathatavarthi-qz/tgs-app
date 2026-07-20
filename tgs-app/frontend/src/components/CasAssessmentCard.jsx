import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Slider,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { ZONE_META } from '../theme/constants';

const ZONE_OPTIONS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

function riskColor(score) {
  if (score < 30) return '#1E8E5A';
  if (score < 60) return '#1E5FA8';
  if (score < 80) return '#B7791F';
  return '#B3261E';
}

export default function CasAssessmentCard({ cas, onChange }) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
            <InsightsOutlinedIcon fontSize="small" />
          </Avatar>
        }
        title="CAS Assessment"
        subheader="Context Assessment Service output — input only, not calculated here"
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        <Alert severity="info" variant="outlined" sx={{ mb: 2.5 }}>
          TGS does not calculate risk or autonomy zone. These values are received from CAS
          and used as governance decision inputs.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Risk Score
            </Typography>
            <Chip
              size="small"
              label={`${cas.riskScore} / 100`}
              sx={{ bgcolor: `${riskColor(cas.riskScore)}1A`, color: riskColor(cas.riskScore) }}
            />
          </Stack>
          <Slider
            value={cas.riskScore}
            onChange={(e, v) => onChange({ ...cas, riskScore: v })}
            min={0}
            max={100}
            step={1}
            sx={{ color: riskColor(cas.riskScore) }}
          />
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Zone
        </Typography>
        <RadioGroup
          value={cas.zone}
          onChange={(e) => onChange({ ...cas, zone: e.target.value })}
        >
          <Stack spacing={1}>
            {ZONE_OPTIONS.map((zoneKey) => {
              const meta = ZONE_META[zoneKey];
              const selected = cas.zone === zoneKey;
              return (
                <Box
                  key={zoneKey}
                  sx={{
                    border: '1px solid',
                    borderColor: selected ? meta.color : 'divider',
                    bgcolor: selected ? meta.bg : 'transparent',
                    borderRadius: 2,
                    px: 1,
                    py: 0.25,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FormControlLabel
                    value={zoneKey}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: meta.color,
                          '&.Mui-checked': { color: meta.color },
                        }}
                      />
                    }
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {zoneKey}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {meta.label}
                        </Typography>
                      </Stack>
                    }
                    sx={{ width: '100%', m: 0, py: 0.75 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
