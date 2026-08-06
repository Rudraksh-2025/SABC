import type { Classification, Division, EntryStatus, IndexEntry } from '../types';

/** Deterministic pseudo-random source so the seed is identical on every load. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

interface SeriesSeed {
  code: string;
  label: string;
  planId: string;
  division: Division;
  documentType: string;
  subTypes: string[];
  classifications: Classification[];
  retention: string;
  titles: string[];
}

const seriesSeeds: SeriesSeed[] = [
  {
    code: '9/1/3',
    label: 'Board & committee minutes',
    planId: 'FP-2019',
    division: 'Company Secretariat',
    documentType: 'Minutes',
    subTypes: ['Board meeting', 'Committee meeting', 'Special sitting'],
    classifications: ['Confidential', 'Internal'],
    retention: 'RS-PERM',
    titles: [
      'Board meeting minutes — quarter %Q',
      'Audit & risk committee minutes — %M',
      'Remuneration committee minutes — %M',
      'Special board sitting — licence renewal',
      'Board strategy session minutes — %M',
    ],
  },
  {
    code: '9/1/4',
    label: 'Board resolutions',
    planId: 'FP-2019',
    division: 'Company Secretariat',
    documentType: 'Policy',
    subTypes: ['Approved', 'Delegation of authority'],
    classifications: ['Confidential', 'Internal'],
    retention: 'RS-PERM',
    titles: [
      'Board resolution — delegation of authority %M',
      'Board resolution — capital expenditure approval',
      'Board resolution — appointment of company secretary',
    ],
  },
  {
    code: '9/2/2',
    label: 'Parliamentary submissions',
    planId: 'FP-2019',
    division: 'Company Secretariat',
    documentType: 'Submission',
    subTypes: ['Parliamentary', 'Shareholder compact'],
    classifications: ['Internal', 'Public'],
    retention: 'RS-15',
    titles: [
      'Portfolio committee submission — %M',
      'Shareholder compact submission — %M',
      'Response to parliamentary questions — %M',
    ],
  },
  {
    code: '4/2/1',
    label: 'Programme contracts',
    planId: 'FP-2023',
    division: 'News & Current Affairs',
    documentType: 'Contract',
    subTypes: ['Programme contract', 'Talent agreement'],
    classifications: ['Confidential', 'Internal'],
    retention: 'RS-10',
    titles: [
      'Programme contract — current affairs strand series %S',
      'Talent agreement — presenter, morning bulletin',
      'Programme contract — regional news insert series %S',
      'Co-production agreement — documentary strand %S',
    ],
  },
  {
    code: '4/2/2',
    label: 'Rights clearances',
    planId: 'FP-2023',
    division: 'Sales',
    documentType: 'Contract',
    subTypes: ['Rights clearance'],
    classifications: ['Internal'],
    retention: 'RS-10',
    titles: [
      'Music rights clearance — archive footage %S',
      'Broadcast rights clearance — sports highlight package',
      'Rights clearance — third-party library footage',
    ],
  },
  {
    code: '4/4/1',
    label: 'Commissioning briefs',
    planId: 'FP-2023',
    division: 'News & Current Affairs',
    documentType: 'Report',
    subTypes: ['Management', 'Compliance'],
    classifications: ['Internal'],
    retention: 'RS-07',
    titles: [
      'Commissioning brief — investigative strand %S',
      'Commissioning brief — regional language programming',
      'Production schedule — %M flighting',
    ],
  },
  {
    code: '12/5/2',
    label: 'Employee records',
    planId: 'FP-2019',
    division: 'Human Capital',
    documentType: 'Personnel file',
    subTypes: ['Appointment', 'Leave record', 'Termination'],
    classifications: ['Restricted', 'Confidential'],
    retention: 'RS-15',
    titles: [
      'Employee file — appointment pack, staff no. %N',
      'Employee file — service record, staff no. %N',
      'Employee file — termination pack, staff no. %N',
    ],
  },
  {
    code: '12/5/3',
    label: 'Disciplinary records',
    planId: 'FP-2019',
    division: 'Human Capital',
    documentType: 'Personnel file',
    subTypes: ['Disciplinary'],
    classifications: ['Restricted'],
    retention: 'RS-07',
    titles: [
      'Disciplinary enquiry record — staff no. %N',
      'Grievance record — staff no. %N',
      'Chairperson ruling — disciplinary enquiry %N',
    ],
  },
  {
    code: '12/8/1',
    label: 'Payroll schedules',
    planId: 'FP-2019',
    division: 'Human Capital',
    documentType: 'Financial statement',
    subTypes: ['Divisional', 'Interim'],
    classifications: ['Restricted', 'Confidential'],
    retention: 'RS-07',
    titles: [
      'Payroll schedule — %M, divisional summary',
      'Pension fund contribution schedule — %M',
      'Payroll reconciliation — %M',
    ],
  },
  {
    code: '7/3/4',
    label: 'Licence & regulatory correspondence',
    planId: 'FP-2023',
    division: 'Legal Services',
    documentType: 'Correspondence',
    subTypes: ['Regulatory', 'Incoming', 'Outgoing'],
    classifications: ['Internal', 'Confidential'],
    retention: 'RS-15',
    titles: [
      'ICASA correspondence — licence condition %S',
      'Regulatory correspondence — local content quota %M',
      'Licence renewal correspondence — commercial sound service',
    ],
  },
  {
    code: '7/6/1',
    label: 'Case files',
    planId: 'FP-2019',
    division: 'Legal Services',
    documentType: 'Case file',
    subTypes: ['Litigation', 'Counsel opinion', 'Settlement'],
    classifications: ['Confidential', 'Restricted'],
    retention: 'RS-15',
    titles: [
      'Case file — contractual dispute, matter %N',
      'Counsel opinion — defamation claim, matter %N',
      'Settlement agreement — labour matter %N',
    ],
  },
  {
    code: '3/1/7',
    label: 'Audit working papers',
    planId: 'FP-2019',
    division: 'Finance',
    documentType: 'Financial statement',
    subTypes: ['Audit working paper', 'Annual'],
    classifications: ['Confidential', 'Internal'],
    retention: 'RS-07',
    titles: [
      'External audit working papers — %M',
      'Internal audit file — revenue assurance %M',
      'Annual financial statements working file — %M',
    ],
  },
  {
    code: '3/5/1',
    label: 'Tender files',
    planId: 'FP-2019',
    division: 'Finance',
    documentType: 'Contract',
    subTypes: ['Supplier contract'],
    classifications: ['Confidential', 'Internal'],
    retention: 'RS-10',
    titles: [
      'Tender file — transmission maintenance, RFQ %N',
      'Tender file — records storage services, RFQ %N',
      'Supplier contract — outside broadcast vehicles',
    ],
  },
];

const months = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'November 2025',
  'December 2025',
];

const capturers = ['K. Naidoo', 'T. van Wyk', 'P. Sithole', 'N. Mahlangu'];
const holders = [
  'T. van Wyk',
  'M. Dlamini',
  'L. Botha',
  'P. Sithole',
  'K. Naidoo',
  'N. Mahlangu',
];

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

function retentionDue(capturedAt: string, retention: string): string {
  const years =
    retention === 'RS-PERM' ? 99 : Number.parseInt(retention.replace('RS-', ''), 10) || 7;
  const captured = new Date(capturedAt);
  const due = new Date(captured);
  due.setFullYear(due.getFullYear() + years);
  return due.toISOString().slice(0, 10);
}

function buildEntries(): IndexEntry[] {
  const rnd = makeRandom(20_260_806);
  const out: IndexEntry[] = [];
  let refCounter = 3_902;

  for (let i = 0; i < 96; i += 1) {
    const series = seriesSeeds[i % seriesSeeds.length];
    const rawTitle = series.titles[Math.floor(rnd() * series.titles.length)];
    const title = rawTitle
      .replace('%Q', String(1 + Math.floor(rnd() * 4)))
      .replace('%M', months[Math.floor(rnd() * months.length)])
      .replace('%S', String(2019 + Math.floor(rnd() * 7)))
      .replace('%N', pad(1_000 + Math.floor(rnd() * 8_999), 4));

    refCounter += 1 + Math.floor(rnd() * 4);
    const year = rnd() > 0.22 ? 2026 : 2025;
    const reference = `DOC-${year}-${pad(year === 2026 ? refCounter : 110_000 + refCounter, 6)}`;

    const monthOffset = Math.floor(rnd() * 8);
    const captured = new Date(2026, 7 - monthOffset, 1 + Math.floor(rnd() * 27), 8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60));
    const capturedAt = captured.toISOString().slice(0, 19);

    const row = 'ABCDE'[Math.floor(rnd() * 5)];
    const rack = pad(1 + Math.floor(rnd() * 24), 2);
    const slot = pad(1 + Math.floor(rnd() * 18), 2);
    const boxNumber = pad(100 + Math.floor(rnd() * 899), 5);

    const statusRoll = rnd();
    let status: EntryStatus = 'In vault';
    if (statusRoll > 0.88) status = 'On loan';
    else if (statusRoll > 0.82) status = 'Off-site';
    else if (statusRoll > 0.79) status = 'In transit';
    else if (statusRoll > 0.76) status = 'Under review';

    const onLoan = status === 'On loan';
    const dueBackDate = new Date(2026, 7, 1 + Math.floor(rnd() * 24));

    out.push({
      id: `E-${pad(i + 1, 3)}`,
      reference,
      title,
      seriesCode: series.code,
      seriesLabel: series.label,
      documentType: series.documentType,
      subType: series.subTypes[Math.floor(rnd() * series.subTypes.length)],
      division: series.division,
      classification: series.classifications[Math.floor(rnd() * series.classifications.length)],
      filePlanId: series.planId,
      boxBarcode: `BOX-ARC-${boxNumber}`,
      locationBarcode: status === 'Off-site' ? 'OFF-SITE-MIDRAND' : `VLT-${row}-R${rack}-S${slot}`,
      status,
      capturedBy: capturers[Math.floor(rnd() * capturers.length)],
      capturedAt,
      retentionCode: series.retention,
      disposalDue: retentionDue(capturedAt, series.retention),
      pages: 4 + Math.floor(rnd() * 240),
      checksum: `sha256:${pad(Math.floor(rnd() * 999_999_999), 9)}${pad(Math.floor(rnd() * 99_999), 5)}`,
      documentName: `${reference}.pdf`,
      holder: onLoan ? holders[Math.floor(rnd() * holders.length)] : null,
      dueBack: onLoan ? dueBackDate.toISOString().slice(0, 10) : null,
      custom: {},
    });
  }

  return out;
}

const generated = buildEntries();

/** The entry that the duplicate check on the capture screen matches against. */
export const DUPLICATE_TARGET: IndexEntry = {
  id: 'E-000',
  reference: 'DOC-2025-118440',
  title: 'Board meeting minutes — quarter 4',
  seriesCode: '9/1/3',
  seriesLabel: 'Board & committee minutes',
  documentType: 'Minutes',
  subType: 'Board meeting',
  division: 'Company Secretariat',
  classification: 'Confidential',
  filePlanId: 'FP-2019',
  boxBarcode: 'BOX-ARC-00412',
  locationBarcode: 'VLT-A-R12-S03',
  status: 'In vault',
  capturedBy: 'P. Sithole',
  capturedAt: '2025-11-18T10:24:00',
  retentionCode: 'RS-PERM',
  disposalDue: '2124-11-18',
  pages: 62,
  checksum: 'sha256:41c9e0d7b2a8f5330',
  documentName: 'DOC-2025-118440.pdf',
  holder: null,
  dueBack: null,
  custom: {},
};

