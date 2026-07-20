import React from 'react';
import { Card, CardContent, Stack, Avatar, Box, Typography } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

export default function RecommendationCard({ recommendation }) {
  return (
    <Card sx={{ bgcolor: 'primary.main' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 36, height: 36 }}>
            <ArrowForwardOutlinedIcon sx={{ color: '#fff' }} fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Recommended Next Action
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#fff' }}>
              {recommendation}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
