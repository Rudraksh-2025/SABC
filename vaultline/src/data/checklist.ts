import type { ChecklistElement, ModuleDef, ModuleId } from '../types';

/**
 * Single source of truth for the 26 evaluation elements and their module mapping.
 * The sidebar badges and the demo checklist page both read from here, so the two
 * can never drift apart.
 */

export const RFQ_REFERENCE = 'RFQ/COP/2026/10251403/11';

export const MODULES: ModuleDef[] = [
  {
    id: 'overview',
    code: '',
    label: 'Vault overview',
    description: 'Holdings, loans and queues at a glance',
    route: '/',
  },
  {
    id: 'capture',
    code: 'M1',
    label: 'Capture & indexing',
    description: 'Index an entry, scan or upload, generate the barcode',
    route: '/capture',
  },
  {
    id: 'file-plans',
    code: 'M2',
    label: 'File plan management',
    description: 'Approved plans, series and sub-type folders',
    route: '/file-plans',
  },
  {
    id: 'barcodes',
    code: 'M3',
    label: 'Barcodes & labels',
    description: 'Document, box and location linkage, adhesive label sheets',
    route: '/barcodes',
  },
  {
    id: 'tracking',
    code: 'M4',
    label: 'Tracking & circulation',
    description: 'Issue, return and movement receipts',
    route: '/tracking',
  },
  {
    id: 'search',
    code: 'M5',
    label: 'Search & retrieval',
    description: 'Find any entry and open the linked document',
    route: '/search',
  },
  {
    id: 'audit',
    code: 'M6',
    label: 'Audit & compliance',
    description: 'Append-only log and deletion approvals',
    route: '/audit',
  },
  {
    id: 'reports',
    code: 'M7',
    label: 'Reporting & configuration',
    description: 'Report library, report builder, fields and lookup tables',
    route: '/reports',
  },
  {
    id: 'users',
    code: 'M8',
    label: 'Security & user administration',
    description: 'Authentication, authorisation queue and permission matrix',
    route: '/users',
  },
  {
    id: 'migration',
    code: 'M9',
    label: 'Data migration & exit',
    description: 'Document Warehouse migration run and data handback',
    route: '/migration',
  },
  {
    id: 'system',
    code: 'M10',
    label: 'System, licensing & continuity',
    description: 'Platform, licence terms, backup and recovery',
    route: '/system',
  },
  {
    id: 'checklist',
    code: '',
    label: 'Demo checklist',
    description: 'All 26 evaluation elements and where each is proven',
    route: '/checklist',
  },
];
console.log("hello")

