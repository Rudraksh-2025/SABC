import type { Movement, MovementAction } from '../types';
import { entries } from './entries';

function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_103_515_245 + 12_345) >>> 0;
    return state / 4_294_967_296;
  };
}

const requesters = [
  { user: 'T. van Wyk', division: 'News & Current Affairs' as const, desk: 'News desk, 3rd floor' },
  { user: 'M. Dlamini', division: 'Human Capital' as const, desk: 'Human Capital, 2nd floor' },
  { user: 'L. Botha', division: 'Legal Services' as const, desk: 'Legal Services, 5th floor' },
  { user: 'P. Sithole', division: 'Company Secretariat' as const, desk: 'Secretariat, 6th floor' },
  { user: 'K. Naidoo', division: 'Finance' as const, desk: 'Finance, 4th floor' },
  { user: 'N. Mahlangu', division: 'Sales' as const, desk: 'Sales, 1st floor' },
];

const actions: MovementAction[] = ['Issued', 'Returned', 'Transferred', 'Off-site recall', 'Boxed'];

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

function buildMovements(): Movement[] {
  const rnd = makeRandom(88_214);
  const out: Movement[] = [];
  let trx = 88_100;

  for (let i = 0; i < 48; i += 1) {
    const entry = entries[(i * 7 + 3) % entries.length];
    const requester = requesters[Math.floor(rnd() * requesters.length)];
    const roll = rnd();
    let action: MovementAction = 'Issued';
    if (roll > 0.86) action = 'Transferred';
    else if (roll > 0.78) action = 'Off-site recall';
    else if (roll > 0.72) action = 'Boxed';
    else if (roll > 0.42) action = 'Returned';
    else action = actions[0];

    trx += 1 + Math.floor(rnd() * 3);
    const day = 6 - Math.floor(rnd() * 26);
    const at = new Date(2026, 7, day, 7 + Math.floor(rnd() * 10), Math.floor(rnd() * 60));
    const dueBack = new Date(at);
    dueBack.setDate(dueBack.getDate() + 14);

    const vaultRow = entry.locationBarcode.startsWith('VLT-')
      ? entry.locationBarcode.split('-')[1]
      : 'Off-site';

    const returned = action === 'Returned';
    const returnedAt = new Date(at);
    returnedAt.setHours(returnedAt.getHours() + 2 + Math.floor(rnd() * 40));

    const vaultLabel = `Vault ${entry.locationBarcode}`;

    out.push({
      id: `MV-${pad(i + 1, 3)}`,
      transaction: `TRX-${trx}`,
      reference: entry.reference,
      title: entry.title,
      action,
      origin:
        action === 'Returned'
          ? requester.desk
          : action === 'Off-site recall'
            ? 'Off-site store, Midrand'
            : vaultLabel,
      destination:
        action === 'Returned'
          ? vaultLabel
          : action === 'Boxed'
            ? `Box ${entry.boxBarcode}`
            : requester.desk,
      user: requester.user,
      division: requester.division,
      vaultRow,
      at: at.toISOString().slice(0, 19),
      dueBack: action === 'Issued' ? dueBack.toISOString().slice(0, 10) : null,
      returnedAt: returned ? returnedAt.toISOString().slice(0, 19) : null,
    });
  }

  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export const movements: Movement[] = buildMovements();

export const NEXT_TRANSACTION_SEED = 88_214;
