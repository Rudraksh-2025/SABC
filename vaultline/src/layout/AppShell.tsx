import { useState } from 'react';
import { Alert, Box, Drawer, Snackbar, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useVault } from '../context/VaultStore';
import { ink } from '../theme';

const DRAWER_WIDTH = 264;

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { toast, dismissToast } = useVault();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar drawerWidth={DRAWER_WIDTH} onOpenNav={() => setNavOpen(true)} />

      <Box
        component="nav"
        className="no-print"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Modules"
      >
        <Drawer
          variant="temporary"
          open={navOpen}
          onClose={() => setNavOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: ink,
              borderRight: 'none',
            },
          }}
        >
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: ink,
              borderRight: 'none',
            },
          }}
        >
          <Sidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 1.75, sm: 2.5, lg: 3.5 },
          pb: 6,
        }}
      >
        <Toolbar className="no-print" sx={{ minHeight: { xs: 60, md: 64 } }} />
        <Outlet />
      </Box>

      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={5_000}
        onClose={dismissToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="no-print"
      >
        <Alert
          severity={toast?.severity ?? 'info'}
          variant="filled"
          onClose={dismissToast}
          sx={{ maxWidth: 560 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
