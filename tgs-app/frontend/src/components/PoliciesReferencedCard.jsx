import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function PoliciesReferencedCard({ policies }) {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
            <LibraryBooksOutlinedIcon fontSize="small" />
          </Avatar>
        }
        title="Policies Referenced"
        subheader={`${policies.length} polic${policies.length === 1 ? 'y' : 'ies'} retrieved via semantic search`}
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent sx={{ pt: 0 }}>
        {policies.map((p) => (
          <Accordion key={p.id} disableGutters variant="outlined" sx={{ '&:before': { display: 'none' }, mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                <Chip
                  size="small"
                  label={p.id}
                  sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {p.title}
                </Typography>
                {p.category && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={p.category}
                    sx={{ ml: 'auto', borderColor: 'divider', color: 'text.secondary' }}
                  />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {p.summary}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
}
