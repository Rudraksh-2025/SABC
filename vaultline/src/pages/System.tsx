import {
  Alert,
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { continuity, licence, platform, restoreIncidents } from '../data/reports';
import { HOLDINGS } from '../data/lookups';
import { hairline, mono, teal } from '../theme';

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <Table size="small">
      <TableBody>
        {rows.map(([label, value]) => (
          <TableRow key={label}>
            <TableCell sx={{ border: 0, pl: 0, width: 190, verticalAlign: 'top' }}>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </TableCell>
            <TableCell sx={{ border: 0, fontSize: '0.8125rem' }}>{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function System() {
  return (
    <Box>
      <PageHeader
        moduleId="system"
        title="System, licensing & continuity"
        intro="The platform it runs on, what SABC is licensed to do with it, and how the service is backed up and recovered."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Concurrent users tested"
            value={String(HOLDINGS.concurrentSeats)}
            detail="Load tested against the full production index."
            icon={<DnsOutlinedIcon fontSize="small" />}
            tone="teal"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Named seats"
            value={String(HOLDINGS.namedSeats)}
            detail="Perpetual application licence. Not subscription-based."
            tone="gold"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Recovery point objective"
            value="15 min"
            detail="Transaction log backup every 15 minutes."
            icon={<BackupOutlinedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Recovery time objective"
            value="< 4 h"
            detail="Longest evidenced restore to date is 2 h 40 m."
            tone="teal"
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Platform"
            description="Windows-based, multi-user and network ready. It runs on SABC infrastructure inside the SABC network."
          >
            <Rows
              rows={[
                ['Operating system', platform.os],
                ['Compute', platform.compute],
                ['Database', platform.database],
                ['Storage', platform.storage],
                ['Scanners', platform.scanners],
                ['Concurrency', platform.concurrency],
                ['Client desktops', platform.clients],
                ['Network', platform.network],
              ]}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Licence"
            description="Stated plainly so the panel can price it against the other bids."
          >
            <Rows
              rows={[
                ['Licence type', licence.type],
                ['Seats', licence.seats],
                ['Maintenance', licence.maintenance],
                ['Database licence', licence.database],
                ['On exit', licence.exit],
              ]}
            />
            <Alert severity="info" sx={{ mt: 1.5, borderColor: teal }}>
              {licence.subscription}
            </Alert>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Backup and recovery"
            description="The backup regime and the objectives it is designed to meet."
          >
            <Stack spacing={1.25}>
              {[
                ['Full backup', continuity.fullBackup],
                ['Transaction log', continuity.logBackup],
                ['Documents', continuity.documents],
                ['Recovery point objective', continuity.rpo],
                ['Recovery time objective', continuity.rto],
                ['Restore testing', continuity.testing],
              ].map(([label, value]) => (
                <Box key={label} sx={{ border: `1px solid ${hairline}`, borderRadius: 1, p: 1.25 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Restores performed"
            description="Two live incidents and one quarterly test. Each is evidenced and filed under series 3/1/7."
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 620 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Incident</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Restored in</TableCell>
                    <TableCell>Data loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {restoreIncidents.map((incident) => (
                    <TableRow key={incident.id} hover>
                      <TableCell sx={{ fontFamily: mono }}>{incident.id}</TableCell>
                      <TableCell sx={{ fontFamily: mono, whiteSpace: 'nowrap' }}>
                        {incident.date}
                      </TableCell>
                      <TableCell>{incident.event}</TableCell>
                      <TableCell>
                        <Chip
                          label={incident.restored}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontFamily: mono }}
                        />
                      </TableCell>
                      <TableCell>{incident.dataLoss}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Every restore listed came in under the four-hour recovery time objective. The mean is
              2 h 08 m.
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
