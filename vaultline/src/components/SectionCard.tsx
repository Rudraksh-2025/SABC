import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ElementBadge } from './ElementBadge';

export interface SectionCardProps {
  title: string;
  description?: string;
  elements?: number[];
  action?: ReactNode;
  children: ReactNode;
  dense?: boolean;
  id?: string;
  className?: string;
}

export function SectionCard({
  title,
  description,
  elements,
  action,
  children,
  dense = false,
  id,
  className,
}: SectionCardProps) {
  return (
    <Card id={id} className={className} sx={{ height: '100%' }}>
      <CardContent sx={{ p: dense ? 2 : 2.5, pb: 1.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h3">{title}</Typography>
              {elements?.map((n) => <ElementBadge key={n} number={n} />)}
            </Stack>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 760 }}>
                {description}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
      </CardContent>
      <Divider />
      <CardContent sx={{ p: dense ? 2 : 2.5 }}>{children}</CardContent>
    </Card>
  );
}
