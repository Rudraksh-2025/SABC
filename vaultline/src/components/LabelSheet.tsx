import { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Barcode } from './Barcode';
import { mono, hairline } from '../theme';

export interface LabelSpec {
  reference: string;
  seriesCode: string;
  documentType: string;
  subType: string;
  boxBarcode: string;
  locationBarcode: string;
}

export interface LabelSheetProps {
  labels: LabelSpec[];
  /** Avery L7161 is 3 across by 6 down: 63.5 mm x 46.6 mm labels on A4. */
  columns?: number;
  rows?: number;
  marginMm?: number;
  scale?: number;
}

export const LabelSheet = forwardRef<HTMLDivElement, LabelSheetProps>(function LabelSheet(
  { labels, columns = 3, rows = 6, marginMm = 8.7, scale = 1 },
  ref,
) {
  const slots = columns * rows;
  const cells = Array.from({ length: slots }, (_, i) => labels[i] ?? null);

  return (
    <Box
      ref={ref}
      sx={{
        width: `${210 * scale}mm`,
        maxWidth: '100%',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${hairline}`,
        borderRadius: 1,
        p: `${marginMm * scale}mm`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${2.5 * scale}mm`,
        }}
      >
        {cells.map((label, index) => (
          <Box
            key={index}
            sx={{
              border: `1px dashed ${label ? hairline : '#EDE8DA'}`,
              borderRadius: '3px',
              height: `${46.6 * scale}mm`,
              p: `${2.5 * scale}mm`,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            {label ? (
              <>
                <Box>
                  <Typography
                    sx={{ fontFamily: mono, fontSize: '0.5625rem', letterSpacing: '0.06em' }}
                    color="text.secondary"
                  >
                    SABC RECORDS — RADIO PARK
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      mt: '1mm',
                    }}
                  >
                    {label.seriesCode} · {label.documentType}
                  </Typography>
                  <Typography sx={{ fontSize: '0.625rem' }} color="text.secondary">
                    {label.subType}
                  </Typography>
                </Box>
                <Barcode value={label.reference} height={22 * scale} dense showValue />
                <Typography
                  sx={{ fontFamily: mono, fontSize: '0.5625rem' }}
                  color="text.secondary"
                >
                  {label.boxBarcode} · {label.locationBarcode}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{ fontFamily: mono, fontSize: '0.625rem', m: 'auto' }}
                color="text.secondary"
              >
                Empty slot
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
});
