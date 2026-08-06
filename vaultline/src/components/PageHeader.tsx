import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ElementBadge } from './ElementBadge';
import { elementsForModule } from '../data/checklist';
import type { ModuleId } from '../types';
import { mono } from '../theme';

export interface PageHeaderProps {
  moduleId: ModuleId;
  title: string;
  intro: string;
  action?: ReactNode;
}

export function PageHeader({ moduleId, title, intro, action }: PageHeaderProps) {
  const elements = elementsForModule(moduleId);

  return (
    <Box className="no-print" sx={{ pt: 3, pb: 2.5 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
      >
        <Box>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
            <Typography variant="overline" color="text.secondary">
              {elements.length > 0 ? 'Evaluation elements' : 'Module'}
            </Typography>
            {elements.map((n) => (
              <ElementBadge key={n} number={n} />
            ))}
          </Stack>
          <Typography variant="h1">{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820 }}>
            {intro}
          </Typography>
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ fontFamily: mono, fontSize: '0.8125rem' }}>
      {children}
    </Box>
  );
}