export const CHECKLIST: ChecklistElement[] = [
  {
    number: 1,
    wording: 'Migrate all SABC server data',
    moduleId: 'migration',
    modules: ['migration'],
    proof: 'Run SABC-MIG-003: staged progress, reconciliation at variance 0, field mapping table.',
  },
  {
    number: 2,
    wording: 'Both file plans and sub-type folders',
    moduleId: 'file-plans',
    modules: ['file-plans'],
    proof: 'Corporate 2019 and Broadcast Operations 2023 plans, plus the superseded 2011 plan, with an expandable series tree.',
  },
  {
    number: 3,
    wording: 'Barcode carries document type and sub-type per series code',
    moduleId: 'capture',
    modules: ['capture', 'barcodes'],
    proof: 'The capture barcode preview lists symbology, series, type, sub-type and reference.',
  },
  {
    number: 4,
    wording: 'Document barcode linked to location and box barcode',
    moduleId: 'barcodes',
    modules: ['barcodes'],
    proof: 'Three-step linkage chain; scanning any of the three barcodes resolves the same chain.',
  },
  {
    number: 5,
    wording: 'Printable on adhesive paper',
    moduleId: 'barcodes',
    modules: ['barcodes'],
    proof: 'To-scale Avery L7161 sheet, 18 labels, print dialog for stock and margins.',
  },
  {
    number: 6,
    wording: 'Authorisation and authentication enforced',
    moduleId: 'users',
    modules: ['users'],
    proof: 'AD single sign-on with MFA on privileged roles, 15-minute idle lock, account lock after five failed attempts.',
  },
  {
    number: 7,
    wording: 'SABC controls all management aspects including new users',
    moduleId: 'users',
    modules: ['users'],
    proof: 'Pending-authorisation queue worked by an SABC administrator; vendor staff hold no standing production access.',
  },
  {
    number: 8,
    wording: 'Unauthorised access or modification prevented',
    moduleId: 'users',
    modules: ['users', 'audit'],
    proof: 'Delete attempted as a Clerk is blocked and written to the audit log as Blocked — admin only.',
  },
  {
    number: 9,
    wording: 'Movements tracked with origin, destination, user, date and time',
    moduleId: 'tracking',
    modules: ['tracking'],
    proof: 'Movement register filtered by division, vault row, user and date range.',
  },
  {
    number: 10,
    wording: 'New fields and reports without major programming cost',
    moduleId: 'reports',
    modules: ['reports'],
    proof: 'Add a field and publish it; the field appears on the capture form immediately.',
  },
  {
    number: 11,
    wording: 'Lookup tables, fast location, required reports',
    moduleId: 'search',
    modules: ['search', 'reports'],
    proof: 'Lookup-table manager and a search that reports its own result count and elapsed time.',
  },
  {
    number: 12,
    wording: 'Submit button generates the barcode',
    moduleId: 'capture',
    modules: ['capture', 'barcodes'],
    proof: 'Save entry & generate barcode: the barcode is produced on submit, not before.',
  },
  {
    number: 13,
    wording: 'Audit stores user details, date and time stamped',
    moduleId: 'audit',
    modules: ['audit'],
    proof: 'Append-only log with timestamp, user, role, action, object, workstation and result.',
  },
  {
    number: 14,
    wording: 'One document per entry',
    moduleId: 'capture',
    modules: ['capture'],
    proof: 'The attachment control accepts exactly one file and warns that replacing it is logged.',
  },
  {
    number: 15,
    wording: 'Unique reference number',
    moduleId: 'capture',
    modules: ['capture'],
    proof: 'Reference is generated and read-only; a deliberate duplicate attempt is rejected.',
  },
  {
    number: 16,
    wording: 'Only admins delete, and deletion is audited',
    moduleId: 'audit',
    modules: ['audit'],
    proof: 'Deletion request queue; approval removes the entry and writes an audit line that cannot be removed.',
  },
  {
    number: 17,
    wording: 'All entries searchable, linked document retrievable',
    moduleId: 'search',
    modules: ['search'],
    proof: 'Every result opens its linked document; off-site records raise a request receipt and a four-hour clock.',
  },
  {
    number: 18,
    wording: 'Proof of transaction on request and on return',
    moduleId: 'tracking',
    modules: ['tracking'],
    proof: 'Printable issue and return slips with barcode, item, recipient, timestamps and due-back date.',
  },
  {
    number: 19,
    wording: 'Import from scanner, upload documents and boxes',
    moduleId: 'capture',
    modules: ['capture'],
    proof: 'Import from scanner (Scanner 02, Records Room), upload a document, bulk box upload.',
  },
  {
    number: 20,
    wording: 'User reports and audit reports',
    moduleId: 'audit',
    modules: ['audit', 'reports'],
    proof: 'Report builder with report type, period and output format, including scheduled email.',
  },
  {
    number: 21,
    wording: 'Duplicate detection',
    moduleId: 'capture',
    modules: ['capture'],
    proof: 'Checksum and series match flagged against DOC-2025-118440 with Compare and Not a duplicate.',
  },
  {
    number: 22,
    wording: 'Windows-based, multi-user, network ready',
    moduleId: 'system',
    modules: ['system'],
    proof: 'Windows Server 2022 virtual, SQL Server 2022 Standard, tested to 120 concurrent users.',
  },
  {
    number: 23,
    wording: 'Licence type stated',
    moduleId: 'system',
    modules: ['system'],
    proof: 'Perpetual application licence, 50 named / 120 concurrent seats, annual renewable maintenance. Not subscription-based.',
  },
  {
    number: 24,
    wording: 'Full reporting capabilities',
    moduleId: 'reports',
    modules: ['reports'],
    proof: 'Standard report library of eight reports plus one rendered report with a chart and a table.',
  },
  {
    number: 25,
    wording: 'User management, admin management, access control',
    moduleId: 'users',
    modules: ['users'],
    proof: 'Role permission matrix across Administrator, Senior clerk, Clerk and Reader.',
  },
  {
    number: 26,
    wording: 'Backup and recovery',
    moduleId: 'system',
    modules: ['system'],
    proof: 'Nightly full backup, 15-minute log backups, RPO 15 minutes, RTO under 4 hours, evidenced restore tests.',
  },
];

export function elementsForModule(moduleId: ModuleId): number[] {
  return CHECKLIST.filter((e) => e.modules.includes(moduleId)).map((e) => e.number);
}

export function moduleById(moduleId: ModuleId): ModuleDef {
  const found = MODULES.find((m) => m.id === moduleId);
  if (!found) throw new Error(`Unknown module: ${moduleId}`);
  return found;
}
