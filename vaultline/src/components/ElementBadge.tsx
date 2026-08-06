import { Box, Tooltip } from '@mui/material';
import { CHECKLIST } from '../data/checklist';
import { mono, gold, ink } from '../theme';

export interface ElementBadgeProps {
  number: number;
  tone?: 'light' | 'dark';
}

/** The small numbered chip that ties a screen back to a tender element. */
export function ElementBadge({ number, tone = 'light' }: ElementBadgeProps) {
  const element = CHECKLIST.find((e) => e.number === number);
  const label = element ? `Element ${number}: ${element.wording}` : `Element ${number}`;

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        aria-label={label}
        sx={{
          fontFamily: mono,
          fontSize: '0.6875rem',
          fontWeight: 600,
          lineHeight: 1,
          px: 0.75,
          py: '3px',
          borderRadius: '4px',
          border: '1px solid',
          borderColor: tone === 'dark' ? 'rgba(228,166,43,0.45)' : gold,
          color: tone === 'dark' ? gold : ink,
          backgroundColor: tone === 'dark' ? 'rgba(228,166,43,0.12)' : 'rgba(228,166,43,0.18)',
          whiteSpace: 'nowrap',
        }}
      >
        {number}
      </Box>
    </Tooltip>
  );
}
