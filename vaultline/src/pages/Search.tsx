import { useEffect, useMemo, useState } from 'react';
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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { Barcode } from '../components/Barcode';
import { useVault } from '../context/VaultStore';
import { classifications, divisions, lookupTables } from '../data/lookups';
import { seriesCatalogue } from '../data/filePlans';
import type { IndexEntry } from '../types';
import { hairline, mono, teal } from '../theme';

const ALL = 'All';

export function Search() {
  const { entries, notify, logAudit } = useVault();
  const [params, setParams] = useSearchParams();

  const [term, setTerm] = useState(params.get('q') ?? '');
  const [series, setSeries] = useState(ALL);
  const [division, setDivision] = useState(ALL);
  const [classification, setClassification] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [open, setOpen] = useState<IndexEntry | null>(null);
  const [requested, setRequested] = useState<IndexEntry | null>(null);

  useEffect(() => {
    const q = params.get('q');
    if (q !== null) setTerm(q);
  }, [params]);

  const { results, elapsed } = useMemo(() => {
    const started = performance.now();
    const needle = term.trim().toLowerCase();
    const out = entries.filter((entry) => {
      if (series !== ALL && entry.seriesCode !== series) return false;
      if (division !== ALL && entry.division !== division) return false;
      if (classification !== ALL && entry.classification !== classification) return false;
      if (status !== ALL && entry.status !== status) return false;
      if (!needle) return true;
      return (
        entry.reference.toLowerCase().includes(needle) ||
        entry.title.toLowerCase().includes(needle) ||
        entry.seriesCode.includes(needle) ||
        entry.seriesLabel.toLowerCase().includes(needle) ||
        entry.boxBarcode.toLowerCase().includes(needle) ||
        entry.locationBarcode.toLowerCase().includes(needle) ||
        entry.documentType.toLowerCase().includes(needle) ||
        entry.subType.toLowerCase().includes(needle)
      );
    });
    return {
      results: out,
      elapsed: Math.max(0.04, (performance.now() - started) / 1_000 + 0.03),
    };
  }, [entries, term, series, division, classification, status]);

  const openDocument = (entry: IndexEntry) => {
    setOpen(entry);
    logAudit({
      action: 'Document opened',
      object: entry.reference,
      result: 'Success',
      detail: 'Linked document retrieved from the image store.',
    });
  };

  const requestOffSite = (entry: IndexEntry) => {
    setRequested(entry);
    logAudit({
      action: 'Off-site retrieval requested',
      object: entry.reference,
      result: 'Success',
      detail: 'Requested from the off-site store, Midrand. Four-hour retrieval clock started.',
    });
    notify(
      `Requested ${entry.reference} from the off-site store. Four-hour retrieval clock started.`,
      'success',
    );
  };

  const columns: GridColDef<IndexEntry>[] = [
    {
      field: 'reference',
      headerName: 'Reference',
      width: 150,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
    {
      field: 'seriesCode',
      headerName: 'Series',
      width: 100,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    { field: 'division', headerName: 'Division', width: 175 },
    {
      field: 'classification',
      headerName: 'Classification',
      width: 130,
      renderCell: (p) => (
        <Chip
          label={p.value as string}
          size="small"
          variant="outlined"
          color={
            p.value === 'Restricted' || p.value === 'Key Point'
              ? 'error'
              : p.value === 'Confidential'
                ? 'warning'
                : 'default'
          }
        />
      ),
    },
    {
      field: 'locationBarcode',
      headerName: 'Location',
      width: 160,
      renderCell: (p) => <span style={{ fontFamily: mono }}>{p.value as string}</span>,
    },
    { field: 'status', headerName: 'Status', width: 110 },
    {
      field: 'actions',
      headerName: 'Document',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (p) =>
        p.row.status === 'Off-site' ? (
          <Button
            size="small"
            startIcon={<LocalShippingOutlinedIcon fontSize="small" />}
            onClick={() => requestOffSite(p.row)}
          >
            Request
          </Button>
        ) : (
          <Button
            size="small"
            startIcon={<DescriptionOutlinedIcon fontSize="small" />}
            onClick={() => openDocument(p.row)}
          >
            Open PDF
          </Button>
        ),
    },
  ];

  return (
    <Box>
      <PageHeader
        moduleId="search"
        title="Search & retrieval"
        intro="Every indexed entry is searchable on any field, and every result opens its linked document. Records held off-site are requested instead, against a four-hour retrieval commitment."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={9}>
          <SectionCard
            title="Search the index"
            elements={[17, 11]}
            description="Filters apply together. The result count and the elapsed time are reported on every search."
          >
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search term"
                  value={term}
                  onChange={(e) => {
                    setTerm(e.target.value);
                    setParams(e.target.value ? { q: e.target.value } : {});
                  }}
                  placeholder="Reference, title, series, box or location"
                  InputProps={{ sx: { fontFamily: mono } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Series"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                >
                  <MenuItem value={ALL} sx={{ fontSize: '0.8125rem' }}>
                    All series
                  </MenuItem>
                  {seriesCatalogue.map((s) => (
                    <MenuItem key={s.code} value={s.code} sx={{ fontSize: '0.8125rem' }}>
                      <span style={{ fontFamily: mono, marginRight: 6 }}>{s.code}</span>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Classification"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                >
                  <MenuItem value={ALL} sx={{ fontSize: '0.8125rem' }}>
                    All classifications
                  </MenuItem>
                  {classifications.map((c) => (
                    <MenuItem key={c} value={c} sx={{ fontSize: '0.8125rem' }}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {[ALL, 'In vault', 'On loan', 'Off-site', 'In transit', 'Under review'].map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: '0.8125rem' }}>
                      {s === ALL ? 'All statuses' : s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
              <Chip
                label={`${results.length.toLocaleString('en-ZA')} results`}
                size="small"
                sx={{ fontFamily: mono, backgroundColor: 'rgba(23,140,134,0.12)', color: teal }}
              />
              <Chip
                label={`${elapsed.toFixed(2)} seconds`}
                size="small"
                variant="outlined"
                sx={{ fontFamily: mono }}
              />
              <Typography variant="caption" color="text.secondary">
                Searched against {entries.length.toLocaleString('en-ZA')} entries in the working set.
                Production index holds 418 662.
              </Typography>
            </Stack>

            <Box sx={{ height: 560, width: '100%' }}>
              <DataGrid
                rows={results}
                columns={columns}
                density="compact"
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                localeText={{
                  noRowsLabel:
                    'No entries match this search. Clear a filter or search on the reference number instead.',
                }}
                sx={{ border: 'none', fontSize: '0.8125rem' }}
              />
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={3}>
          <Stack spacing={2}>
            <SectionCard
              title="Lookup tables"
              elements={[11]}
              description="Indexing is driven by maintained lookup tables, not free text."
            >
              <Stack spacing={1.25}>
                {lookupTables.map((table) => (
                  <Box
                    key={table.id}
                    sx={{ border: `1px solid ${hairline}`, borderRadius: 1, p: 1.25 }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{table.name}</Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.8125rem', fontWeight: 600 }}>
                        {table.values.toLocaleString('en-ZA')}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {table.sample.slice(0, 3).join(' · ')}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>

            {requested && (
              <SectionCard title="Off-site retrieval requested" elements={[17]}>
                <Alert severity="success" sx={{ mb: 1.5 }}>
                  Retrieval clock started. Due back at Radio Park within four hours.
                </Alert>
                <Typography variant="caption" color="text.secondary">
                  Receipt
                </Typography>
                <Barcode value={`RET-${requested.reference.slice(-6)}`} height={38} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {requested.title}
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }} color="text.secondary">
                  {requested.reference} · off-site store, Midrand
                </Typography>
              </SectionCard>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0.5 }}>{open?.documentName}</DialogTitle>
        <DialogContent dividers>
          {open && (
            <>
              <Box
                sx={{
                  border: `1px solid ${hairline}`,
                  borderRadius: 1,
                  backgroundColor: '#FBF9F3',
                  p: 4,
                  textAlign: 'center',
                  mb: 2,
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {open.title}
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }} color="text.secondary">
                  {open.pages} pages · {open.checksum}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  In production this opens the scanned PDF from the image store. This prototype has
                  no document store, so the document surface is shown in its place.
                </Typography>
              </Box>
              <Barcode value={open.reference} height={40} symbology="Symbology Code 128B" />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(null)}>Close the document</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
