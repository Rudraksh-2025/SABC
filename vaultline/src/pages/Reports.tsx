import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useVault } from '../context/VaultStore';
import {
  movementsByDivision,
  scheduledReports,
  standardReports,
} from '../data/reports';
import { lookupTables } from '../data/lookups';
import { seriesCatalogue } from '../data/filePlans';
import { can } from '../data/users';
import type { CustomField } from '../types';
import { chartGold, chartTeal, hairline, mono } from '../theme';

const PERIODS = ['Today', 'This week', 'This month', 'Last quarter', 'Financial year to date'];
const FORMATS = ['PDF', 'Excel', 'CSV'];

function MovementsChart() {
  const max = Math.max(...movementsByDivision.map((d) => d.issued));

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
        {[
          { label: 'Issued', colour: chartGold },
          { label: 'Returned', colour: chartTeal },
        ].map((series) => (
          <Stack key={series.label} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: series.colour }} />
            <Typography variant="caption" color="text.secondary">
              {series.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={1.25}>
        {movementsByDivision.map((row) => (
          <Box key={row.division}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
              <Typography variant="body2">{row.division}</Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }} color="text.secondary">
                {row.issued} issued · {row.returned} returned
              </Typography>
            </Stack>
            <Stack spacing="2px">
              <Box
                sx={{
                  height: 10,
                  width: `${(row.issued / max) * 100}%`,
                  backgroundColor: chartGold,
                  borderRadius: '0 4px 4px 0',
                }}
              />
              <Box
                sx={{
                  height: 10,
                  width: `${(row.returned / max) * 100}%`,
                  backgroundColor: chartTeal,
                  borderRadius: '0 4px 4px 0',
                }}
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function Reports() {
  const { role, fields, publishField, notify } = useVault();

  const [reportType, setReportType] = useState('Movements by division');
  const [period, setPeriod] = useState('This month');
  const [outputFormat, setOutputFormat] = useState('PDF');
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [recipients, setRecipients] = useState('records.manager@sabc.co.za');
  const [rendered, setRendered] = useState(true);

  const [fieldLabel, setFieldLabel] = useState('Rights expiry date');
  const [fieldType, setFieldType] = useState<CustomField['type']>('Date');
  const [fieldSeries, setFieldSeries] = useState('4/2/2');
  const [fieldRequired, setFieldRequired] = useState(false);

  const mayBuild = can(role, 'buildReports');
  const mayAddFields = role === 'Administrator';

  const runReport = () => {
    setRendered(true);
    notify(
      scheduleEmail
        ? `Scheduled ${reportType} as ${outputFormat} to ${recipients}.`
        : `Ran ${reportType} for ${period} and produced a ${outputFormat}.`,
      'success',
    );
  };

  const addField = () => {
    if (!fieldLabel.trim()) {
      notify('Give the field a name before publishing it.', 'error');
      return;
    }
    const field = publishField({
      label: fieldLabel.trim(),
      type: fieldType,
      appliesTo: fieldSeries,
      required: fieldRequired,
    });
    notify(
      `Published ${field.label}. It is on the capture form for series ${field.appliesTo} now.`,
      'success',
    );
  };

  return (
    <Box>
      <PageHeader
        moduleId="reports"
        title="Reporting & configuration"
        intro="Eight standard reports ship with the system. New reports and new index fields are configured by an SABC administrator, without a change request to the vendor."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Report builder"
            elements={[20, 24]}
            description="Choose the report, the period and the output. A report can be run now or scheduled by email."
          >
            {!mayBuild && (
              <Alert severity="warning" icon={<LockOutlinedIcon />} sx={{ mb: 2 }}>
                Report building is available to Senior clerk and Administrator. You are signed in as{' '}
                {role} and may read the rendered report below.
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Report type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={!mayBuild}
              >
                {standardReports.map((report) => (
                  <MenuItem key={report.id} value={report.name} sx={{ fontSize: '0.8125rem' }}>
                    {report.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={!mayBuild}
              >
                {PERIODS.map((p) => (
                  <MenuItem key={p} value={p} sx={{ fontSize: '0.8125rem' }}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Output format"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                disabled={!mayBuild}
              >
                {FORMATS.map((f) => (
                  <MenuItem key={f} value={f} sx={{ fontSize: '0.8125rem' }}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.checked)}
                    disabled={!mayBuild}
                  />
                }
                label={<Typography variant="body2">Send on a schedule by email</Typography>}
              />
              {scheduleEmail && (
                <TextField
                  fullWidth
                  label="Recipients"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  disabled={!mayBuild}
                  InputProps={{ sx: { fontFamily: mono } }}
                  helperText="Sent from the SABC mail relay on the schedule set below."
                />
              )}
              <Button variant="contained" color="secondary" onClick={runReport} disabled={!mayBuild}>
                {scheduleEmail ? 'Schedule this report' : 'Run this report'}
              </Button>
            </Stack>

            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1 }}>
              Reports already scheduled
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Report</TableCell>
                  <TableCell>Runs</TableCell>
                  <TableCell>Format</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledReports.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.report}</TableCell>
                    <TableCell>{row.frequency}</TableCell>
                    <TableCell sx={{ fontFamily: mono }}>{row.format}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title={rendered ? `${reportType} — ${period}` : 'No report rendered yet'}
            elements={[24]}
            description="Rendered output: a chart and the underlying figures, exactly as they appear in the PDF."
          >
            {rendered ? (
              <>
                <MovementsChart />
                <Table size="small" sx={{ mt: 3 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Division</TableCell>
                      <TableCell align="right">Issued</TableCell>
                      <TableCell align="right">Returned</TableCell>
                      <TableCell align="right">Overdue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movementsByDivision.map((row) => (
                      <TableRow key={row.division}>
                        <TableCell>{row.division}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: mono }}>
                          {row.issued}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: mono }}>
                          {row.returned}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: mono, color: row.overdue > 0 ? 'error.main' : 'inherit' }}
                        >
                          {row.overdue}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontFamily: mono, fontWeight: 700 }}>
                        {movementsByDivision.reduce((sum, r) => sum + r.issued, 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: mono, fontWeight: 700 }}>
                        {movementsByDivision.reduce((sum, r) => sum + r.returned, 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: mono, fontWeight: 700 }}>
                        {movementsByDivision.reduce((sum, r) => sum + r.overdue, 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <Alert severity="info">
                Choose a report type and period, then run the report. The rendered output appears
                here.
              </Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Standard report library"
            elements={[24]}
            description="Shipped with the system and available to Senior clerk and Administrator."
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>
                    <TableCell>What it shows</TableCell>
                    <TableCell>Formats</TableCell>
                    <TableCell>Last run</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {standardReports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell sx={{ fontFamily: mono, whiteSpace: 'nowrap' }}>
                        {report.formats.join(' · ')}
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, whiteSpace: 'nowrap' }}>
                        {report.lastRun.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <SectionCard
              title="Add a field"
              elements={[10]}
              description="An administrator adds an index field and publishes it. No vendor change request and no code release."
            >
              {mayAddFields ? (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Field name"
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as CustomField['type'])}
                  >
                    {(['Text', 'Number', 'Date', 'List'] as const).map((t) => (
                      <MenuItem key={t} value={t} sx={{ fontSize: '0.8125rem' }}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Applies to series"
                    value={fieldSeries}
                    onChange={(e) => setFieldSeries(e.target.value)}
                  >
                    <MenuItem value="All series" sx={{ fontSize: '0.8125rem' }}>
                      All series
                    </MenuItem>
                    {seriesCatalogue.map((s) => (
                      <MenuItem key={s.code} value={s.code} sx={{ fontSize: '0.8125rem' }}>
                        <span style={{ fontFamily: mono, marginRight: 6 }}>{s.code}</span>
                        {s.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldRequired}
                        onChange={(e) => setFieldRequired(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2">Required at capture</Typography>}
                  />
                  <Button variant="contained" color="secondary" onClick={addField}>
                    Publish field to the capture form
                  </Button>
                  <Button component={RouterLink} to="/capture" size="small">
                    Open the capture form to see it
                  </Button>
                </Stack>
              ) : (
                <Alert severity="info" icon={<LockOutlinedIcon />}>
                  The field builder is available to an Administrator. Switch the role in the top bar
                  to add a field and publish it to the capture form.
                </Alert>
              )}

              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1 }}>
                Fields published so far
              </Typography>
              <Stack spacing={1}>
                {fields.map((field) => (
                  <Box key={field.id} sx={{ border: `1px solid ${hairline}`, borderRadius: 1, p: 1.25 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{field.label}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Chip label={field.type} size="small" variant="outlined" />
                        {field.required && <Chip label="Required" size="small" color="warning" variant="outlined" />}
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                      {field.appliesTo} · published {field.publishedAt.slice(0, 10)} by {field.publishedBy}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>

            <SectionCard
              title="Lookup tables"
              elements={[11]}
              description="Indexing values are maintained by SABC in lookup tables. Changing a value does not need a code release."
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Table</TableCell>
                    <TableCell align="right">Values</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lookupTables.map((table) => (
                    <TableRow key={table.id} hover>
                      <TableCell>{table.name}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: mono }}>
                        {table.values.toLocaleString('en-ZA')}
                      </TableCell>
                      <TableCell>{table.owner}</TableCell>
                      <TableCell sx={{ fontFamily: mono }}>{table.updated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
