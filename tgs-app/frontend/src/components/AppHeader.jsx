import React from 'react';
import { AppBar, Toolbar, Box, Typography, Chip, Stack } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export default function AppHeader() {
  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ minHeight: 68 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
          }}
        >
          <ShieldOutlinedIcon sx={{ color: '#fff' }} fontSize="small" />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
            QMentisAI &nbsp;·&nbsp; Trust &amp; Governance Service
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enterprise Agentic QE Platform — Governance Decision Console
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label="RAG + LLM Reasoning"
            sx={{ bgcolor: 'info.light', color: 'info.main' }}
          />
          <Chip
            size="small"
            label="TGS v1.0"
            variant="outlined"
            sx={{ borderColor: 'divider', color: 'text.secondary' }}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
