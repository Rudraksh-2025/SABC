import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuditRecord,
  AuditResult,
  CustomField,
  DeletionRequest,
  IndexEntry,
  Movement,
  Person,
  Role,
} from '../types';
import { entries as seedEntries } from '../data/entries';
import { movements as seedMovements, NEXT_TRANSACTION_SEED } from '../data/movements';
import { auditLog as seedAudit, deletionRequests as seedDeletions } from '../data/auditLog';
import { users as seedUsers, can } from '../data/users';

export interface CaptureInput {
  title: string;
  seriesCode: string;
  seriesLabel: string;
  documentType: string;
  subType: string;
  division: IndexEntry['division'];
  classification: IndexEntry['classification'];
  filePlanId: string;
  boxBarcode: string;
  locationBarcode: string;
  retentionCode: string;
  documentName: string;
  pages: number;
  custom: Record<string, string>;
}

export interface IssueInput {
  reference: string;
  recipient: string;
  division: IndexEntry['division'];
  destination: string;
  dueBack: string;
}

export interface Toast {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  key: number;
}

interface VaultContextValue {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: Person;
  workstation: string;

  entries: IndexEntry[];
  movements: Movement[];
  audit: AuditRecord[];
  users: Person[];
  fields: CustomField[];
  deletions: DeletionRequest[];

  toast: Toast | null;
  notify: (message: string, severity: Toast['severity']) => void;
  dismissToast: () => void;

  nextReference: () => string;
  referenceExists: (reference: string) => boolean;

  logAudit: (input: {
    action: string;
    object: string;
    result: AuditResult;
    detail: string;
  }) => void;

  captureEntry: (input: CaptureInput) => IndexEntry;
  issueFile: (input: IssueInput) => Movement;
  returnFile: (transaction: string) => Movement | null;
  approveDeletion: (id: string) => void;
  declineDeletion: (id: string) => void;
  requestDeletion: (reference: string, reason: string) => boolean;
  authoriseUser: (id: string) => void;
  declineUser: (id: string) => void;
  unlockUser: (id: string) => void;
  publishField: (input: Omit<CustomField, 'id' | 'publishedBy' | 'publishedAt'>) => CustomField;
}

const VaultContext = createContext<VaultContextValue | null>(null);

const ROLE_TO_USER: Record<Role, string> = {
  Administrator: 'U-001',
  'Senior clerk': 'U-002',
  Clerk: 'U-003',
  Reader: 'U-005',
};

