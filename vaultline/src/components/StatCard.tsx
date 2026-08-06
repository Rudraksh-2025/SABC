import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { mono } from '../theme';

export interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
  tone?: 'default' | 'alert' | 'gold' | 'teal';
}

const toneColor: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: '#141C2B',
  alert: '#B8372C',
  gold: '#B77400',
  teal: '#178C86',
};

export function StatCard({ label, value, detail, icon, tone = 'default' }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {icon && <Box sx={{ color: toneColor[tone], display: 'flex' }}>{icon}</Box>}
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.1,
            color: toneColor[tone],
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {detail}
        </Typography>
      </CardContent>
    </Card>
  );
}
