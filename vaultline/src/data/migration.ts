import type { FieldMapping, MigrationStage } from '../types';

export const migrationRun = {
  id: 'SABC-MIG-003',
  source: 'Document Warehouse — Windows Server, SQL Server',
  target: 'VaultLine index and image store',
  started: '2026-08-05T18:00:00',
  window: 'Third of three rehearsal runs. Cut-over run is scheduled after acceptance.',
  operator: 'N. Mahlangu',
};

export const migrationStages: MigrationStage[] = [
  {
    id: 'ST-1',
    label: 'Extract from SQL Server',
    detail: 'dw_docs, dw_box, dw_loc, dw_move read from the Document Warehouse database.',
    progress: 100,
    rows: '418 662 rows',
    state: 'Complete',
  },
  {
    id: 'ST-2',
    label: 'Map to series codes',
    detail: 'Legacy file codes translated to NARSSA series codes under both approved file plans.',
    progress: 100,
    rows: '418 662 rows',
    state: 'Complete',
  },
  {
    id: 'ST-3',
    label: 'Copy and verify images',
    detail: 'Scanned images copied to the image store and checksum-verified against source.',
    progress: 100,
    rows: '412 918 of 414 962 images',
    state: 'Complete',
  },
  {
    id: 'ST-4',
    label: 'Rebuild barcode links',
    detail: 'Document, box and location barcodes re-linked so every entry resolves its chain.',
    progress: 96,
    rows: '402 114 of 418 662 links',
    state: 'Running',
  },
  {
    id: 'ST-5',
    label: 'Reconcile and sign off',
    detail: 'Counts, checksums and exception list handed to the SABC records manager.',
    progress: 0,
    rows: 'Awaiting stage 4',
    state: 'Queued',
  },
];

export const reconciliation = {
  sourceRows: 418_662,
  loadedRows: 418_662,
  variance: 0,
  imageExceptions: 2_044,
  exceptionNote:
    'Exceptions are source images that failed checksum verification or have no readable scan path. Each is listed with its legacy doc_ref for re-scanning at Radio Park.',
  checkedBy: 'N. Mahlangu',
  checkedAt: '2026-08-06T06:15:00',
};

export const fieldMappings: FieldMapping[] = [
  {
    source: 'dw_docs.doc_ref',
    target: 'entry.reference',
    transform: 'Prefix DOC-, keep legacy year, pad sequence to six digits. Uniqueness re-checked.',
    rows: '418 662',
    status: 'Verified',
  },
  {
    source: 'dw_docs.file_code',
    target: 'entry.seriesCode',
    transform: 'Lookup against the 2011 → 2019 / 2023 series crosswalk. 214 codes mapped.',
    rows: '418 662',
    status: 'Verified',
  },
  {
    source: 'dw_box.box_no',
    target: 'entry.boxBarcode',
    transform: 'Format as BOX-ARC-nnnnn and re-issue a Code 128B barcode.',
    rows: '27 900',
    status: 'Verified',
  },
  {
    source: 'dw_loc.rack',
    target: 'entry.locationBarcode',
    transform: 'Split rack string to vault, row and slot; format as VLT-x-Rnn-Snn.',
    rows: '3 480',
    status: 'Verified',
  },
  {
    source: 'dw_move.hist',
    target: 'movement register',
    transform: 'One movement row per history line. Origin, destination, user and timestamp retained.',
    rows: '1 204 887',
    status: 'Verified',
  },
  {
    source: 'dw_docs.scan_path',
    target: 'entry.documentName',
    transform: 'Copy image to the store, verify checksum, link one document per entry.',
    rows: '414 962',
    status: 'Verified with exceptions',
  },
];

export const exitHandback = [
  {
    id: 'EX-1',
    title: 'SQL Server backup',
    detail: 'Full .bak of the index database, restorable on SABC infrastructure without the vendor.',
    format: '.bak',
  },
  {
    id: 'EX-2',
    title: 'CSV index export',
    detail: 'Every indexed entry with all fields, including custom fields added after go-live.',
    format: '.csv',
  },
  {
    id: 'EX-3',
    title: 'PDF/A documents',
    detail: 'All linked documents converted to PDF/A-2b for long-term preservation.',
    format: 'PDF/A-2b',
  },
  {
    id: 'EX-4',
    title: 'Folder tree by series',
    detail: 'Documents written to a folder structure that mirrors the approved file plan series.',
    format: 'Folder tree',
  },
];
