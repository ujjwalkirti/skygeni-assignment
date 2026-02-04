import { Box, Typography } from '@mui/material';
import type { SummaryData } from '../services/api';

interface QTDRevenueBannerProps {
  data: SummaryData | undefined;
}

const QTDRevenueBanner = ({ data }: QTDRevenueBannerProps) => {
  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const gapPercentage = data.gap_percentage;
  const isNegative = gapPercentage > 0; // gap > 0 means behind target

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        color: 'white',
        p: 4,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, opacity: 0.9 }}>
          QTD Revenue:
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {formatCurrency(data.revenue)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
          Target:
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {formatCurrency(data.target)}
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: isNegative ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
          color: isNegative ? '#fecaca' : '#86efac',
          px: 3,
          py: 1.5,
          borderRadius: 1,
          border: isNegative ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {isNegative ? '-' : '+'}{Math.abs(gapPercentage).toFixed(0)}% to Goal
        </Typography>
      </Box>
    </Box>
  );
};

export default QTDRevenueBanner;
