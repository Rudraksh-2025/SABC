import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ScannerOutlinedIcon from '@mui/icons-material/ScannerOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { Barcode } from '../components/Barcode';
import { useVault } from '../context/VaultStore';
import { seriesCatalogue } from '../data/filePlans';
import {
  classifications,
  divisions,
  documentTypes,
  retentionSchedules,
  subTypes,
} from '../data/lookups';
import { DUPLICATE_TARGET } from '../data/entries';
import { can } from '../data/users';
import type { Classification, Division, IndexEntry } from '../types';
import { hairline, mono, teal, alert as alertRed } from '../theme';

interface FormState {
  title: string;
  seriesCode: string;
  documentType: string;
  subType: string;
  division: Division;
  classification: Classification;
  boxBarcode: string;
  locationBarcode: string;
  retentionCode: string;
  pages: string;
}

const initialForm: FormState = {
  title: '',
  seriesCode: '9/1/3',
  documentType: 'Minutes',
  subType: 'Board meeting',
  division: 'Company Secretariat',
  classification: 'Confidential',
  boxBarcode: 'BOX-ARC-00412',
  locationBarcode: 'VLT-A-R12-S03',
  retentionCode: 'RS-PERM',
  pages: '62',
};

export function Capture() {
  const { role, entries, fields, captureEntry, notify, nextReference, referenceExists, logAudit } =
    useVault();

  const [form, setForm] = useState<FormState>(initialForm);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [attachment, setAttachment] = useState<string | null>(null);
  const [replaceWarning, setReplaceWarning] = useState(false);
  const [scanProgress, setScanProgress] = useState<number | null>(null);
  const [saved, setSaved] = useState<IndexEntry | null>(null);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [manualReference, setManualReference] = useState('DOC-2025-118440');
  const [manualError, setManualError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const mayCapture = can(role, 'capture');
  const series = seriesCatalogue.find((s) => s.code === form.seriesCode) ?? seriesCatalogue[0];
  const availableSubTypes = subTypes[form.documentType] ?? ['Not applicable'];

  const duplicateFlagged = useMemo(
    () => form.seriesCode === DUPLICATE_TARGET.seriesCode && !duplicateDismissed,
    [form.seriesCode, duplicateDismissed],
  );

  const applicableFields = fields.filter(
    (field) => field.appliesTo === 'All series' || form.seriesCode.startsWith(field.appliesTo.replace('/*', '')),
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      if (key === 'documentType') {
        const next = subTypes[value as string]?.[0] ?? 'Not applicable';
        return { ...prev, documentType: value as string, subType: next };
      }
      return { ...prev, [key]: value };
    });
    setSaved(null);
  };

  const attach = (name: string, source: string) => {
    if (attachment) {
      setReplaceWarning(true);
      logAudit({
        action: 'Attachment replaced',
        object: name,
        result: 'Warning',
        detail: `Previous document ${attachment} replaced from ${source}. One document per entry is enforced.`,
      });
    }
    setAttachment(name);
  };

  const importFromScanner = () => {
    setScanProgress(0);
    let value = 0;
    const timer = window.setInterval(() => {
      value += 20;
      setScanProgress(value);
      if (value >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          setScanProgress(null);
          attach('SCN-2026-0813.pdf', 'Scanner 02, Records Room');
          notify('Imported from Scanner 02, Records Room. One document attached.', 'success');
        }, 250);
      }
    }, 260);
  };

  const uploadDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    attach(file.name, 'Upload');
    notify(`Uploaded ${file.name}. One document attached to this entry.`, 'success');
    event.target.value = '';
  };

  const bulkBoxUpload = () => {
    logAudit({
      action: 'Box uploaded',
      object: form.boxBarcode,
      result: 'Success',
      detail: `Bulk box upload registered against ${form.boxBarcode} at ${form.locationBarcode}.`,
    });
    notify(`Uploaded box ${form.boxBarcode}. 37 items registered against the box.`, 'success');
  };

  const tryManualReference = () => {
    if (referenceExists(manualReference)) {
      setManualError(
        `${manualReference} is already in use. Reference numbers are system-generated and never reused.`,
      );
      logAudit({
        action: 'Reference rejected',
        object: manualReference,
        result: 'Blocked',
        detail: 'Duplicate reference number. The entry was not created.',
      });
      notify(`${manualReference} is already in use. The entry was not created.`, 'error');
      return;
    }
    setManualError(null);
    notify(`${manualReference} is free, but capture still uses the generated reference.`, 'info');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      notify('Give the entry a title before saving it.', 'error');
      return;
    }
    if (!attachment) {
      notify('Attach one document — import from the scanner or upload a file.', 'error');
      return;
    }
    const entry = captureEntry({
      title: form.title.trim(),
      seriesCode: form.seriesCode,
      seriesLabel: series.label,
      documentType: form.documentType,
      subType: form.subType,
      division: form.division,
      classification: form.classification,
      filePlanId: series.planId,
      boxBarcode: form.boxBarcode,
      locationBarcode: form.locationBarcode,
      retentionCode: form.retentionCode,
      documentName: attachment,
      pages: Number.parseInt(form.pages, 10) || 1,
      custom: customValues,
    });
    setSaved(entry);
    notify(`Saved ${entry.reference} and generated its barcode.`, 'success');
  };

  if (!mayCapture) {
    return (
      <Box>
        <PageHeader
          moduleId="capture"
          title="Capture & indexing"
          intro="Index a new entry against an approved series, attach one document and generate its barcode."
        />
        <SectionCard
          title="Capture is not available to a Reader"
          description="Switch the role in the top bar to Clerk, Senior clerk or Administrator to capture an entry."
        >
          <Alert severity="info" icon={<LockOutlinedIcon />}>
            A Reader may search the index and open linked documents. Capture, amendment, issue and
            deletion are withheld. This is the same permission set shown in the role matrix under
            security & user administration.
          </Alert>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button component={RouterLink} to="/search" variant="outlined">
              Search the index instead
            </Button>
            <Button component={RouterLink} to="/users" variant="outlined">
              Open the role permission matrix
            </Button>
          </Stack>
        </SectionCard>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        moduleId="capture"
        title="Capture & indexing"
        intro="Index a new entry against an approved series, attach exactly one document and generate the barcode on submit. Duplicate candidates are flagged before the entry is saved."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="New index entry"
            description="The reference number is generated by the system and cannot be typed. The barcode is produced when the entry is saved."
          >
            <Box component="form" onSubmit={submit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference number"
                    value={saved ? saved.reference : nextReference()}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: mono },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Chip label="Generated" size="small" color="success" variant="outlined" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="System-generated and never reused."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Title"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="Board meeting minutes — quarter 1"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Series code"
                    value={form.seriesCode}
                    onChange={(e) => {
                      update('seriesCode', e.target.value);
                      setDuplicateDismissed(false);
                    }}
                  >
                    {seriesCatalogue.map((option) => (
                      <MenuItem key={option.code} value={option.code} sx={{ fontSize: '0.8125rem' }}>
                        <span style={{ fontFamily: mono, marginRight: 8 }}>{option.code}</span>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="File plan"
                    value={
                      series.planId === 'FP-2023'
                        ? 'Broadcast Operations File Plan 2023'
                        : 'Corporate File Plan 2019'
                    }
                    InputProps={{ readOnly: true }}
                    helperText="Set by the series code."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Document type"
                    value={form.documentType}
                    onChange={(e) => update('documentType', e.target.value)}
                  >
                    {documentTypes.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.8125rem' }}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Sub-document type"
                    value={form.subType}
                    onChange={(e) => update('subType', e.target.value)}
                  >
                    {availableSubTypes.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.8125rem' }}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Division"
                    value={form.division}
                    onChange={(e) => update('division', e.target.value as Division)}
                  >
                    {divisions.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.8125rem' }}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Classification"
                    value={form.classification}
                    onChange={(e) => update('classification', e.target.value as Classification)}
                    helperText="Restricted and Key Point follow the National Key Points Act."
                  >
                    {classifications.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.8125rem' }}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Box barcode"
                    value={form.boxBarcode}
                    onChange={(e) => update('boxBarcode', e.target.value)}
                    InputProps={{ sx: { fontFamily: mono } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location barcode"
                    value={form.locationBarcode}
                    onChange={(e) => update('locationBarcode', e.target.value)}
                    InputProps={{ sx: { fontFamily: mono } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Retention schedule"
                    value={form.retentionCode}
                    onChange={(e) => update('retentionCode', e.target.value)}
                  >
                    {retentionSchedules.map((option) => (
                      <MenuItem key={option.code} value={option.code} sx={{ fontSize: '0.8125rem' }}>
                        <span style={{ fontFamily: mono, marginRight: 8 }}>{option.code}</span>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pages"
                    type="number"
                    value={form.pages}
                    onChange={(e) => update('pages', e.target.value)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                {applicableFields.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }}>
                      <Typography variant="overline" color="text.secondary">
                        Fields added by an administrator
                      </Typography>
                    </Divider>
                    <Grid container spacing={2}>
                      {applicableFields.map((field) => (
                        <Grid item xs={12} sm={6} key={field.id}>
                          <TextField
                            fullWidth
                            required={field.required}
                            label={field.label}
                            type={
                              field.type === 'Date' ? 'date' : field.type === 'Number' ? 'number' : 'text'
                            }
                            InputLabelProps={field.type === 'Date' ? { shrink: true } : undefined}
                            value={customValues[field.id] ?? ''}
                            onChange={(e) =>
                              setCustomValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                            }
                            helperText={`Added on ${field.publishedAt.slice(0, 10)} by ${field.publishedBy}. Applies to ${field.appliesTo}.`}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 3 }}
                alignItems={{ sm: 'center' }}
              >
                <Button type="submit" variant="contained" color="secondary" size="large">
                  Save entry &amp; generate barcode
                </Button>
                <Typography variant="caption" color="text.secondary">
                  The barcode is generated on submit. Nothing is printed before the entry exists.
                </Typography>
              </Stack>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <SectionCard
              title="Barcode"
              description="The barcode encodes the series code with both the document type and the sub-document type."
            >
              {saved ? (
                <Box>
                  <Barcode value={saved.reference} height={56} />
                  <Table size="small" sx={{ mt: 2 }}>
                    <TableBody>
                      {[
                        ['Symbology', 'Code 128B'],
                        ['Series', `${saved.seriesCode} ${saved.seriesLabel}`],
                        ['Document type', saved.documentType],
                        ['Sub-document type', saved.subType],
                        ['Reference', saved.reference],
                      ].map(([label, value]) => (
                        <TableRow key={label}>
                          <TableCell sx={{ border: 0, pl: 0, width: 150 }}>
                            <Typography variant="caption" color="text.secondary">
                              {label}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: 0, fontFamily: mono }}>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button component={RouterLink} to="/barcodes" variant="outlined" size="small">
                      Print the label
                    </Button>
                    <Button component={RouterLink} to="/search" size="small">
                      Find it in the index
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: `1px dashed ${hairline}`,
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#FBF9F3',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Complete the entry and choose Save entry &amp; generate barcode. The barcode
                    appears here with its symbology, series, type and sub-type.
                  </Typography>
                </Box>
              )}
            </SectionCard>

            <SectionCard
              title="Document"
              description="One document per entry. Import from the scanner or upload a file; a box can be uploaded in bulk."
            >
              {attachment ? (
                <Alert severity="success" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.8125rem' }}>{attachment}</Typography>
                  <Typography variant="caption">
                    One document is attached. Replacing it is written to the audit log.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  Attach one document. An entry carries exactly one document — importing a second
                  replaces the first and the replacement is logged.
                </Alert>
              )}

              {replaceWarning && (
                <Alert severity="warning" sx={{ mb: 1.5 }} onClose={() => setReplaceWarning(false)}>
                  The previous document was replaced. The replacement is on the audit log with your
                  user name, workstation and timestamp.
                </Alert>
              )}

              {scanProgress !== null && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Scanner 02, Records Room — importing page {Math.ceil(scanProgress / 20)} of 5
                  </Typography>
                  <LinearProgress variant="determinate" value={scanProgress} sx={{ mt: 0.5 }} />
                </Box>
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ScannerOutlinedIcon />}
                  onClick={importFromScanner}
                  disabled={scanProgress !== null}
                >
                  Import from scanner
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileOutlinedIcon />}
                  onClick={() => fileInput.current?.click()}
                >
                  Upload file
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Inventory2OutlinedIcon />}
                  onClick={bulkBoxUpload}
                >
                  Upload box
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  onChange={uploadDocument}
                  aria-label="Upload one document"
                />
              </Stack>
            </SectionCard>

            <SectionCard
              title="Duplicate check"
              description="Every capture is checked on checksum and series before it is saved."
            >
              {duplicateFlagged ? (
                <Alert severity="warning" icon={false} sx={{ border: `1px solid ${alertRed}` }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Possible duplicate of{' '}
                    <Box component="span" sx={{ fontFamily: mono }}>
                      {DUPLICATE_TARGET.reference}
                    </Box>
                  </Typography>
                  <Typography variant="body2">
                    Checksum and series {DUPLICATE_TARGET.seriesCode} both match. Compare the two
                    entries before saving, or mark this capture as a distinct record.
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button size="small" variant="outlined" onClick={() => setCompareOpen(true)}>
                      Compare
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setDuplicateDismissed(true);
                        logAudit({
                          action: 'Duplicate cleared',
                          object: nextReference(),
                          result: 'Success',
                          detail: `Clerk confirmed the capture is not a duplicate of ${DUPLICATE_TARGET.reference}.`,
                        });
                        notify('Marked as not a duplicate. The decision is on the audit log.', 'info');
                      }}
                    >
                      Not a duplicate
                    </Button>
                  </Stack>
                </Alert>
              ) : (
                <Alert severity="success" sx={{ borderColor: teal }}>
                  No checksum or series match found against the {entries.length.toLocaleString('en-ZA')}{' '}
                  entries in the working set. Select series 9/1/3 to see a flagged match.
                </Alert>
              )}
            </SectionCard>

            <SectionCard
              title="Reference numbers are unique"
              description="Try to reuse a reference that already exists. The system refuses it."
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  label="Reference to try"
                  value={manualReference}
                  onChange={(e) => {
                    setManualReference(e.target.value.toUpperCase());
                    setManualError(null);
                  }}
                  InputProps={{ sx: { fontFamily: mono } }}
                  error={Boolean(manualError)}
                />
                <Button variant="outlined" onClick={tryManualReference} sx={{ flexShrink: 0 }}>
                  Try this reference
                </Button>
              </Stack>
              {manualError && (
                <Alert severity="error" sx={{ mt: 1.5 }}>
                  {manualError}
                </Alert>
              )}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compare with {DUPLICATE_TARGET.reference}</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>This capture</TableCell>
                <TableCell>{DUPLICATE_TARGET.reference}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Title', form.title || '(not yet entered)', DUPLICATE_TARGET.title],
                ['Series', form.seriesCode, DUPLICATE_TARGET.seriesCode],
                ['Document type', form.documentType, DUPLICATE_TARGET.documentType],
                ['Sub-document type', form.subType, DUPLICATE_TARGET.subType],
                ['Box', form.boxBarcode, DUPLICATE_TARGET.boxBarcode],
                ['Location', form.locationBarcode, DUPLICATE_TARGET.locationBarcode],
                ['Checksum', DUPLICATE_TARGET.checksum, DUPLICATE_TARGET.checksum],
                ['Captured', 'Today', DUPLICATE_TARGET.capturedAt.slice(0, 10)],
              ].map(([label, left, right]) => (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  <TableCell sx={{ fontFamily: mono, backgroundColor: left === right ? '#FDF6E3' : undefined }}>
                    {left}
                  </TableCell>
                  <TableCell sx={{ fontFamily: mono, backgroundColor: left === right ? '#FDF6E3' : undefined }}>
                    {right}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareOpen(false)}>Close the comparison</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setDuplicateDismissed(true);
              setCompareOpen(false);
              notify('Marked as not a duplicate. The decision is on the audit log.', 'info');
              logAudit({
                action: 'Duplicate cleared',
                object: nextReference(),
                result: 'Success',
                detail: `Compared against ${DUPLICATE_TARGET.reference} and confirmed as a distinct record.`,
              });
            }}
          >
            Not a duplicate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
