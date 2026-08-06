import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { theme } from './theme';
import { VaultProvider } from './context/VaultStore';
import { AppShell } from './layout/AppShell';
import { Overview } from './pages/Overview';
import { Capture } from './pages/Capture';
import { FilePlans } from './pages/FilePlans';
import { Barcodes } from './pages/Barcodes';
import { Tracking } from './pages/Tracking';
import { Search } from './pages/Search';
import { Audit } from './pages/Audit';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Migration } from './pages/Migration';
import { System } from './pages/System';
import { Checklist } from './pages/Checklist';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VaultProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Overview />} />
              <Route path="/capture" element={<Capture />} />
              <Route path="/file-plans" element={<FilePlans />} />
              <Route path="/barcodes" element={<Barcodes />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/search" element={<Search />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/migration" element={<Migration />} />
              <Route path="/system" element={<System />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VaultProvider>
    </ThemeProvider>
  );
}
