import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { TransactionReceipt } from '../components/TransactionReceipt';
import { MovementTimeline } from '../components/MovementTimeline';
import { printRegion } from '../components/print';
import { useVault } from '../context/VaultStore';
import { divisions, vaultRows } from '../data/lookups';
import { can } from '../data/users';
import type { Division, Movement } from '../types';
import { mono } from '../theme';

const ALL = 'All';

export function Tracking() {
  const { movements, entries, role, issueFile, returnFile, notify } = useVault();

  const [division, setDivision] = useState<string>(ALL);
  const [row, setRow] = useState<string>(ALL);
  const [user, setUser] = useState<string>(ALL);
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-08-31');

  const [reference, setReference] = useState('DOC-2026-004131');
  const [recipient, setRecipient] = useState('T. van Wyk');
  const [recipientDivision, setRecipientDivision] = useState<Division>('News & Current Affairs');
  const [destination, setDestination] = useState('News desk, 3rd floor');
  const [dueBack, setDueBack] = useState('2026-08-20');

  const [issueSlip, setIssueSlip] = useState<Movement | null>(null);
  const [returnSlip, setReturnSlip] = useState<Movement | null>(null);

  const issueRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);

  const mayIssue = can(role, 'issueReceive');
  const userNames = useMemo(
    () => Array.from(new Set(movements.map((m) => m.user))).sort(),
    [movements],
  );

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        const date = m.at.slice(0, 10);
        if (division !== ALL && m.division !== division) return false;
        if (row !== ALL && m.vaultRow !== row) return false;
        if (user !== ALL && m.user !== user) return false;
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      }),
    [movements, division, row, user, from, to],
  );

  const columns: GridColDef<Movement>[] = [
    {
      field: 'transaction',
      headerName: 'Transaction',
      width: 118,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    {
      field: 'reference',
      headerName: 'Reference',
      width: 148,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 128,
      renderCell: (p) => <Chip label={p.value as string} size="small" variant="outlined" />,
    },
    { field: 'origin', headerName: 'Origin', flex: 1, minWidth: 180 },
    { field: 'destination', headerName: 'Destination', flex: 1, minWidth: 180 },
    { field: 'user', headerName: 'User', width: 130 },
    { field: 'division', headerName: 'Division', width: 180 },
    {
      field: 'at',
      headerName: 'Date and time',
      width: 160,
      renderCell: (p) => (
        <span style={{ fontFamily: mono }}>
          {format(new Date(p.value as string), 'yyyy-MM-dd HH:mm')}
        </span>
      ),
    },
    {
      field: 'dueBack',
      headerName: 'Due back',
      width: 118,
      renderCell: (p) => (
        <span style={{ fontFamily: mono }}>{(p.value as string | null) ?? '—'}</span>
      ),
    },
  ];

  const issue = () => {
    const entry = entries.find((e) => e.reference === reference.trim().toUpperCase());
    if (!entry) {
      notify('That reference is not in the index. Check the reference and issue again.', 'error');
      return;
    }
    if (!mayIssue) {
      notify('A Reader may not issue files. Switch role to Clerk or above.', 'error');
      return;
    }
    const movement = issueFile({
      reference: entry.reference,
      recipient,
      division: recipientDivision,
      destination,
      dueBack,
    });
    setIssueSlip(movement);
    setReturnSlip(null);
    notify(`Issued ${entry.reference} to ${recipient}. Receipt ${movement.transaction} raised.`, 'success');
  };

  const scanReturn = () => {
    if (!issueSlip) return;
    const movement = returnFile(issueSlip.transaction);
    if (!movement) return;
    setReturnSlip(movement);
    notify(`Returned ${movement.reference}. Receipt ${movement.transaction} raised.`, 'success');
  };

  const history = useMemo(
    () => movements.filter((m) => m.reference === reference.trim().toUpperCase()).slice(0, 6),
    [movements, reference],
  );

  return (
    <Box>
      <PageHeader
        moduleId="tracking"
        title="Tracking & circulation"
        intro="Every movement is written with its origin, destination, user, date and time. Issue and return each raise a printable receipt."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Issue a file"
            elements={[18]}
            description="Scan the file at the counter, name the recipient and set the due-back date. The receipt is raised on issue."
          >
            {!mayIssue && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                A Reader may not issue or receive files. Switch the role in the top bar to Clerk,
                Senior clerk or Administrator.
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Reference"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                InputProps={{ sx: { fontFamily: mono } }}
              />
              <TextField
                fullWidth
                select
                label="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                {['T. van Wyk', 'M. Dlamini', 'L. Botha', 'P. Sithole', 'K. Naidoo'].map((name) => (
                  <MenuItem key={name} value={name} sx={{ fontSize: '0.8125rem' }}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Division"
                value={recipientDivision}
                onChange={(e) => setRecipientDivision(e.target.value as Division)}
              >
                {divisions.map((name) => (
                  <MenuItem key={name} value={name} sx={{ fontSize: '0.8125rem' }}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <TextField
                fullWidth
                type="date"
                label="Due back"
                value={dueBack}
                onChange={(e) => setDueBack(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="secondary" onClick={issue} disabled={!mayIssue}>
                  Issue file &amp; print receipt
                </Button>
                <Button variant="outlined" onClick={scanReturn} disabled={!issueSlip || !mayIssue}>
                  Scan the return
                </Button>
              </Stack>
              {!issueSlip && (
                <Typography variant="caption" color="text.secondary">
                  Issue a file first. The return slip stays empty until the return is scanned.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SectionCard
                title="Issue receipt"
                elements={[18]}
                action={
                  <Button
                    size="small"
                    startIcon={<PrintOutlinedIcon />}
                    disabled={!issueSlip}
                    onClick={() => printRegion(issueRef.current)}
                  >
                    Print
                  </Button>
                }
              >
                <TransactionReceipt
                  ref={issueRef}
                  movement={issueSlip}
                  kind="Issue"
                  emptyInstruction="Issue a file to raise the receipt. It carries the transaction barcode, the item, the recipient, both timestamps and the due-back date."
                />
              </SectionCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <SectionCard
                title="Return receipt"
                elements={[18]}
                action={
                  <Button
                    size="small"
                    startIcon={<PrintOutlinedIcon />}
                    disabled={!returnSlip}
                    onClick={() => printRegion(returnRef.current)}
                  >
                    Print
                  </Button>
                }
              >
                <TransactionReceipt
                  ref={returnRef}
                  movement={returnSlip}
                  kind="Return"
                  emptyInstruction="Scan the return to raise this receipt. It stays empty until the file is back at the counter."
                />
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Movement register"
            elements={[9]}
            description={`${filtered.length.toLocaleString('en-ZA')} of ${movements.length.toLocaleString('en-ZA')} movements match the filters.`}
          >
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Division"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                >
                  <MenuItem value={ALL} sx={{ fontSize: '0.8125rem' }}>
                    All divisions
                  </MenuItem>
                  {divisions.map((d) => (
                    <MenuItem key={d} value={d} sx={{ fontSize: '0.8125rem' }}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Vault row"
                  value={row}
                  onChange={(e) => setRow(e.target.value)}
                >
                  <MenuItem value={ALL} sx={{ fontSize: '0.8125rem' }}>
                    All rows
                  </MenuItem>
                  {vaultRows.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: '0.8125rem' }}>
                      Row {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="User"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                >
                  <MenuItem value={ALL} sx={{ fontSize: '0.8125rem' }}>
                    All users
                  </MenuItem>
                  {userNames.map((u) => (
                    <MenuItem key={u} value={u} sx={{ fontSize: '0.8125rem' }}>
                      {u}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Box sx={{ height: 480, width: '100%' }}>
              <DataGrid
                rows={filtered}
                columns={columns}
                density="compact"
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                pageSizeOptions={[10, 25, 50]}
                slotProps={{
                  noRowsOverlay: { sx: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                }}
                localeText={{
                  noRowsLabel:
                    'No movements match these filters. Widen the date range or clear the division filter.',
                }}
                sx={{ border: 'none', fontSize: '0.8125rem' }}
              />
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="History for this reference"
            elements={[9]}
            description={`Every movement recorded against ${reference || 'the reference above'}.`}
          >
            <MovementTimeline
              movements={history}
              emptyInstruction="No movements recorded against that reference yet. Issue the file above and the first movement appears here."
            />
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
