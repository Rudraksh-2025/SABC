import { Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import type { Movement } from '../types';
import { mono, hairline, teal, gold, ink } from '../theme';

export interface MovementTimelineProps {
  movements: Movement[];
  emptyInstruction: string;
}

const dotColour: Record<string, string> = {
  Issued: gold,
  Returned: teal,
  Transferred: ink,
  'Off-site recall': '#B8372C',
  Boxed: '#5A6274',
};

export function MovementTimeline({ movements, emptyInstruction }: MovementTimelineProps) {
  if (movements.length === 0) {
    return (
      <Box
        sx={{
          border: `1px dashed ${hairline}`,
          borderRadius: 1,
          p: 3,
          backgroundColor: '#FBF9F3',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {emptyInstruction}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 2.5 }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 5,
          top: 8,
          bottom: 8,
          width: '1px',
          backgroundColor: hairline,
        }}
      />
      <Stack spacing={2}>
        {movements.map((movement) => (
          <Box key={movement.id} sx={{ position: 'relative' }}>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: -20,
                top: 5,
                width: 11,
                height: 11,
                borderRadius: '50%',
                border: '2px solid #FFFFFF',
                backgroundColor: dotColour[movement.action] ?? ink,
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={movement.action} size="small" variant="outlined" />
              <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                {movement.transaction}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                {format(new Date(movement.at), 'yyyy-MM-dd HH:mm')}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 0.25 }}>
              {movement.origin} → {movement.destination}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {movement.user} · {movement.division}
              {movement.dueBack ? ` · due back ${movement.dueBack}` : ''}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
