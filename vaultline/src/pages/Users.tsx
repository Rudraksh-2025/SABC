import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useVault } from '../context/VaultStore';
import {
  PERMISSION_LABELS,
  ROLES,
  can,
  permissionMatrix,
  securityControls,
} from '../data/users';
import type { Permission } from '../types';
import { hairline, mono, teal, alert as alertRed } from '../theme';

const statusColour: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  Active: 'success',
  Locked: 'error',
  'Awaiting authorisation': 'warning',
  Declined: 'default',
};

export function Users() {
  const { users, role, authoriseUser, declineUser, unlockUser } = useVault();
  const [highlightRole, setHighlightRole] = useState<string | null>(null);

  const mayAuthorise = can(role, 'authoriseUsers');
  const pending = users.filter(
    (u) => u.status === 'Awaiting authorisation' || u.status === 'Locked',
  );

  return (
    <Box>
      <PageHeader
        moduleId="users"
        title="Security & user administration"
        intro="Accounts authenticate against the SABC domain. SABC administrators hold every management function, including creating and authorising users. The vendor holds no standing production access."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Authentication and authorisation"
            elements={[6]}
            description="Five controls apply to every session."
          >
            <Stack spacing={1.5}>
              {securityControls.map((control) => (
                <Stack key={control.title} direction="row" spacing={1.5} alignItems="flex-start">
                  <ShieldOutlinedIcon fontSize="small" sx={{ color: teal, mt: '2px' }} />
                  <Box>
                    <Typography variant="subtitle2">{control.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {control.detail}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Pending authorisation"
            elements={[7]}
            description="An SABC administrator authorises or declines every new account and reinstates locked accounts."
          >
            {!mayAuthorise && (
              <Alert severity="warning" icon={<LockOutlinedIcon />} sx={{ mb: 2 }}>
                You are signed in as {role}. Authorise and decline are disabled. Trying one is
                blocked and written to the audit log.
              </Alert>
            )}

            {pending.length === 0 ? (
              <Alert severity="success">
                Nothing is waiting. New account requests arrive here from the SABC service desk.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {pending.map((person) => (
                  <Box
                    key={person.id}
                    sx={{ border: `1px solid ${hairline}`, borderRadius: 1, p: 1.75 }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">{person.name}</Typography>
                          <Chip
                            label={person.status}
                            size="small"
                            color={statusColour[person.status]}
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {person.role} · {person.division}
                        </Typography>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }} color="text.secondary">
                          {person.email} · scope {person.seriesScope.join(', ')}
                        </Typography>
                        {person.status === 'Locked' && (
                          <Typography variant="caption" sx={{ color: alertRed }}>
                            Locked after {person.failedAttempts} failed sign-ins.
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0, height: 'fit-content' }}>
                        <Tooltip
                          title={
                            mayAuthorise
                              ? 'Grants access at the scope shown'
                              : 'Blocked — admin only. Only an SABC administrator authorises accounts.'
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              startIcon={<CheckIcon />}
                              onClick={() =>
                                person.status === 'Locked'
                                  ? unlockUser(person.id)
                                  : authoriseUser(person.id)
                              }
                            >
                              {person.status === 'Locked' ? 'Reinstate' : 'Authorise'}
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            mayAuthorise
                              ? 'The account holds no access'
                              : 'Blocked — admin only. Only an SABC administrator authorises accounts.'
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => declineUser(person.id)}
                            >
                              Decline
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              Vendor staff hold no standing production access. Support access is granted for a named
              incident, is time-boxed, and every action is on the audit log under the vendor account.
            </Alert>
          </SectionCard>
        </Grid>

        <Grid item xs={12}>
          <SectionCard
            title="Accounts"
            elements={[25, 8]}
            description={`${users.length} accounts shown from 34 active accounts in production.`}
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 820 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Division</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>MFA</TableCell>
                    <TableCell>Series scope</TableCell>
                    <TableCell>Workstation</TableCell>
                    <TableCell>Last sign-in</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((person) => (
                    <TableRow key={person.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{person.name}</TableCell>
                      <TableCell>{person.role}</TableCell>
                      <TableCell>{person.division}</TableCell>
                      <TableCell>
                        <Chip
                          label={person.status}
                          size="small"
                          color={statusColour[person.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono }}>{person.mfa ? 'Required' : '—'}</TableCell>
                      <TableCell sx={{ fontFamily: mono }}>{person.seriesScope.join(', ')}</TableCell>
                      <TableCell sx={{ fontFamily: mono }}>{person.workstation}</TableCell>
                      <TableCell sx={{ fontFamily: mono }}>
                        {person.lastSignIn ? person.lastSignIn.replace('T', ' ') : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12}>
          <SectionCard
            title="Role permission matrix"
            elements={[25, 8]}
            description="What each role may do. Your current role is highlighted; change it in the top bar and the screens change with it."
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Function</TableCell>
                    {ROLES.map((r) => (
                      <TableCell
                        key={r}
                        align="center"
                        onMouseEnter={() => setHighlightRole(r)}
                        onMouseLeave={() => setHighlightRole(null)}
                        sx={{
                          backgroundColor: r === role ? 'rgba(228,166,43,0.18)' : undefined,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {r}
                        {r === role && ' ●'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Object.keys(PERMISSION_LABELS) as Permission[]).map((permission) => (
                    <TableRow key={permission} hover>
                      <TableCell>{PERMISSION_LABELS[permission]}</TableCell>
                      {ROLES.map((r) => {
                        const allowed = permissionMatrix[r][permission];
                        return (
                          <TableCell
                            key={r}
                            align="center"
                            sx={{
                              backgroundColor:
                                r === role
                                  ? 'rgba(228,166,43,0.1)'
                                  : highlightRole === r
                                    ? '#FBF9F3'
                                    : undefined,
                            }}
                          >
                            {allowed ? (
                              <CheckIcon fontSize="small" sx={{ color: teal }} titleAccess="Allowed" />
                            ) : (
                              <CloseIcon
                                fontSize="small"
                                sx={{ color: alertRed, opacity: 0.7 }}
                                titleAccess="Not allowed"
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Key Point records are withheld from Clerk and Reader under the National Key Points Act.
              Employee records carrying personal information are scoped under POPIA.
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
