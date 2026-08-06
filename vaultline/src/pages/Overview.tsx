import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import InventoryOutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OutboxOutlinedIcon from '@mui/icons-material/OutboxOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/SectionCard';
import { PageHeader } from '../components/PageHeader';
import { useVault } from '../context/VaultStore';
import { HOLDINGS, captureVolume, retrievalPerformance } from '../data/lookups';
import { duplicateQueue } from '../data/auditLog';
import { chartGold, chartTeal, hairline, mono, teal, alert } from '../theme';

function CaptureChart() {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...captureVolume.flatMap((m) => [m.captured, m.scanned]));
  const height = 190;
  const plot = 148;

  if (showTable) {
    return (
      <>
        <Table size="small" sx={{ mb: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align="right">Entries captured</TableCell>
              <TableCell align="right">Images scanned</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {captureVolume.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell align="right" sx={{ fontFamily: mono }}>
                  {row.captured.toLocaleString('en-ZA')}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: mono }}>
                  {row.scanned.toLocaleString('en-ZA')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button size="small" onClick={() => setShowTable(false)}>
          Show the chart
        </Button>
      </>
    );
  }

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
        {[
          { label: 'Entries captured', colour: chartGold },
          { label: 'Images scanned', colour: chartTeal },
        ].map((series) => (
          <Stack key={series.label} direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: series.colour }}
            />
            <Typography variant="caption" color="text.secondary">
              {series.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 660 ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label="Entries captured and images scanned per month, March to August 2026"
          style={{ minWidth: 420 }}
        >
          {[0, 0.5, 1].map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={660}
              y1={plot - tick * plot}
              y2={plot - tick * plot}
              stroke={hairline}
              strokeWidth={1}
            />
          ))}
          {captureVolume.map((month, index) => {
            const slot = 660 / captureVolume.length;
            const x = index * slot;
            const barWidth = 26;
            const capturedH = (month.captured / max) * plot;
            const scannedH = (month.scanned / max) * plot;
            return (
              <g key={month.month}>
                <rect
                  x={x + slot / 2 - barWidth - 1}
                  y={plot - capturedH}
                  width={barWidth}
                  height={capturedH}
                  rx={4}
                  fill={chartGold}
                >
                  <title>{`${month.month}: ${month.captured.toLocaleString('en-ZA')} entries captured`}</title>
                </rect>
                <rect
                  x={x + slot / 2 + 1}
                  y={plot - scannedH}
                  width={barWidth}
                  height={scannedH}
                  rx={4}
                  fill={chartTeal}
                >
                  <title>{`${month.month}: ${month.scanned.toLocaleString('en-ZA')} images scanned`}</title>
                </rect>
                <text
                  x={x + slot / 2}
                  y={plot - capturedH - 7}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily={mono}
                  fill="#5A6274"
                >
                  {month.captured.toLocaleString('en-ZA')}
                </text>
                <text
                  x={x + slot / 2}
                  y={height - 14}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#5A6274"
                >
                  {month.month}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      <Button size="small" onClick={() => setShowTable(true)} sx={{ mt: 0.5 }}>
        Show the figures as a table
      </Button>
    </>
  );
}

export function Overview() {
  const { movements, deletions, users, entries } = useVault();

  const movementsToday = useMemo(
    () => movements.filter((m) => isToday(new Date(m.at))).slice(0, 8),
    [movements],
  );
  const recentMovements = movementsToday.length > 0 ? movementsToday : movements.slice(0, 8);
  const pendingUsers = users.filter((u) => u.status === 'Awaiting authorisation').length;
  const lockedUsers = users.filter((u) => u.status === 'Locked').length;

  const queues = [
    {
      label: 'Deletion requests',
      count: deletions.length,
      detail: 'Approve or decline. Approval removes the entry and writes an audit line.',
      to: '/audit',
    },
    {
      label: 'Users awaiting authorisation',
      count: pendingUsers + lockedUsers,
      detail: `${pendingUsers} awaiting authorisation, ${lockedUsers} locked after failed sign-ins.`,
      to: '/users',
    },
    {
      label: 'Duplicates flagged',
      count: duplicateQueue.length,
      detail: 'Checksum and series matches waiting for a compare decision.',
      to: '/capture',
    },
  ];

  return (
    <Box>
      <PageHeader
        moduleId="overview"
        title="Vault overview"
        intro="Radio Park vault, Auckland Park. Holdings, circulation and the queues that need an administrator today."
        action={
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/capture" variant="contained" color="secondary">
              Capture an entry
            </Button>
            <Button component={RouterLink} to="/checklist" variant="outlined">
              Open the demo checklist
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Indexed entries"
            value={HOLDINGS.indexedEntriesExact.toLocaleString('en-ZA')}
            detail={`Across two active file plans. ${entries.length} loaded in this session's working set.`}
            icon={<DescriptionOutlinedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Archive boxes"
            value={HOLDINGS.archiveBoxes.toLocaleString('en-ZA')}
            detail={`Shelved across ${HOLDINGS.vaultLocations.toLocaleString('en-ZA')} numbered vault locations.`}
            icon={<InventoryOutlinedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Files on loan"
            value={String(HOLDINGS.filesOnLoan)}
            detail={`${HOLDINGS.overdueLoans} are past their due-back date.`}
            icon={<OutboxOutlinedIcon fontSize="small" />}
            tone="gold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Duplicates flagged"
            value={String(HOLDINGS.duplicatesFlagged)}
            detail="Checksum or series matches awaiting a compare decision."
            icon={<ContentCopyOutlinedIcon fontSize="small" />}
            tone="alert"
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Movements today"
            description="Every issue, return and transfer raised at the records counter today."
            action={
              <Button component={RouterLink} to="/tracking" size="small">
                Open the movement register
              </Button>
            }
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 620 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentMovements.map((movement) => (
                    <TableRow key={movement.id} hover>
                      <TableCell sx={{ fontFamily: mono }}>{movement.transaction}</TableCell>
                      <TableCell sx={{ fontFamily: mono }}>{movement.reference}</TableCell>
                      <TableCell>
                        <Chip label={movement.action} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{movement.destination}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell sx={{ fontFamily: mono }}>
                        {format(new Date(movement.at), 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Needs an administrator"
            description="Three queues an SABC administrator works through. Each opens where the decision is made."
          >
            <Stack spacing={1.25}>
              {queues.map((queue) => (
                <Box
                  key={queue.label}
                  component={RouterLink}
                  to={queue.to}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: `1px solid ${hairline}`,
                    borderRadius: 1,
                    p: 1.5,
                    '&:hover': { borderColor: 'primary.main', backgroundColor: '#FBF9F3' },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">{queue.label}</Typography>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: queue.count > 0 ? alert : teal,
                      }}
                    >
                      {queue.count}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {queue.detail}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Capture volume, six months"
            description="Entries indexed and images scanned per month. August 2026 is part-month."
          >
            <CaptureChart />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Retrieval performance"
            description="Measured against the service commitments in the tender response."
          >
            <Stack spacing={2}>
              {retrievalPerformance.map((meter) => (
                <Box key={meter.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{meter.label}</Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.8125rem', fontWeight: 600 }}>
                      {meter.value}
                      {meter.unit} <span style={{ color: '#5A6274' }}>/ {meter.target}% target</span>
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={meter.value}
                    color={meter.value >= meter.target ? 'success' : 'warning'}
                    aria-label={meter.label}
                  />
                </Box>
              ))}
              <Box sx={{ borderTop: `1px solid ${hairline}`, pt: 1.75 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">
                    Average restore time against the 4-hour commitment
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.8125rem', fontWeight: 600 }}>
                    2 h 08 m
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={53} color="success" />
                <Typography variant="caption" color="text.secondary">
                  Mean of the three evidenced restores: 2 h 40 m, 1 h 09 m and 2 h 36 m. Recovery
                  time objective is under 4 hours.
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
