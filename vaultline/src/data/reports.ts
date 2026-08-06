import type { StandardReport } from '../types';

export const standardReports: StandardReport[] = [
  {
    id: 'RPT-01',
    name: 'Movements by division',
    description: 'Issues, returns and transfers per division for a chosen period.',
    lastRun: '2026-08-06T07:05:00',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 'RPT-02',
    name: 'Overdue loans',
    description: 'Files past their due-back date, with holder, division and days overdue.',
    lastRun: '2026-08-06T07:05:00',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-03',
    name: 'User activity',
    description: 'Sign-ins, captures, searches and prints per user.',
    lastRun: '2026-08-05T18:00:00',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 'RPT-04',
    name: 'Audit report',
    description: 'Full audit log for a period, filtered by user, action or result.',
    lastRun: '2026-08-05T18:00:00',
    formats: ['PDF', 'CSV'],
  },
  {
    id: 'RPT-05',
    name: 'Capture productivity',
    description: 'Entries captured and images scanned per clerk per day.',
    lastRun: '2026-08-04T18:00:00',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-06',
    name: 'Duplicates',
    description: 'Flagged duplicate candidates with the matched entry and the match basis.',
    lastRun: '2026-08-06T07:05:00',
    formats: ['PDF', 'CSV'],
  },
  {
    id: 'RPT-07',
    name: 'Records due for disposal',
    description: 'Entries whose retention has expired, grouped by retention schedule.',
    lastRun: '2026-08-01T06:00:00',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 'RPT-08',
    name: 'Vault capacity',
    description: 'Boxes filed against slot capacity per vault row.',
    lastRun: '2026-08-03T06:00:00',
    formats: ['PDF', 'Excel'],
  },
];

export const movementsByDivision = [
  { division: 'News & Current Affairs', issued: 214, returned: 198, overdue: 4 },
  { division: 'Legal Services', issued: 168, returned: 160, overdue: 3 },
  { division: 'Human Capital', issued: 131, returned: 127, overdue: 2 },
  { division: 'Finance', issued: 96, returned: 94, overdue: 1 },
  { division: 'Company Secretariat', issued: 74, returned: 73, overdue: 1 },
  { division: 'Sales', issued: 41, returned: 41, overdue: 0 },
];

export const restoreIncidents = [
  {
    id: 'IR-2025-09',
    date: '2025-09-14',
    event: 'SAN controller failure, image store offline',
    restored: '2 h 40 m',
    dataLoss: 'None. Recovered to 15 minutes before the failure.',
  },
  {
    id: 'IR-2026-02',
    date: '2026-02-03',
    event: 'Index database corruption after a failed patch',
    restored: '1 h 09 m',
    dataLoss: 'None.',
  },
  {
    id: 'IR-2026-06',
    date: '2026-06-21',
    event: 'Quarterly evidenced restore test, full system',
    restored: '2 h 36 m',
    dataLoss: 'Not applicable — planned test.',
  },
];

export const scheduledReports = [
  {
    id: 'SCH-01',
    report: 'Overdue loans',
    frequency: 'Every Monday, 06:00',
    recipients: 'records.manager@sabc.co.za',
    format: 'PDF',
  },
  {
    id: 'SCH-02',
    report: 'Audit report',
    frequency: 'First of the month, 06:00',
    recipients: 'internal.audit@sabc.co.za',
    format: 'CSV',
  },
  {
    id: 'SCH-03',
    report: 'Records due for disposal',
    frequency: 'Quarterly, first working day',
    recipients: 'records.manager@sabc.co.za',
    format: 'Excel',
  },
];

export const platform = {
  os: 'Windows Server 2022 Standard (virtual)',
  compute: '8 vCPU / 32 GB RAM',
  database: 'SQL Server 2022 Standard',
  storage: '4 TB SAN, thin provisioned',
  scanners: 'TWAIN and ISIS compatible',
  concurrency: 'Load tested to 120 concurrent users',
  clients: 'Windows 10 and 11 desktops on the SABC network',
  network: 'Runs on the SABC LAN. No internet dependency for day-to-day use.',
};

export const licence = {
  type: 'Perpetual application licence',
  seats: '50 named users / 120 concurrent users',
  maintenance: 'Annual renewable maintenance and support, quoted separately',
  database: 'SQL Server licensed by SABC under its own agreement',
  exit: 'Licence and all data remain with SABC on exit. No hostage of data.',
  subscription: 'This is not a subscription. There is no monthly per-user fee.',
};

export const continuity = {
  fullBackup: 'Nightly full backup at 22:00, retained 35 days',
  logBackup: 'Transaction log backup every 15 minutes',
  documents: 'Image store replicated to a second site',
  rpo: '15 minutes',
  rto: 'Under 4 hours',
  testing: 'Quarterly restore test, evidenced and filed under series 3/1/7',
};
