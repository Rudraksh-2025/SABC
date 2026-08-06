import { useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { printRegion } from '../components/print';
import { CHECKLIST, RFQ_REFERENCE, moduleById } from '../data/checklist';
import { mono, teal } from '../theme';

export function Checklist() {
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <Box>
      <PageHeader
        moduleId="checklist"
        title="Demo checklist"
        intro={`All 26 evaluation elements for ${RFQ_REFERENCE}, the module where each is demonstrated and whether the function is present. Follow this list during the demonstration; every row links to its module.`}
        action={
          <Button
            variant="outlined"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => printRegion(tableRef.current)}
          >
            Print the checklist
          </Button>
        }
      />

      <SectionCard
        title="Evaluation elements"
        description="Wording is the tender's own. Functional YES means the panel can see the function working in this session."
        action={
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
            label={`${CHECKLIST.length} of ${CHECKLIST.length} demonstrated`}
            size="small"
            sx={{ backgroundColor: 'rgba(23,140,134,0.14)', color: teal, fontFamily: mono }}
          />
        }
      >
        <Box ref={tableRef} sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 780 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 52 }}>No.</TableCell>
                <TableCell>Element as written in the tender</TableCell>
                <TableCell>Demonstrated in</TableCell>
                <TableCell sx={{ width: 120 }}>Functional</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {CHECKLIST.map((element) => {
                const module = moduleById(element.moduleId);
                return (
                  <TableRow key={element.number} hover>
                    <TableCell sx={{ fontFamily: mono, fontWeight: 600, verticalAlign: 'top' }}>
                      {element.number}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {element.wording}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {element.proof}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Stack spacing={0.5} alignItems="flex-start">
                        <Button
                          component={RouterLink}
                          to={module.route}
                          size="small"
                          sx={{ minWidth: 0, p: 0, fontSize: '0.8125rem' }}
                        >
                          {module.code ? `${module.code} ${module.label}` : module.label}
                        </Button>
                        {element.modules.length > 1 && (
                          <Typography variant="caption" color="text.secondary">
                            Also in{' '}
                            {element.modules
                              .filter((m) => m !== element.moduleId)
                              .map((m) => moduleById(m).label)
                              .join(', ')}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Chip
                        label="Functional YES"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(23,140,134,0.14)',
                          color: teal,
                          fontFamily: mono,
                          fontSize: '0.6875rem',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </SectionCard>
    </Box>
  );
}
