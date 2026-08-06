import { MenuItem, Select, Stack, Typography, type SelectChangeEvent } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useVault } from '../context/VaultStore';
import { ROLES } from '../data/users';
import type { Role } from '../types';
import { mono } from '../theme';

export function RoleSwitcher() {
  const { role, setRole, currentUser, notify } = useVault();

  const handleChange = (event: SelectChangeEvent<Role>) => {
    const next = event.target.value as Role;
    setRole(next);
    notify(`Signed in as ${next}. Permissions re-evaluated for this session.`, 'info');
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <BadgeOutlinedIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)' }} />
      <Stack sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Typography
          sx={{ fontFamily: mono, fontSize: '0.75rem', color: '#FFFFFF', lineHeight: 1.2 }}
        >
          {currentUser.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          {currentUser.division}
        </Typography>
      </Stack>
      <Select<Role>
        value={role}
        onChange={handleChange}
        size="small"
        inputProps={{ 'aria-label': 'Signed-in role' }}
        sx={{
          minWidth: { xs: 92, sm: 148 },
          color: '#FFFFFF',
          backgroundColor: 'rgba(255,255,255,0.06)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.22)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(228,166,43,0.6)' },
          '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
          fontWeight: 600,
          fontSize: '0.8125rem',
        }}
      >
        {ROLES.map((option) => (
          <MenuItem key={option} value={option} sx={{ fontSize: '0.8125rem' }}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
