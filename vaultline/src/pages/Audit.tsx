import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useVault } from '../context/VaultStore';
import { can } from '../data/users';
import type { AuditRecord } from '../types';
import { hairline, mono, alert as alertRed, teal } from '../theme';

const ALL = 'All';

export function Audit() {
  const { audit, deletions, role, approveDeletion, declineDeletion, requestDeletion, entries } =
    useVault();

  const [result, setResult] = useState(ALL);
  const [actor, setActor] = useState(ALL);
  const [term, setTerm] = useState('');
  const [deleteReference, setDeleteReference] = useState('DOC-2026-004131');

  const mayDelete = can(role, 'delete');
  const actors = useMemo(() => Array.from(new Set(audit.map((a) => a.user))).sort(), [audit]);

  const filtered = useMemo(
    () =>
      audit.filter((row) => {
        if (result !== ALL && row.result !== result) return false;
        if (actor !== ALL && row.user !== actor) return false;
        if (term) {
          const needle = term.toLowerCase();
          return (
            row.action.toLowerCase().includes(needle) ||
            row.object.toLowerCase().includes(needle) ||
            row.detail.toLowerCase().includes(needle)
          );
        }
        return true;
      }),
    [audit, result, actor, term],
  );

  const columns: GridColDef<AuditRecord>[] = [
    {
      field: 'at',
      headerName: 'Timestamp',
      width: 160,
      renderCell: (p) => (
        <span style={{ fontFamily: mono }}>
          {format(new Date(p.value as string), 'yyyy-MM-dd HH:mm:ss')}
        </span>
      ),
    },
    { field: 'user', headerName: 'User', width: 128 },
    { field: 'role', headerName: 'Role', width: 118 },
    { field: 'action', headerName: 'Action', width: 175 },
    {
      field: 'object',
      headerName: 'Object',
      width: 200,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    {
      field: 'workstation',
      headerName: 'Workstation',
      width: 120,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    {
      field: 'result',
      headerName: 'Result',
      width: 105,
      renderCell: (p) => (
        <Chip
          label={p.value as string}
          size="small"
          variant="outlined"
          color={p.value === 'Blocked' ? 'error' : p.value === 'Warning' ? 'warning' : 'success'}
        />
      ),
    },
    { field: 'detail', headerName: 'Detail', flex: 1, minWidth: 300 },
  ];

  const blockedCount = audit.filter((a) => a.result === 'Blocked').length;

  return (
    <Box>
      <PageHeader
        moduleId="audit"
        title="Audit & compliance"
        intro="The audit log is append-only. Every line carries the user, their role, the workstation and a date and time stamp, and no line can be edited or removed — including the line written when a deletion is approved."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Deletion requests"
            description="Only an Administrator may approve a deletion. Approval removes the index entry and writes an audit line."
          >
            {!mayDelete && (
              <Alert severity="warning" icon={<LockOutlinedIcon />} sx={{ mb: 2 }}>
                You are signed in as {role}. Approve and decline are disabled. Try one anyway — the
                attempt is blocked and written to the audit log below.
              </Alert>
            )}

            {deletions.length === 0 ? (
              <Alert severity="success">
                The queue is empty. New requests arrive here from clerks and from the duplicate
                queue.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {deletions.map((request) => (
                  <Box
                    key={request.id}
                    sx={{ border: `1px solid ${hairline}`, borderRadius: 1, p: 1.75 }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.8125rem', fontWeight: 600 }}>
                            {request.reference}
                          </Typography>
                          <Chip
                            label={request.retentionExpired ? 'Retention expired' : 'Discretionary'}
                            size="small"
                            variant="outlined"
                            color={request.retentionExpired ? 'success' : 'warning'}
                          />
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {request.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.reason}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', fontFamily: mono, mt: 0.5 }}
                        >
                          Requested by {request.requestedBy} · {request.requestedAt.replace('T', ' ')}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0, height: 'fit-content' }}>
                        <Tooltip
                          title={
                            mayDelete
                              ? 'Removes the entry and writes an audit line'
                              : 'Blocked — admin only. Deletion is reserved to the Administrator role.'
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() => approveDeletion(request.id)}
                            >
                              Approve deletion
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            mayDelete
                              ? 'Keeps the entry in the index'
                              : 'Blocked — admin only. Deletion is reserved to the Administrator role.'
                          }
                        >
                          <span>
                            <Button size="small" onClick={() => declineDeletion(request.id)}>
                              Decline
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <SectionCard
              title="Try a deletion at your current role"
              description="Switch to Clerk in the top bar and try this. The attempt is refused and a Blocked line is written."
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  label="Reference to delete"
                  value={deleteReference}
                  onChange={(e) => setDeleteReference(e.target.value.toUpperCase())}
                  InputProps={{ sx: { fontFamily: mono } }}
                />
                <Button
                  variant="outlined"
                  color={mayDelete ? 'primary' : 'error'}
                  sx={{ flexShrink: 0, height: 40 }}
                  onClick={() =>
                    requestDeletion(
                      deleteReference,
                      'Requested from the audit screen during the demonstration.',
                    )
                  }
                >
                  Request deletion
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {entries.some((e) => e.reference === deleteReference)
                  ? `${deleteReference} is in the index.`
                  : `${deleteReference} is not in the index. Enter a reference from the search results.`}
              </Typography>
            </SectionCard>

            <SectionCard
              title="Audit report"
              description="The audit log is a standard report. It exports to PDF or CSV and can be scheduled to internal audit."
            >
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="overline" color="text.secondary" display="block">
                    Lines held
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '1.5rem', fontWeight: 600 }}>
                    {audit.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary" display="block">
                    Blocked attempts
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: blockedCount > 0 ? alertRed : teal,
                    }}
                  >
                    {blockedCount}
                  </Typography>
                </Box>
              </Stack>
              <Button component={RouterLink} to="/reports" size="small" sx={{ mt: 1.5 }}>
                Build a user or audit report
              </Button>
            </SectionCard>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <SectionCard
            title="Audit log"
            description={`Append-only. ${filtered.length} of ${audit.length} lines shown. Newest first.`}
          >
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search the log"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Action, object or detail"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="User"
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                >
                  <MenuItem value={ALL} sx={{ fontSize: '0.8125rem' }}>
                    All users
                  </MenuItem>
                  {actors.map((a) => (
                    <MenuItem key={a} value={a} sx={{ fontSize: '0.8125rem' }}>
                      {a}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  {[ALL, 'Success', 'Blocked', 'Warning'].map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: '0.8125rem' }}>
                      {r === ALL ? 'All results' : r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ height: 520, width: '100%' }}>
              <DataGrid
                rows={filtered}
                columns={columns}
                density="compact"
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                pageSizeOptions={[10, 25, 50]}
                localeText={{
                  noRowsLabel:
                    'No audit lines match these filters. Clear the result filter to see the full log.',
                }}
                getRowClassName={(p) => (p.row.result === 'Blocked' ? 'audit-blocked' : '')}
                sx={{
                  border: 'none',
                  fontSize: '0.8125rem',
                  '& .audit-blocked': { backgroundColor: 'rgba(184,55,44,0.06)' },
                  '& .audit-blocked .MuiDataGrid-cell': { color: alertRed },
                }}
              />
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
