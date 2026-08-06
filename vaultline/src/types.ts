export type Role = 'Administrator' | 'Senior clerk' | 'Clerk' | 'Reader';

export type Division =
  | 'News & Current Affairs'
  | 'Legal Services'
  | 'Human Capital'
  | 'Finance'
  | 'Company Secretariat'
  | 'Sales';

export type Classification = 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Key Point';

export type EntryStatus = 'In vault' | 'On loan' | 'Off-site' | 'In transit' | 'Under review';

export type Permission =
  | 'search'
  | 'openDocuments'
  | 'capture'
  | 'issueReceive'
  | 'amend'
  | 'printBarcodes'
  | 'delete'
  | 'authoriseUsers'
  | 'buildReports'
  | 'viewKeyPoint';

export interface Person {
  id: string;
  name: string;
  role: Role;
  division: Division | 'Records Management';
  email: string;
  status: 'Active' | 'Locked' | 'Awaiting authorisation' | 'Declined';
  lastSignIn: string | null;
  mfa: boolean;
  failedAttempts: number;
  seriesScope: string[];
  workstation: string;
}

export interface FilePlan {
  id: string;
  name: string;
  narssaRef: string;
  status: 'Active' | 'Superseded';
  approved: string;
  seriesCount: number;
  entryCount: number;
  note: string;
}

export interface PlanNode {
  code: string;
  label: string;
  entries: number;
  children?: PlanNode[];
}

export interface CustomField {
  id: string;
  label: string;
  type: 'Text' | 'Number' | 'Date' | 'List';
  appliesTo: string;
  required: boolean;
  publishedBy: string;
  publishedAt: string;
}

export interface IndexEntry {
  id: string;
  reference: string;
  title: string;
  seriesCode: string;
  seriesLabel: string;
  documentType: string;
  subType: string;
  division: Division;
  classification: Classification;
  filePlanId: string;
  boxBarcode: string;
  locationBarcode: string;
  status: EntryStatus;
  capturedBy: string;
  capturedAt: string;
  retentionCode: string;
  disposalDue: string;
  pages: number;
  checksum: string;
  documentName: string;
  holder: string | null;
  dueBack: string | null;
  custom: Record<string, string>;
}

export type MovementAction = 'Issued' | 'Returned' | 'Transferred' | 'Off-site recall' | 'Boxed';

export interface Movement {
  id: string;
  transaction: string;
  reference: string;
  title: string;
  action: MovementAction;
  origin: string;
  destination: string;
  user: string;
  division: Division;
  vaultRow: string;
  at: string;
  dueBack: string | null;
  returnedAt: string | null;
}

export type AuditResult = 'Success' | 'Blocked' | 'Warning';

export interface AuditRecord {
  id: string;
  at: string;
  user: string;
  role: Role;
  action: string;
  object: string;
  workstation: string;
  result: AuditResult;
  detail: string;
}

export interface DeletionRequest {
  id: string;
  reference: string;
  title: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  retentionExpired: boolean;
}

export interface ChecklistElement {
  number: number;
  /** Tender wording, verbatim. */
  wording: string;
  /** Module the panel is taken to for this element. */
  moduleId: ModuleId;
  /** Every module that carries evidence for this element; drives the sidebar badges. */
  modules: ModuleId[];
  proof: string;
}

export type ModuleId =
  | 'overview'
  | 'capture'
  | 'file-plans'
  | 'barcodes'
  | 'tracking'
  | 'search'
  | 'audit'
  | 'reports'
  | 'users'
  | 'migration'
  | 'system'
  | 'checklist';

export interface ModuleDef {
  id: ModuleId;
  code: string;
  label: string;
  description: string;
  route: string;
}

export interface LookupTable {
  id: string;
  name: string;
  values: number;
  owner: string;
  updated: string;
  sample: string[];
}

export interface MigrationStage {
  id: string;
  label: string;
  detail: string;
  progress: number;
  rows: string;
  state: 'Complete' | 'Running' | 'Queued';
}

export interface FieldMapping {
  source: string;
  target: string;
  transform: string;
  rows: string;
  status: 'Verified' | 'Verified with exceptions';
}

export interface StandardReport {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  formats: string[];
}
