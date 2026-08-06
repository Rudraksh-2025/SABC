import { createTheme } from '@mui/material/styles';

export const ink = '#141C2B';
export const paper = '#F6F3EA';
export const gold = '#E4A62B';
export const teal = '#178C86';
export const alert = '#B8372C';
export const hairline = '#DED7C6';

export const mono = "'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

/**
 * Chart steps. Deeper than the UI gold and teal so the pair clears the chroma,
 * CVD-separation and 3:1 contrast checks against a white chart surface.
 */
export const chartGold = '#B8860B';
export const chartTeal = '#00897B';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, contrastText: '#FFFFFF' },
    secondary: { main: gold, contrastText: ink },
    success: { main: teal, contrastText: '#FFFFFF' },
    error: { main: alert },
    warning: { main: '#B77400' },
    info: { main: '#2E5A8A' },
    background: { default: paper, paper: '#FFFFFF' },
    text: { primary: ink, secondary: '#5A6274' },
    divider: hairline,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.125rem', fontWeight: 600 },
    h4: { fontSize: '1rem', fontWeight: 600 },
    h5: { fontSize: '0.9375rem', fontWeight: 600 },
    h6: { fontSize: '0.875rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 600 },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    overline: {
      fontFamily: mono,
      fontSize: '0.6875rem',
      fontWeight: 600,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': { colorScheme: 'light' },
        'html, body': { backgroundColor: paper, overflowX: 'hidden' },
        '*:focus-visible': {
          outline: `2px solid ${gold}`,
          outlineOffset: '2px',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
        '@media print': {
          '@page': { margin: '10mm' },
          'body.print-scoped': { backgroundColor: '#FFFFFF' },
          'body.print-scoped *': { visibility: 'hidden' },
          'body.print-scoped .print-target, body.print-scoped .print-target *': {
            visibility: 'visible',
          },
          'body.print-scoped .print-target': {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            margin: 0,
            border: 'none',
            boxShadow: 'none',
          },
          'body.print-scoped .no-print': { display: 'none !important' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: hairline },
      },
      defaultProps: { elevation: 0 },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { borderColor: hairline, boxShadow: '0 1px 2px rgba(20,28,43,0.05)' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6 },
        containedSecondary: { color: ink },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 600 },
        sizeSmall: { fontSize: '0.6875rem', height: 22 },
        outlined: { borderColor: hairline },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: hairline, fontSize: '0.8125rem' },
        head: {
          fontWeight: 700,
          fontSize: '0.6875rem',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: '#5A6274',
          backgroundColor: '#FBF9F3',
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: { tooltip: { fontSize: '0.75rem', backgroundColor: ink } },
    },
    MuiTabs: { styleOverrides: { root: { minHeight: 42 } } },
    MuiTab: {
      styleOverrides: { root: { minHeight: 42, textTransform: 'none', fontWeight: 600 } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 8, borderRadius: 4, backgroundColor: '#E7E2D5' } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

export const monoSx = { fontFamily: mono, fontSize: '0.8125rem' } as const;
