import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EastIcon from '@mui/icons-material/East';
import SouthIcon from '@mui/icons-material/South';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { Barcode } from '../components/Barcode';
import { LabelSheet, type LabelSpec } from '../components/LabelSheet';
import { printRegion } from '../components/print';
import { useVault } from '../context/VaultStore';
import { boxContents } from '../data/entries';
import { hairline, mono, teal } from '../theme';
import type { IndexEntry } from '../types';

const STOCKS = [
  { id: 'L7161', label: 'Avery L7161 — 18 per sheet, 63.5 × 46.6 mm', columns: 3, rows: 6 },
  { id: 'L7160', label: 'Avery L7160 — 21 per sheet, 63.5 × 38.1 mm', columns: 3, rows: 7 },
  { id: 'L7163', label: 'Avery L7163 — 14 per sheet, 99.1 × 38.1 mm', columns: 2, rows: 7 },
];

function ChainStep({
  step,
  title,
  value,
  caption,
  highlight,
}: {
  step: string;
  title: string;
  value: string;
  caption: string;
  highlight: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 220,
        border: '1px solid',
        borderColor: highlight ? teal : hairline,
        backgroundColor: highlight ? 'rgba(23,140,134,0.06)' : '#FFFFFF',
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography variant="overline" color="text.secondary">
        {step}
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Barcode value={value} height={40} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {caption}
      </Typography>
    </Box>
  );
}

