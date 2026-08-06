import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useVault } from '../context/VaultStore';
import { filePlans, plan2019Tree } from '../data/filePlans';
import type { PlanNode } from '../types';
import { hairline, mono } from '../theme';

function NodeLabel({ node }: { node: PlanNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ py: 0.4 }}>
      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 600 }}>
          {node.code}
        </Typography>
        <Typography variant="body2" noWrap>
          {node.label}
        </Typography>
      </Stack>
      <Typography
        sx={{ fontFamily: mono, fontSize: '0.6875rem', flexShrink: 0 }}
        color="text.secondary"
      >
        {node.entries.toLocaleString('en-ZA')}
      </Typography>
    </Stack>
  );
}

function renderNode(node: PlanNode) {
  return (
    <TreeItem key={node.code} itemId={node.code} label={<NodeLabel node={node} />}>
      {node.children?.map((child) => renderNode(child))}
    </TreeItem>
  );
}

export function FilePlans() {
  const { notify } = useVault();
  const [expanded, setExpanded] = useState<string[]>(['9', '9/1']);

  return (
    <Box>
      <PageHeader
        moduleId="file-plans"
        title="File plan management"
        intro="Two approved file plans are in use and the 2011 plan is retained read-only. Each series carries its sub-series and its sub-type folders, indexed under the NARSSA methodology."
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            {filePlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent sx={{ p: 2.25 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box>
                      <Typography variant="h4">{plan.name}</Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.75rem' }} color="text.secondary">
                        NARSSA ref. {plan.narssaRef}
                      </Typography>
                    </Box>
                    <Chip
                      label={plan.status}
                      size="small"
                      color={plan.status === 'Active' ? 'success' : 'default'}
                      variant={plan.status === 'Active' ? 'filled' : 'outlined'}
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {plan.note}
                  </Typography>

                  <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                    {[
                      ['Approved', plan.approved],
                      ['Series', plan.seriesCount.toLocaleString('en-ZA')],
                      ['Entries', plan.entryCount.toLocaleString('en-ZA')],
                    ].map(([label, value]) => (
                      <Box key={label}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {label}
                        </Typography>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.8125rem', fontWeight: 600 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{ mt: 1.5 }}
                    onClick={() =>
                      notify(
                        `${plan.name} would open from the SABC SharePoint document library. This prototype does not reach SharePoint.`,
                        'info',
                      )
                    }
                  >
                    Open PDF on SharePoint
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Corporate File Plan 2019 — series tree"
            elements={[2]}
            description="Series, sub-series and sub-type folders with the number of indexed entries filed under each."
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  onClick={() =>
                    setExpanded(
                      plan2019Tree.flatMap((n) => [n.code, ...(n.children?.map((c) => c.code) ?? [])]),
                    )
                  }
                >
                  Expand all
                </Button>
                <Button size="small" onClick={() => setExpanded([])}>
                  Collapse all
                </Button>
              </Stack>
            }
          >
            <Box
              sx={{
                border: `1px solid ${hairline}`,
                borderRadius: 1,
                p: 1,
                maxHeight: 620,
                overflowY: 'auto',
              }}
            >
              <SimpleTreeView
                expandedItems={expanded}
                onExpandedItemsChange={(_, items) => setExpanded(items)}
              >
                {plan2019Tree.map((node) => renderNode(node))}
              </SimpleTreeView>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Sub-type folders are the lowest level. A capture is filed to a sub-type folder, and the
              barcode carries that sub-type alongside the document type and the series code.
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
