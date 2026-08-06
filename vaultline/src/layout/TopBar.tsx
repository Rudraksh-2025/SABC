import { useState, type FormEvent } from 'react';
import {
  AppBar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useNavigate } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { ink, mono, teal } from '../theme';

export interface TopBarProps {
  drawerWidth: number;
  onOpenNav: () => void;
}

const BARCODE_PREFIXES = ['DOC-', 'BOX-', 'VLT-', 'TRX-'];

export function TopBar({ drawerWidth, onOpenNav }: TopBarProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    const isBarcode = BARCODE_PREFIXES.some((p) => value.toUpperCase().startsWith(p));
    navigate(
      isBarcode
        ? `/barcodes?scan=${encodeURIComponent(value)}`
        : `/search?q=${encodeURIComponent(value)}`,
    );
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      className="no-print"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        backgroundColor: ink,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 64 } }}>
        <IconButton
          onClick={onOpenNav}
          edge="start"
          aria-label="Open navigation"
          sx={{ color: '#FFFFFF', display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box component="form" onSubmit={submit} sx={{ flex: 1, minWidth: 0, maxWidth: 520 }}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or scan a reference, box or location barcode"
            inputProps={{ 'aria-label': 'Global search and scan field' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.55)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.07)',
                color: '#FFFFFF',
                fontFamily: mono,
                fontSize: '0.8125rem',
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.18)' },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(228,166,43,0.55)',
              },
              '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto' }}>
          <Tooltip title="Scanner 02, Records Room — connected and idle">
            <Chip
              icon={<QrCodeScannerIcon sx={{ fontSize: 16 }} />}
              label="Scanner ready"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                color: '#FFFFFF',
                backgroundColor: 'rgba(23,140,134,0.22)',
                border: `1px solid ${teal}`,
                '& .MuiChip-icon': { color: teal },
                fontFamily: mono,
                fontSize: '0.6875rem',
              }}
            />
          </Tooltip>
          <RoleSwitcher />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
