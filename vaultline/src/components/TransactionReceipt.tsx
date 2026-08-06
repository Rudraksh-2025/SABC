import { forwardRef } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import type { Movement } from '../types';
import { Barcode } from './Barcode';
import { mono, hairline } from '../theme';

export interface TransactionReceiptProps {
  movement: Movement | null;
  kind: 'Issue' | 'Return';
  /** Shown when there is nothing to print yet — written as an instruction. */
  emptyInstruction: string;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ py: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function stampOf(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, 'yyyy-MM-dd HH:mm');
}

export const TransactionReceipt = forwardRef<HTMLDivElement, TransactionReceiptProps>(
  function TransactionReceipt({ movement, kind, emptyInstruction }, ref) {
    if (!movement) {
      return (
        <Box
          ref={ref}
          sx={{
            border: `1px dashed ${hairline}`,
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            backgroundColor: '#FBF9F3',
          }}
        >
          <Typography variant="overline" color="text.secondary">
            {kind} receipt
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {emptyInstruction}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        ref={ref}
        sx={{
          border: `1px solid ${hairline}`,
          borderRadius: 1,
          p: 2.5,
          backgroundColor: '#FFFFFF',
          maxWidth: 420,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="overline" color="text.secondary">
              SABC VAULT — {kind.toLowerCase()} receipt
            </Typography>
            <Typography sx={{ fontFamily: mono, fontSize: '1rem', fontWeight: 600 }}>
              {movement.transaction}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
            Records Management
            <br />
            Radio Park, Auckland Park
          </Typography>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {movement.title}
        </Typography>
        <Line label="Reference" value={movement.reference} />
        <Line label="Action" value={movement.action} />
        <Line label="From" value={movement.origin} />
        <Line label="To" value={movement.destination} />
        <Line label="Recipient" value={`${movement.user} · ${movement.division}`} />
        <Line label={kind === 'Issue' ? 'Issued at' : 'Returned at'} value={stampOf(movement.at)} />
        <Line label="Due back" value={movement.dueBack ?? 'Not applicable'} />
        {kind === 'Return' && (
          <Line label="Return scanned" value={movement.returnedAt ? stampOf(movement.returnedAt) : 'Not scanned'} />
        )}

        <Divider sx={{ my: 1.5 }} />

        <Barcode value={movement.transaction} height={38} symbology="Symbology Code 128B" />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Signature on collection ____________________ &nbsp; Date ____________
        </Typography>
      </Box>
    );
  },
);
