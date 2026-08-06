import {
  Alert,
  Box,
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
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import {
  exitHandback,
  fieldMappings,
  migrationRun,
  migrationStages,
  reconciliation,
} from '../data/migration';
import { hairline, mono, teal } from '../theme';

const stateColour: Record<string, 'success' | 'warning' | 'default'> = {
  Complete: 'success',
  Running: 'warning',
  Queued: 'default',
};

export function Migration() {
  return (
    <Box>
      <PageHeader
        moduleId="migration"
        title="Data migration & exit"
        intro="All SABC data in Document Warehouse moves to the new index: entries, boxes, locations, movement history and scanned images. The same tooling hands the data back to SABC on exit."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Source rows"
            value={reconciliation.sourceRows.toLocaleString('en-ZA')}
            detail="Counted in the Document Warehouse SQL Server database before extraction."
            icon={<StorageOutlinedIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Rows loaded"
            value={reconciliation.loadedRows.toLocaleString('en-ZA')}
            detail="Counted in the target index after the load."
            tone="teal"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Variance"
            value={String(reconciliation.variance)}
            detail={`Reconciled by ${reconciliation.checkedBy} on ${reconciliation.checkedAt.slice(0, 10)}.`}
            tone="teal"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Image exceptions"
            value={reconciliation.imageExceptions.toLocaleString('en-ZA')}
            detail="Listed with their legacy doc_ref for re-scanning at Radio Park."
            tone="alert"
          />
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title={`Migration run ${migrationRun.id}`}
            description={`${migrationRun.source} → ${migrationRun.target}. Started ${migrationRun.started.replace('T', ' ')} by ${migrationRun.operator}.`}
          >
            <Stack spacing={2.5}>
              {migrationStages.map((stage) => (
                <Box key={stage.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2">{stage.label}</Typography>
                      <Chip
                        label={stage.state}
                        size="small"
                        color={stateColour[stage.state]}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }} color="text.secondary">
                      {stage.rows}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stage.progress}
                    color={stage.state === 'Complete' ? 'success' : 'warning'}
                    aria-label={`${stage.label}: ${stage.progress} per cent`}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {stage.detail}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Alert severity="info" sx={{ mt: 2.5 }}>
              {migrationRun.window}
            </Alert>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <SectionCard
              title="Reconciliation"
              description="Counts are compared row for row. The run is not signed off while a variance stands."
            >
              <Table size="small">
                <TableBody>
                  {[
                    ['Source rows', reconciliation.sourceRows.toLocaleString('en-ZA')],
                    ['Rows loaded', reconciliation.loadedRows.toLocaleString('en-ZA')],
                    ['Variance', String(reconciliation.variance)],
                    ['Image exceptions', reconciliation.imageExceptions.toLocaleString('en-ZA')],
                    ['Checked by', reconciliation.checkedBy],
                    ['Checked at', reconciliation.checkedAt.replace('T', ' ')],
                  ].map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell sx={{ border: 0, pl: 0, width: 160 }}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          border: 0,
                          fontFamily: mono,
                          fontWeight: 600,
                          color: label === 'Variance' ? teal : 'inherit',
                        }}
                      >
                        {value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {reconciliation.exceptionNote}
              </Typography>
            </SectionCard>

            <SectionCard
              title="Exit & data handback"
              description="What SABC receives if the contract ends. The data and the licence stay with SABC."
            >
              <Stack spacing={1.25}>
                {exitHandback.map((item) => (
                  <Box key={item.id} sx={{ border: `1px solid ${hairline}`, borderRadius: 1, p: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Chip label={item.format} size="small" variant="outlined" sx={{ fontFamily: mono }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {item.detail}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <SectionCard
            title="Document Warehouse → VaultLine field mapping"
            description="Every source field, where it lands, how it is transformed and whether it verified."
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 860 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Source field</TableCell>
                    <TableCell>Target field</TableCell>
                    <TableCell>Transform</TableCell>
                    <TableCell align="right">Rows</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fieldMappings.map((mapping) => (
                    <TableRow key={mapping.source} hover>
                      <TableCell sx={{ fontFamily: mono, whiteSpace: 'nowrap' }}>
                        {mapping.source}
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, whiteSpace: 'nowrap' }}>
                        {mapping.target}
                      </TableCell>
                      <TableCell>{mapping.transform}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: mono, whiteSpace: 'nowrap' }}>
                        {mapping.rows}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={mapping.status}
                          size="small"
                          variant="outlined"
                          color={mapping.status === 'Verified' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
