import { Box, Typography } from '@mui/material';
import { mono } from '../theme';

export interface BarcodeProps {
  value: string;
  height?: number;
  showValue?: boolean;
  /** Symbology label printed under the bars. Code 128B throughout. */
  symbology?: string;
  dense?: boolean;
}

/** Stable hash so the same reference always draws the same bars. */
function hash(value: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

interface Segment {
  flex: number;
  bar: number;
  gap: number;
}

function segments(value: string, count: number): Segment[] {
  let h = hash(value);
  const out: Segment[] = [];
  for (let i = 0; i < count; i += 1) {
    h = (h * 1_664_525 + 1_013_904_223) >>> 0;
    const a = (h >>> 4) % 3;
    const b = (h >>> 12) % 3;
    out.push({ flex: 1 + a, bar: 1 + a, gap: 1 + b });
  }
  return out;
}

/**
 * Barcodes are drawn as CSS stripes. They are a visual representation, not a
 * scannable Code 128 encoding — see the "what is simulated" note in the README.
 */
export function Barcode({
  value,
  height = 44,
  showValue = true,
  symbology,
  dense = false,
}: BarcodeProps) {
  const parts = segments(value, dense ? 18 : 30);

  return (
    <Box>
      <Box
        aria-label={`Barcode for ${value}`}
        role="img"
        sx={{
          display: 'flex',
          height,
          border: '1px solid #E7E2D5',
          backgroundColor: '#FFFFFF',
          px: 0.75,
          py: 0.5,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {parts.map((segment, index) => (
          <Box
            key={index}
            sx={{
              flex: segment.flex,
              backgroundImage: `repeating-linear-gradient(90deg, #141C2B 0 ${segment.bar}px, transparent ${segment.bar}px ${segment.bar + segment.gap}px)`,
            }}
          />
        ))}
      </Box>
      {showValue && (
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: dense ? '0.6875rem' : '0.75rem',
            letterSpacing: '0.08em',
            mt: 0.5,
            color: 'text.primary',
          }}
        >
          {value}
        </Typography>
      )}
      {symbology && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {symbology}
        </Typography>
      )}
    </Box>
  );
}