/** The entry used for the barcode linkage walkthrough and the receipts. */
export const FEATURED_ENTRY: IndexEntry = {
  id: 'E-100',
  reference: 'DOC-2026-004131',
  title: 'Programme contract — current affairs strand series 2026',
  seriesCode: '4/2/1',
  seriesLabel: 'Programme contracts',
  documentType: 'Contract',
  subType: 'Programme contract',
  division: 'News & Current Affairs',
  classification: 'Confidential',
  filePlanId: 'FP-2023',
  boxBarcode: 'BOX-ARC-00412',
  locationBarcode: 'VLT-A-R12-S03',
  status: 'In vault',
  capturedBy: 'K. Naidoo',
  capturedAt: '2026-08-04T09:41:00',
  retentionCode: 'RS-10',
  disposalDue: '2036-08-04',
  pages: 38,
  checksum: 'sha256:9f21ab77c0e4d1852',
  documentName: 'DOC-2026-004131.pdf',
  holder: null,
  dueBack: null,
  custom: {},
};

export const entries: IndexEntry[] = [FEATURED_ENTRY, DUPLICATE_TARGET, ...generated];

export const boxContents = {
  boxBarcode: 'BOX-ARC-00412',
  locationBarcode: 'VLT-A-R12-S03',
  vault: 'Radio Park vault, Auckland Park',
  row: 'A',
  rack: 'R12',
  slot: 'S03',
  shelvedOn: '2026-02-11',
  capacity: 42,
  filed: 37,
  custodian: 'P. Sithole',
};
