import { Box, Divider, Stack, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { CHECKLIST, MODULES, RFQ_REFERENCE } from '../data/checklist';
import { Barcode } from '../components/Barcode';
import { gold, mono } from '../theme';
import type { ModuleDef } from '../types';

export interface SidebarProps {
  onNavigate?: () => void;
}

function ModuleLink({ module, onNavigate }: { module: ModuleDef; onNavigate?: () => void }) {
  const location = useLocation();
  const active =
    module.route === '/' ? location.pathname === '/' : location.pathname.startsWith(module.route);

  return (
    <Box
      component={NavLink}
      to={module.route}
      onClick={onNavigate}
      sx={{
        display: 'block',
        px: 1.5,
        py: 1.1,
        borderRadius: 1,
        textDecoration: 'none',
        borderLeft: '3px solid',
        borderColor: active ? gold : 'transparent',
        backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
        '&:focus-visible': { outline: `2px solid ${gold}`, outlineOffset: '-2px' },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ minWidth: 0 }}>
        {module.code && (
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.625rem',
              color: 'rgba(255,255,255,0.45)',
              width: 22,
              flexShrink: 0,
            }}
          >
            {module.code}
          </Typography>
        )}
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: active ? 700 : 600,
            color: active ? '#FFFFFF' : 'rgba(255,255,255,0.88)',
          }}
        >
          {module.label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: '0.6875rem',
          color: 'rgba(255,255,255,0.5)',
          mt: 0.25,
          ml: module.code ? '30px' : 0,
        }}
      >
        {module.description}
      </Typography>
    </Box>
  );
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const modules = MODULES.filter((m) => m.id !== 'checklist');
  const checklist = MODULES.find((m) => m.id === 'checklist');
  const location = useLocation();
  const checklistActive = location.pathname.startsWith('/checklist');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: '#FFFFFF' }}>
      <Box sx={{ px: 2, pt: 2.25, pb: 1.75 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
          SABC VAULT
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.55)', mb: 1.25 }}>
          Records management, archiving and tracking
        </Typography>
        <Barcode value="SABC-RECORDS-RADIO-PARK" height={22} dense showValue={false} />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1.25 }}>
        <Typography
          variant="overline"
          sx={{ color: 'rgba(255,255,255,0.4)', px: 1.5, display: 'block', mb: 0.5 }}
        >
          Modules
        </Typography>
        <Stack spacing={0.25}>
          {modules.map((module) => (
            <ModuleLink key={module.id} module={module} onNavigate={onNavigate} />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ px: 1, pt: 1.25, pb: 1.75 }}>
        {checklist && (
          <Box
            component={NavLink}
            to={checklist.route}
            onClick={onNavigate}
            sx={{
              display: 'block',
              px: 1.5,
              py: 1.1,
              borderRadius: 1,
              textDecoration: 'none',
              border: '1px solid',
              borderColor: checklistActive ? gold : 'rgba(228,166,43,0.35)',
              backgroundColor: checklistActive ? 'rgba(228,166,43,0.16)' : 'rgba(228,166,43,0.07)',
              '&:hover': { backgroundColor: 'rgba(228,166,43,0.18)' },
              '&:focus-visible': { outline: `2px solid ${gold}`, outlineOffset: '2px' },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                {checklist.label}
              </Typography>
              <Typography
                sx={{ fontFamily: mono, fontSize: '0.6875rem', color: gold, fontWeight: 600 }}
              >
                {CHECKLIST.length} of {CHECKLIST.length}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', mt: 0.25 }}>
              {checklist.description}
            </Typography>
          </Box>
        )}
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.625rem',
            color: 'rgba(255,255,255,0.42)',
            px: 1.5,
            pt: 1.25,
            letterSpacing: '0.04em',
          }}
        >
          {RFQ_REFERENCE}
        </Typography>
      </Box>
    </Box>
  );
}
