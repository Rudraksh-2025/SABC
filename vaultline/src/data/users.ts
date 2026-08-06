import type { Permission, Person, Role } from '../types';

export const users: Person[] = [
  {
    id: 'U-001',
    name: 'N. Mahlangu',
    role: 'Administrator',
    division: 'Records Management',
    email: 'n.mahlangu@sabc.co.za',
    status: 'Active',
    lastSignIn: '2026-08-06T07:12:00',
    mfa: true,
    failedAttempts: 0,
    seriesScope: ['All series'],
    workstation: 'RP-REC-14',
  },
  {
    id: 'U-002',
    name: 'P. Sithole',
    role: 'Senior clerk',
    division: 'Records Management',
    email: 'p.sithole@sabc.co.za',
    status: 'Active',
    lastSignIn: '2026-08-06T06:58:00',
    mfa: true,
    failedAttempts: 0,
    seriesScope: ['9/*', '3/*', '12/*', '7/*'],
    workstation: 'RP-REC-09',
  },
  {
    id: 'U-003',
    name: 'T. van Wyk',
    role: 'Clerk',
    division: 'News & Current Affairs',
    email: 't.vanwyk@sabc.co.za',
    status: 'Active',
    lastSignIn: '2026-08-06T08:03:00',
    mfa: false,
    failedAttempts: 0,
    seriesScope: ['4/*', '7/3/*'],
    workstation: 'RP-NEWS-31',
  },
  {
    id: 'U-004',
    name: 'K. Naidoo',
    role: 'Clerk',
    division: 'Records Management',
    email: 'k.naidoo@sabc.co.za',
    status: 'Active',
    lastSignIn: '2026-08-05T16:44:00',
    mfa: false,
    failedAttempts: 1,
    seriesScope: ['9/*', '3/*', '4/*'],
    workstation: 'SCAN-02',
  },
  {
    id: 'U-005',
    name: 'M. Dlamini',
    role: 'Reader',
    division: 'Human Capital',
    email: 'm.dlamini@sabc.co.za',
    status: 'Locked',
    lastSignIn: '2026-08-04T11:20:00',
    mfa: false,
    failedAttempts: 3,
    seriesScope: ['12/5/*'],
    workstation: 'RP-HC-07',
  },
  {
    id: 'U-006',
    name: 'L. Botha',
    role: 'Reader',
    division: 'Legal Services',
    email: 'l.botha@sabc.co.za',
    status: 'Awaiting authorisation',
    lastSignIn: null,
    mfa: false,
    failedAttempts: 0,
    seriesScope: ['7/*'],
    workstation: 'RP-LEG-22',
  },
];

export const ROLES: Role[] = ['Administrator', 'Senior clerk', 'Clerk', 'Reader'];

export const PERMISSION_LABELS: Record<Permission, string> = {
  search: 'Search the index',
  openDocuments: 'Open linked documents',
  capture: 'Capture & index entries',
  issueReceive: 'Issue and receive files',
  amend: 'Amend an existing entry',
  printBarcodes: 'Print barcodes and labels',
  delete: 'Delete an entry',
  authoriseUsers: 'Authorise users',
  buildReports: 'Build and schedule reports',
  viewKeyPoint: 'View Key Point records',
};

export const permissionMatrix: Record<Role, Record<Permission, boolean>> = {
  Administrator: {
    search: true,
    openDocuments: true,
    capture: true,
    issueReceive: true,
    amend: true,
    printBarcodes: true,
    delete: true,
    authoriseUsers: true,
    buildReports: true,
    viewKeyPoint: true,
  },
  'Senior clerk': {
    search: true,
    openDocuments: true,
    capture: true,
    issueReceive: true,
    amend: true,
    printBarcodes: true,
    delete: false,
    authoriseUsers: false,
    buildReports: true,
    viewKeyPoint: true,
  },
  Clerk: {
    search: true,
    openDocuments: true,
    capture: true,
    issueReceive: true,
    amend: true,
    printBarcodes: true,
    delete: false,
    authoriseUsers: false,
    buildReports: false,
    viewKeyPoint: false,
  },
  Reader: {
    search: true,
    openDocuments: true,
    capture: false,
    issueReceive: false,
    amend: false,
    printBarcodes: false,
    delete: false,
    authoriseUsers: false,
    buildReports: false,
    viewKeyPoint: false,
  },
};

export function can(role: Role, permission: Permission): boolean {
  return permissionMatrix[role][permission];
}

export const securityControls = [
  {
    title: 'Active Directory single sign-on',
    detail:
      'Accounts resolve against the SABC domain. No separate password store is held by the application.',
  },
  {
    title: 'Multi-factor authentication on privileged roles',
    detail: 'Administrator and Senior clerk sign-ins require a second factor at every session start.',
  },
  {
    title: '15-minute idle lock',
    detail: 'A workstation left unattended locks the session and requires re-authentication.',
  },
  {
    title: 'Five failed attempts locks the account',
    detail:
      'The account is disabled and an administrator must reinstate it. M. Dlamini is locked after 3 failed sign-ins.',
  },
  {
    title: 'Series-level scoping',
    detail:
      'A user only sees the series in their scope. Key Point records under the National Key Points Act are withheld from Clerk and Reader.',
  },
];
