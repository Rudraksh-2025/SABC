import type { Division, LookupTable } from '../types';

export const divisions: Division[] = [
  'News & Current Affairs',
  'Legal Services',
  'Human Capital',
  'Finance',
  'Company Secretariat',
  'Sales',
];

export const documentTypes = [
  'Minutes',
  'Contract',
  'Correspondence',
  'Personnel file',
  'Financial statement',
  'Report',
  'Licence',
  'Submission',
  'Policy',
  'Case file',
];

/** Sub-types offered per document type; the barcode carries both. */
export const subTypes: Record<string, string[]> = {
  Minutes: ['Board meeting', 'Committee meeting', 'Executive meeting', 'Special sitting'],
  Contract: ['Programme contract', 'Talent agreement', 'Supplier contract', 'Rights clearance'],
  Correspondence: ['Incoming', 'Outgoing', 'Regulatory', 'Internal memorandum'],
  'Personnel file': ['Appointment', 'Disciplinary', 'Leave record', 'Termination'],
  'Financial statement': ['Annual', 'Interim', 'Divisional', 'Audit working paper'],
  Report: ['Annual report', 'Investigation', 'Compliance', 'Management'],
  Licence: ['Broadcast licence', 'Renewal', 'Condition variation', 'Spectrum'],
  Submission: ['Parliamentary', 'ICASA', 'Shareholder compact', 'Treasury'],
  Policy: ['Approved', 'Draft under review', 'Withdrawn', 'Delegation of authority'],
  'Case file': ['Litigation', 'Counsel opinion', 'Settlement', 'Arbitration'],
};

export const classifications = ['Public', 'Internal', 'Confidential', 'Restricted', 'Key Point'];

export const retentionSchedules = [
  { code: 'RS-05', label: 'Retain 5 years, then destroy', years: 5 },
  { code: 'RS-07', label: 'Retain 7 years, then destroy', years: 7 },
  { code: 'RS-10', label: 'Retain 10 years, then review', years: 10 },
  { code: 'RS-15', label: 'Retain 15 years, then transfer to National Archives', years: 15 },
  { code: 'RS-PERM', label: 'Permanent — archival value', years: 99 },
];

export const vaultRows = ['A', 'B', 'C', 'D', 'E'];

export const lookupTables: LookupTable[] = [
  {
    id: 'LK-01',
    name: 'Document type',
    values: 28,
    owner: 'N. Mahlangu',
    updated: '2026-07-28',
    sample: documentTypes.slice(0, 5),
  },
  {
    id: 'LK-02',
    name: 'Sub-document type',
    values: 146,
    owner: 'N. Mahlangu',
    updated: '2026-07-28',
    sample: ['Board meeting', 'Programme contract', 'Disciplinary', 'ICASA', 'Counsel opinion'],
  },
  {
    id: 'LK-03',
    name: 'Division',
    values: 19,
    owner: 'P. Sithole',
    updated: '2026-06-11',
    sample: divisions.slice(0, 5),
  },
  {
    id: 'LK-04',
    name: 'Vault locations',
    values: 3_480,
    owner: 'P. Sithole',
    updated: '2026-08-03',
    sample: ['VLT-A-R12-S03', 'VLT-B-R04-S11', 'VLT-C-R21-S07'],
  },
  {
    id: 'LK-05',
    name: 'Retention schedules',
    values: 62,
    owner: 'N. Mahlangu',
    updated: '2026-05-19',
    sample: retentionSchedules.map((r) => r.code),
  },
  {
    id: 'LK-06',
    name: 'Classification',
    values: 5,
    owner: 'N. Mahlangu',
    updated: '2026-01-30',
    sample: classifications,
  },
];

/** Headline figures are stated constants, not counts of the seed data. */
export const HOLDINGS = {
  indexedEntries: 418_000,
  indexedEntriesExact: 418_662,
  archiveBoxes: 27_900,
  filesOnLoan: 86,
  overdueLoans: 11,
  duplicatesFlagged: 7,
  activeUsers: 34,
  vaultLocations: 3_480,
  concurrentSeats: 120,
  namedSeats: 50,
};

export const captureVolume = [
  { month: 'Mar 2026', captured: 5_120, scanned: 4_310 },
  { month: 'Apr 2026', captured: 6_048, scanned: 5_200 },
  { month: 'May 2026', captured: 5_733, scanned: 4_980 },
  { month: 'Jun 2026', captured: 7_214, scanned: 6_402 },
  { month: 'Jul 2026', captured: 6_890, scanned: 6_115 },
  { month: 'Aug 2026', captured: 2_140, scanned: 1_902 },
];

export const retrievalPerformance = [
  { label: 'Vault retrieval within 15 minutes', value: 94, target: 90, unit: '%' },
  { label: 'Off-site retrieval within 4 hours', value: 97, target: 95, unit: '%' },
  { label: 'Index search under 2 seconds', value: 99, target: 98, unit: '%' },
];
