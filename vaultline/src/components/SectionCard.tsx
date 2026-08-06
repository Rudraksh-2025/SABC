import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  dense?: boolean;
  id?: string;
  className?: string;
}

export function SectionCard({
  title,
  description,
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
            <Typography variant="h3">{title}</Typography>
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
