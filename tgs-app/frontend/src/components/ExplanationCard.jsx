import React from 'react';
import { Card, CardHeader, CardContent, Avatar, Typography } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';

export default function ExplanationCard({ reason }) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <PsychologyOutlinedIcon fontSize="small" />
          </Avatar>
        }
        title="Explanation"
        subheader="Reasoning generated from the retrieved policies and CAS assessment"
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
          {reason}
        </Typography>
      </CardContent>
    </Card>
  );
}
