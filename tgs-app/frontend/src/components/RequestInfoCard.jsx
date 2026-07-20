import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  Avatar,
} from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';

export default function RequestInfoCard({ form, onChange, meta }) {
  const handle = (field) => (e) => onChange({ ...form, [field]: e.target.value });

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <AssignmentIndOutlinedIcon fontSize="small" />
          </Avatar>
        }
        title="Request Information"
        subheader="Requester identity, context, and the action being requested"
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Username"
              placeholder="e.g. jsmith"
              value={form.username}
              onChange={handle('username')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Role"
              value={form.role}
              onChange={handle('role')}
            >
              {meta.roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Department"
              value={form.department}
              onChange={handle('department')}
            >
              {meta.departments.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Company"
              value={form.company}
              onChange={handle('company')}
            >
              {meta.companies.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Environment"
              value={form.environment}
              onChange={handle('environment')}
            >
              {meta.environments.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label="Query"
              placeholder="Describe the action being requested, e.g. 'Deploy the latest build to the production environment for the payments service.'"
              value={form.query}
              onChange={handle('query')}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