function stamp(): string {
  return new Date().toISOString().slice(0, 19);
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('Administrator');
  const [entries, setEntries] = useState<IndexEntry[]>(seedEntries);
  const [movements, setMovements] = useState<Movement[]>(seedMovements);
  const [audit, setAudit] = useState<AuditRecord[]>(seedAudit);
  const [users, setUsers] = useState<Person[]>(seedUsers);
  const [fields, setFields] = useState<CustomField[]>([
    {
      id: 'CF-001',
      label: 'Rights expiry date',
      type: 'Date',
      appliesTo: '4/2/2',
      required: false,
      publishedBy: 'N. Mahlangu',
      publishedAt: '2026-08-05T09:47:44',
    },
  ]);
  const [deletions, setDeletions] = useState<DeletionRequest[]>(seedDeletions);
  const [toast, setToast] = useState<Toast | null>(null);
  const [refCounter, setRefCounter] = useState(4_131);
  const [trxCounter, setTrxCounter] = useState(NEXT_TRANSACTION_SEED);

  const currentUser = useMemo(
    () => users.find((u) => u.id === ROLE_TO_USER[role]) ?? users[0],
    [users, role],
  );
  const workstation = currentUser.workstation;

  const notify = useCallback((message: string, severity: Toast['severity']) => {
    setToast({ message, severity, key: Date.now() });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const logAudit = useCallback(
    (input: { action: string; object: string; result: AuditResult; detail: string }) => {
      setAudit((prev) => [
        {
          id: `A-${pad(500 + prev.length, 4)}`,
          at: stamp(),
          user: currentUser.name,
          role: currentUser.role,
          workstation: currentUser.workstation,
          ...input,
        },
        ...prev,
      ]);
    },
    [currentUser],
  );

  const setRole = useCallback(
    (next: Role) => {
      setRoleState(next);
      const person = users.find((u) => u.id === ROLE_TO_USER[next]);
      setAudit((prev) => [
        {
          id: `A-${pad(500 + prev.length, 4)}`,
          at: stamp(),
          user: person?.name ?? 'Unknown',
          role: next,
          action: 'Role switched',
          object: `Session as ${next}`,
          workstation: person?.workstation ?? 'RP-REC-14',
          result: 'Success',
          detail: 'Demonstration role switch. Permissions re-evaluated for the session.',
        },
        ...prev,
      ]);
    },
    [users],
  );

  const nextReference = useCallback(() => `DOC-2026-${pad(refCounter, 6)}`, [refCounter]);

  const referenceExists = useCallback(
    (reference: string) => entries.some((e) => e.reference === reference),
    [entries],
  );

  const captureEntry = useCallback(
    (input: CaptureInput): IndexEntry => {
      const reference = `DOC-2026-${pad(refCounter, 6)}`;
      const entry: IndexEntry = {
        id: `E-N${pad(refCounter, 6)}`,
        reference,
        title: input.title,
        seriesCode: input.seriesCode,
        seriesLabel: input.seriesLabel,
        documentType: input.documentType,
        subType: input.subType,
        division: input.division,
        classification: input.classification,
        filePlanId: input.filePlanId,
        boxBarcode: input.boxBarcode,
        locationBarcode: input.locationBarcode,
        status: 'In vault',
        capturedBy: currentUser.name,
        capturedAt: stamp(),
        retentionCode: input.retentionCode,
        disposalDue: `${2026 + (input.retentionCode === 'RS-PERM' ? 99 : Number.parseInt(input.retentionCode.replace('RS-', ''), 10) || 7)}-08-06`,
        pages: input.pages,
        checksum: `sha256:${pad(Math.floor(Math.random() * 999_999_999), 9)}`,
        documentName: input.documentName || `${reference}.pdf`,
        holder: null,
        dueBack: null,
        custom: input.custom,
      };
      setEntries((prev) => [entry, ...prev]);
      setRefCounter((c) => c + 1);
      logAudit({
        action: 'Entry captured',
        object: reference,
        result: 'Success',
        detail: `Series ${input.seriesCode}, ${input.documentType} / ${input.subType}. One document attached, barcode generated.`,
      });
      return entry;
    },
    [refCounter, currentUser, logAudit],
  );

  const issueFile = useCallback(
    (input: IssueInput): Movement => {
      const entry = entries.find((e) => e.reference === input.reference);
      const transaction = `TRX-${trxCounter}`;
      const movement: Movement = {
        id: `MV-N${trxCounter}`,
        transaction,
        reference: input.reference,
        title: entry?.title ?? input.reference,
        action: 'Issued',
        origin: `Vault ${entry?.locationBarcode ?? 'VLT-A-R12-S03'}`,
        destination: input.destination,
        user: input.recipient,
        division: input.division,
        vaultRow: entry?.locationBarcode.split('-')[1] ?? 'A',
        at: stamp(),
        dueBack: input.dueBack,
        returnedAt: null,
      };
      setMovements((prev) => [movement, ...prev]);
      setTrxCounter((c) => c + 1);
      setEntries((prev) =>
        prev.map((e) =>
          e.reference === input.reference
            ? { ...e, status: 'On loan', holder: input.recipient, dueBack: input.dueBack }
            : e,
        ),
      );
      logAudit({
        action: 'File issued',
        object: `${transaction} / ${input.reference}`,
        result: 'Success',
        detail: `Issued to ${input.recipient}, ${input.division}. Due back ${input.dueBack}.`,
      });
      return movement;
    },
    [entries, trxCounter, logAudit],
  );

  const returnFile = useCallback(
    (transaction: string): Movement | null => {
      const original = movements.find((m) => m.transaction === transaction);
      if (!original) return null;
      const entry = entries.find((e) => e.reference === original.reference);
      const returnTransaction = `TRX-${trxCounter}`;
      const movement: Movement = {
        id: `MV-N${trxCounter}`,
        transaction: returnTransaction,
        reference: original.reference,
        title: original.title,
        action: 'Returned',
        origin: original.destination,
        destination: `Vault ${entry?.locationBarcode ?? 'VLT-A-R12-S03'}`,
        user: original.user,
        division: original.division,
        vaultRow: original.vaultRow,
        at: stamp(),
        dueBack: null,
        returnedAt: stamp(),
      };
      setMovements((prev) =>
        [movement, ...prev].map((m) =>
          m.transaction === transaction ? { ...m, returnedAt: stamp() } : m,
        ),
      );
      setTrxCounter((c) => c + 1);
      setEntries((prev) =>
        prev.map((e) =>
          e.reference === original.reference
            ? { ...e, status: 'In vault', holder: null, dueBack: null }
            : e,
        ),
      );
      logAudit({
        action: 'File returned',
        object: `${returnTransaction} / ${original.reference}`,
        result: 'Success',
        detail: `Returned by ${original.user}. Re-shelved at ${entry?.locationBarcode ?? 'VLT-A-R12-S03'}.`,
      });
      return movement;
    },
    [movements, entries, trxCounter, logAudit],
  );

  const approveDeletion = useCallback(
    (id: string) => {
      const request = deletions.find((d) => d.id === id);
      if (!request) return;
      if (!can(role, 'delete')) {
        logAudit({
          action: 'Delete attempted',
          object: request.reference,
          result: 'Blocked',
          detail: 'Blocked — admin only. Deletion is reserved to the Administrator role.',
        });
        notify('Blocked — admin only. The attempt is written to the audit log.', 'error');
        return;
      }
      setDeletions((prev) => prev.filter((d) => d.id !== id));
      setEntries((prev) => prev.filter((e) => e.reference !== request.reference));
      logAudit({
        action: 'Deletion approved',
        object: request.reference,
        result: 'Success',
        detail: `${request.reason} Entry removed from the index. This audit line cannot be removed.`,
      });
      notify(`Deletion approved. ${request.reference} removed and the audit line written.`, 'success');
    },
    [deletions, role, logAudit, notify],
  );

  const declineDeletion = useCallback(
    (id: string) => {
      const request = deletions.find((d) => d.id === id);
      if (!request) return;
      if (!can(role, 'delete')) {
        logAudit({
          action: 'Delete decision attempted',
          object: request.reference,
          result: 'Blocked',
          detail: 'Blocked — admin only. Deletion decisions are reserved to the Administrator role.',
        });
        notify('Blocked — admin only. The attempt is written to the audit log.', 'error');
        return;
      }
      setDeletions((prev) => prev.filter((d) => d.id !== id));
      logAudit({
        action: 'Deletion declined',
        object: request.reference,
        result: 'Success',
        detail: 'Request declined. The entry stays in the index.',
      });
      notify(`Deletion declined. ${request.reference} stays in the index.`, 'info');
    },
    [deletions, role, logAudit, notify],
  );

  const requestDeletion = useCallback(
    (reference: string, reason: string): boolean => {
      const entry = entries.find((e) => e.reference === reference);
      if (!entry) return false;
      if (!can(role, 'delete')) {
        logAudit({
          action: 'Delete attempted',
          object: reference,
          result: 'Blocked',
          detail: 'Blocked — admin only. Deletion is reserved to the Administrator role.',
        });
        notify('Blocked — admin only. The attempt is written to the audit log.', 'error');
        return false;
      }
      setDeletions((prev) => [
        {
          id: `DR-${pad(20 + prev.length, 3)}`,
          reference,
          title: entry.title,
          requestedBy: currentUser.name,
          requestedAt: stamp(),
          reason,
          retentionExpired: false,
        },
        ...prev,
      ]);
      logAudit({
        action: 'Deletion requested',
        object: reference,
        result: 'Success',
        detail: reason,
      });
      notify(`Deletion requested for ${reference}. It is queued for approval.`, 'info');
      return true;
    },
    [entries, role, currentUser, logAudit, notify],
  );

  const authoriseUser = useCallback(
    (id: string) => {
      const person = users.find((u) => u.id === id);
      if (!person) return;
      if (!can(role, 'authoriseUsers')) {
        logAudit({
          action: 'User authorisation attempted',
          object: `Account ${person.name}`,
          result: 'Blocked',
          detail: 'Blocked — admin only. Only an SABC administrator authorises accounts.',
        });
        notify('Blocked — admin only. The attempt is written to the audit log.', 'error');
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'Active', failedAttempts: 0 } : u)),
      );
      logAudit({
        action: 'User authorised',
        object: `Account ${person.name}`,
        result: 'Success',
        detail: `Scope set to ${person.seriesScope.join(', ')}. Key Point records withheld unless the role allows it.`,
      });
      notify(`${person.name} authorised. The account can sign in.`, 'success');
    },
    [users, role, logAudit, notify],
  );

  const declineUser = useCallback(
    (id: string) => {
      const person = users.find((u) => u.id === id);
      if (!person) return;
      if (!can(role, 'authoriseUsers')) {
        notify('Blocked — admin only. The attempt is written to the audit log.', 'error');
        logAudit({
          action: 'User authorisation attempted',
          object: `Account ${person.name}`,
          result: 'Blocked',
          detail: 'Blocked — admin only. Only an SABC administrator authorises accounts.',
        });
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'Declined' } : u)));
      logAudit({
        action: 'User declined',
        object: `Account ${person.name}`,
        result: 'Success',
        detail: 'Request declined. The account holds no access.',
      });
      notify(`${person.name} declined. The account holds no access.`, 'info');
    },
    [users, role, logAudit, notify],
  );

  const unlockUser = useCallback(
    (id: string) => {
      const person = users.find((u) => u.id === id);
      if (!person) return;
      if (!can(role, 'authoriseUsers')) {
        notify('Blocked — admin only. The attempt is written to the audit log.', 'error');
        logAudit({
          action: 'Account reinstatement attempted',
          object: `Account ${person.name}`,
          result: 'Blocked',
          detail: 'Blocked — admin only. Only an SABC administrator reinstates a locked account.',
        });
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'Active', failedAttempts: 0 } : u)),
      );
      logAudit({
        action: 'Account reinstated',
        object: `Account ${person.name}`,
        result: 'Success',
        detail: 'Failed sign-in counter reset to zero.',
      });
      notify(`${person.name} reinstated. The failed sign-in counter is reset.`, 'success');
    },
    [users, role, logAudit, notify],
  );

  const publishField = useCallback(
    (input: Omit<CustomField, 'id' | 'publishedBy' | 'publishedAt'>): CustomField => {
      const field: CustomField = {
        ...input,
        id: `CF-${pad(fields.length + 2, 3)}`,
        publishedBy: currentUser.name,
        publishedAt: stamp(),
      };
      setFields((prev) => [...prev, field]);
      logAudit({
        action: 'Field published',
        object: `Field: ${input.label}`,
        result: 'Success',
        detail: `Applies to series ${input.appliesTo}. Available on the capture form immediately.`,
      });
      return field;
    },
    [fields, currentUser, logAudit],
  );

  const value = useMemo<VaultContextValue>(
    () => ({
      role,
      setRole,
      currentUser,
      workstation,
      entries,
      movements,
      audit,
      users,
      fields,
      deletions,
      toast,
      notify,
      dismissToast,
      nextReference,
      referenceExists,
      logAudit,
      captureEntry,
      issueFile,
      returnFile,
      approveDeletion,
      declineDeletion,
      requestDeletion,
      authoriseUser,
      declineUser,
      unlockUser,
      publishField,
    }),
    [
      role,
      setRole,
      currentUser,
      workstation,
      entries,
      movements,
      audit,
      users,
      fields,
      deletions,
      toast,
      notify,
      dismissToast,
      nextReference,
      referenceExists,
      logAudit,
      captureEntry,
      issueFile,
      returnFile,
      approveDeletion,
      declineDeletion,
      requestDeletion,
      authoriseUser,
      declineUser,
      unlockUser,
      publishField,
    ],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used inside VaultProvider');
  return ctx;
}