export function Barcodes() {
  const { entries, notify, logAudit } = useVault();
  const [params, setParams] = useSearchParams();
  const scanned = params.get('scan') ?? '';
  const [scanValue, setScanValue] = useState(scanned || 'DOC-2026-004131');
  const [stock, setStock] = useState('L7161');
  const [margin, setMargin] = useState(8.7);
  const [printOpen, setPrintOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanned) setScanValue(scanned);
  }, [scanned]);

  const resolved: IndexEntry | null = useMemo(() => {
    const value = scanValue.trim().toUpperCase();
    if (!value) return null;
    return (
      entries.find(
        (e) =>
          e.reference.toUpperCase() === value ||
          e.boxBarcode.toUpperCase() === value ||
          e.locationBarcode.toUpperCase() === value,
      ) ?? null
    );
  }, [scanValue, entries]);

  const inBox = useMemo(
    () => (resolved ? entries.filter((e) => e.boxBarcode === resolved.boxBarcode) : []),
    [resolved, entries],
  );

  const stockDef = STOCKS.find((s) => s.id === stock) ?? STOCKS[0];
  const labels: LabelSpec[] = useMemo(
    () =>
      entries.slice(0, stockDef.columns * stockDef.rows).map((entry) => ({
        reference: entry.reference,
        seriesCode: entry.seriesCode,
        documentType: entry.documentType,
        subType: entry.subType,
        boxBarcode: entry.boxBarcode,
        locationBarcode: entry.locationBarcode,
      })),
    [entries, stockDef],
  );

  const runScan = () => {
    setParams({ scan: scanValue.trim() });
    if (!resolved) {
      notify('That barcode is not in the index. Check the value and scan again.', 'error');
    }
  };

  const print = () => {
    setPrintOpen(false);
    logAudit({
      action: 'Barcodes printed',
      object: `Label sheet ${stockDef.id}`,
      result: 'Success',
      detail: `${labels.length} labels on ${stockDef.label}, ${margin} mm page margin, Code 128B.`,
    });
    window.setTimeout(() => printRegion(sheetRef.current), 60);
  };

  return (
    <Box>
      <PageHeader
        moduleId="barcodes"
        title="Barcodes & labels"
        intro="Every document barcode resolves to the box it sits in and the location that box is shelved at. Labels print to scale on adhesive stock."
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => setPrintOpen(true)}
          >
            Print label sheet
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SectionCard
            title="Scan resolves the linkage chain"
            description="Scan a document, box or location barcode. All three resolve the same chain. The top bar search accepts the same values."
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2.5 }}>
              <TextField
                fullWidth
                label="Scan or type a barcode"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runScan();
                }}
                InputProps={{ sx: { fontFamily: mono } }}
                helperText="Try DOC-2026-004131, BOX-ARC-00412 or VLT-A-R12-S03."
              />
              <Button variant="outlined" onClick={runScan} sx={{ flexShrink: 0, height: 40 }}>
                Resolve this barcode
              </Button>
            </Stack>

            {resolved ? (
              <>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems="stretch"
                  sx={{ mb: 2 }}
                >
                  <ChainStep
                    step="Step 1 — document"
                    title={resolved.title}
                    value={resolved.reference}
                    caption={`${resolved.seriesCode} ${resolved.seriesLabel} · ${resolved.documentType} / ${resolved.subType}`}
                    highlight={scanValue.toUpperCase() === resolved.reference}
                  />
                  <Stack justifyContent="center" alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <EastIcon />
                    </Box>
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <SouthIcon />
                    </Box>
                    <Typography variant="caption">sits in</Typography>
                  </Stack>
                  <ChainStep
                    step="Step 2 — archive box"
                    title={`Box ${resolved.boxBarcode}`}
                    value={resolved.boxBarcode}
                    caption={`${inBox.length} of ${boxContents.capacity} slots filed · custodian ${boxContents.custodian}`}
                    highlight={scanValue.toUpperCase() === resolved.boxBarcode}
                  />
                  <Stack justifyContent="center" alignItems="center" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <EastIcon />
                    </Box>
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <SouthIcon />
                    </Box>
                    <Typography variant="caption">shelved at</Typography>
                  </Stack>
                  <ChainStep
                    step="Step 3 — vault location"
                    title={resolved.locationBarcode}
                    value={resolved.locationBarcode}
                    caption={
                      resolved.locationBarcode === 'OFF-SITE-MIDRAND'
                        ? 'Off-site store, Midrand. Retrieval is requested, not walked to.'
                        : `${boxContents.vault} · row ${resolved.locationBarcode.split('-')[1]}, rack ${resolved.locationBarcode.split('-')[2]}, slot ${resolved.locationBarcode.split('-')[3]}`
                    }
                    highlight={scanValue.toUpperCase() === resolved.locationBarcode}
                  />
                </Stack>

                <Table size="small">
                  <TableBody>
                    {[
                      ['Status', resolved.status],
                      ['Classification', resolved.classification],
                      ['Division', resolved.division],
                      ['Retention', `${resolved.retentionCode} · disposal due ${resolved.disposalDue}`],
                      ['Captured', `${resolved.capturedAt.replace('T', ' ')} by ${resolved.capturedBy}`],
                      ['Document', resolved.documentName],
                    ].map(([label, value]) => (
                      <TableRow key={label}>
                        <TableCell sx={{ width: 180, border: 0, pl: 0 }}>
                          <Typography variant="caption" color="text.secondary">
                            {label}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0, fontFamily: mono }}>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Alert severity="info">
                Enter a document, box or location barcode and choose Resolve this barcode. The chain
                shows the document, the box it sits in and the shelf the box is on.
              </Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Adhesive label sheet"
            description={`${stockDef.label}. The preview is to scale; printing uses the stock and margins set in the print dialog.`}
            action={
              <Button size="small" startIcon={<PrintOutlinedIcon />} onClick={() => setPrintOpen(true)}>
                Print
              </Button>
            }
          >
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <LabelSheet
                ref={sheetRef}
                labels={labels}
                columns={stockDef.columns}
                rows={stockDef.rows}
                marginMm={margin}
                scale={0.82}
              />
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <SectionCard
              title="What the barcode carries"
              description="Code 128B. The encoded string carries the series code with the document type and the sub-document type."
            >
              <Barcode
                value={resolved?.reference ?? 'DOC-2026-004131'}
                height={56}
                symbology="Symbology Code 128B · quiet zone 2.5 mm"
              />
              <Table size="small" sx={{ mt: 2 }}>
                <TableBody>
                  {[
                    ['Symbology', 'Code 128B'],
                    ['Series', resolved?.seriesCode ?? '4/2/1'],
                    ['Document type', resolved?.documentType ?? 'Contract'],
                    ['Sub-document type', resolved?.subType ?? 'Programme contract'],
                    ['Reference', resolved?.reference ?? 'DOC-2026-004131'],
                  ].map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell sx={{ width: 170, border: 0, pl: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, fontFamily: mono }}>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>

            <SectionCard
              title="Box and location labels"
              description="Boxes and shelves carry their own labels so a clerk can scan the shelf and confirm the box is where the index says it is."
            >
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <Chip label="Box label" size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {inBox.length} of {boxContents.capacity} slots filed
                    </Typography>
                  </Stack>
                  <Barcode value={resolved?.boxBarcode ?? boxContents.boxBarcode} height={40} />
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <Chip label="Location label" size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      Shelved {boxContents.shelvedOn}
                    </Typography>
                  </Stack>
                  <Barcode
                    value={resolved?.locationBarcode ?? boxContents.locationBarcode}
                    height={40}
                  />
                </Box>
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={printOpen} onClose={() => setPrintOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Print label sheet</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Adhesive stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            >
              {STOCKS.map((option) => (
                <MenuItem key={option.id} value={option.id} sx={{ fontSize: '0.8125rem' }}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Page margin: <span style={{ fontFamily: mono }}>{margin.toFixed(1)} mm</span>
              </Typography>
              <Slider
                value={margin}
                min={4}
                max={14}
                step={0.1}
                onChange={(_, value) => setMargin(value as number)}
                aria-label="Page margin in millimetres"
              />
              <Typography variant="caption" color="text.secondary">
                Set the margin to match the sheet in the tray. Avery L7161 uses 8.7 mm.
              </Typography>
            </Box>
            <Alert severity="info">
              Only the label sheet is sent to the printer. The rest of the screen is excluded by the
              print stylesheet.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={print} startIcon={<PrintOutlinedIcon />}>
            Print {stockDef.columns * stockDef.rows} labels
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
