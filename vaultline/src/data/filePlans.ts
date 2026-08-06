import type { FilePlan, PlanNode } from '../types';

export const filePlans: FilePlan[] = [
  {
    id: 'FP-2019',
    name: 'Corporate File Plan 2019',
    narssaRef: 'NA/9/2/1-2019',
    status: 'Active',
    approved: '2019-07-01',
    seriesCount: 214,
    entryCount: 268_412,
    note: 'Governance, legal, human capital, finance and secretariat records.',
  },
  {
    id: 'FP-2023',
    name: 'Broadcast Operations File Plan 2023',
    narssaRef: 'NA/9/2/1-2023',
    status: 'Active',
    approved: '2023-04-03',
    seriesCount: 96,
    entryCount: 128_930,
    note: 'Programme contracts, rights, transmission and regulatory records.',
  },
  {
    id: 'FP-2011',
    name: 'Corporate File Plan 2011',
    narssaRef: 'NA/9/2/1-2011',
    status: 'Superseded',
    approved: '2011-02-15',
    seriesCount: 188,
    entryCount: 21_320,
    note: 'Read-only. Retained for records captured before 1 July 2019.',
  },
];

/** Series → sub-series → sub-type folders for Corporate File Plan 2019. */
export const plan2019Tree: PlanNode[] = [
  {
    code: '9',
    label: 'Governance & secretariat',
    entries: 41_208,
    children: [
      {
        code: '9/1',
        label: 'Board & committees',
        entries: 22_140,
        children: [
          { code: '9/1/3', label: 'Board & committee minutes', entries: 9_412 },
          { code: '9/1/4', label: 'Board resolutions', entries: 6_030 },
          { code: '9/1/5', label: 'Committee packs & agendas', entries: 6_698 },
        ],
      },
      {
        code: '9/2',
        label: 'Statutory returns',
        entries: 11_318,
        children: [
          { code: '9/2/1', label: 'Annual reports', entries: 2_204 },
          { code: '9/2/2', label: 'Parliamentary submissions', entries: 5_871 },
          { code: '9/2/3', label: 'Shareholder compact', entries: 3_243 },
        ],
      },
      {
        code: '9/3',
        label: 'Delegations of authority',
        entries: 7_750,
        children: [
          { code: '9/3/1', label: 'Signed delegations', entries: 4_120 },
          { code: '9/3/2', label: 'Authority registers', entries: 3_630 },
        ],
      },
    ],
  },
  {
    code: '4',
    label: 'Programme & content',
    entries: 62_884,
    children: [
      {
        code: '4/2',
        label: 'Contracts & rights',
        entries: 38_112,
        children: [
          { code: '4/2/1', label: 'Programme contracts', entries: 18_744 },
          { code: '4/2/2', label: 'Rights clearances', entries: 11_206 },
          { code: '4/2/3', label: 'Talent agreements', entries: 8_162 },
        ],
      },
      {
        code: '4/4',
        label: 'Commissioning',
        entries: 24_772,
        children: [
          { code: '4/4/1', label: 'Commissioning briefs', entries: 12_300 },
          { code: '4/4/2', label: 'Production schedules', entries: 12_472 },
        ],
      },
    ],
  },
  {
    code: '12',
    label: 'Human capital',
    entries: 74_611,
    children: [
      {
        code: '12/5',
        label: 'Personnel administration',
        entries: 51_402,
        children: [
          { code: '12/5/2', label: 'Employee records', entries: 28_940 },
          { code: '12/5/3', label: 'Disciplinary records', entries: 9_118 },
          { code: '12/5/6', label: 'Leave & attendance', entries: 13_344 },
        ],
      },
      {
        code: '12/8',
        label: 'Remuneration & benefits',
        entries: 23_209,
        children: [
          { code: '12/8/1', label: 'Payroll schedules', entries: 14_002 },
          { code: '12/8/4', label: 'Pension fund correspondence', entries: 9_207 },
        ],
      },
    ],
  },
  {
    code: '7',
    label: 'Legal & regulatory',
    entries: 48_320,
    children: [
      {
        code: '7/3',
        label: 'Regulatory affairs',
        entries: 27_118,
        children: [
          { code: '7/3/4', label: 'Licence & regulatory correspondence', entries: 13_650 },
          { code: '7/3/5', label: 'ICASA submissions', entries: 8_204 },
          { code: '7/3/9', label: 'Complaints & rulings', entries: 5_264 },
        ],
      },
      {
        code: '7/6',
        label: 'Litigation',
        entries: 21_202,
        children: [
          { code: '7/6/1', label: 'Case files', entries: 12_880 },
          { code: '7/6/2', label: 'Counsel opinions', entries: 8_322 },
        ],
      },
    ],
  },
  {
    code: '3',
    label: 'Finance',
    entries: 41_389,
    children: [
      {
        code: '3/1',
        label: 'Financial reporting',
        entries: 19_440,
        children: [
          { code: '3/1/2', label: 'Annual financial statements', entries: 4_118 },
          { code: '3/1/7', label: 'Audit working papers', entries: 15_322 },
        ],
      },
      {
        code: '3/5',
        label: 'Procurement',
        entries: 21_949,
        children: [
          { code: '3/5/1', label: 'Tender files', entries: 13_509 },
          { code: '3/5/4', label: 'Supplier contracts', entries: 8_440 },
        ],
      },
    ],
  },
];

export interface SeriesRef {
  code: string;
  label: string;
  planId: string;
}

export const seriesCatalogue: SeriesRef[] = [
  { code: '9/1/3', label: 'Board & committee minutes', planId: 'FP-2019' },
  { code: '9/1/4', label: 'Board resolutions', planId: 'FP-2019' },
  { code: '9/2/2', label: 'Parliamentary submissions', planId: 'FP-2019' },
  { code: '4/2/1', label: 'Programme contracts', planId: 'FP-2023' },
  { code: '4/2/2', label: 'Rights clearances', planId: 'FP-2023' },
  { code: '4/4/1', label: 'Commissioning briefs', planId: 'FP-2023' },
  { code: '12/5/2', label: 'Employee records', planId: 'FP-2019' },
  { code: '12/5/3', label: 'Disciplinary records', planId: 'FP-2019' },
  { code: '12/8/1', label: 'Payroll schedules', planId: 'FP-2019' },
  { code: '7/3/4', label: 'Licence & regulatory correspondence', planId: 'FP-2023' },
  { code: '7/6/1', label: 'Case files', planId: 'FP-2019' },
  { code: '3/1/7', label: 'Audit working papers', planId: 'FP-2019' },
  { code: '3/5/1', label: 'Tender files', planId: 'FP-2019' },
];
