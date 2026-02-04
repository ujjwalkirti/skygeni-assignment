import { Paper, Typography, Box, Chip, Divider, Card } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { SummaryData } from '../services/api';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SummaryCardProps {
  data: SummaryData | undefined;
}

const SummaryCard = ({ data }: SummaryCardProps) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const parentWidth = chartRef.current.parentElement?.clientWidth || 400;
    const width = parentWidth;
    const parentHeight = chartRef.current.parentElement?.clientHeight || 200;
    const height = parentHeight;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const chartData = [
      { label: 'Revenue', value: data.revenue, color: '#3b82f6' },
      { label: 'Target', value: data.target, color: '#f97316' },
    ];

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, Math.max(data.revenue, data.target) * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('width', '100%').attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('rect')
      .data(chartData)
      .join('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.bottom - y(d.value))
      .attr('fill', d => d.color)
      .attr('rx', 4);

    svg.selectAll('.bar-label')
      .data(chartData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => `$${(d.value / 1000).toFixed(0)}K`);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `$${(+d / 1000).toFixed(0)}K`);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr('font-size', '12px');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .attr('font-size', '12px');

  }, [data]);

  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const isOnTarget = data.gap <= 0;
  const isQoQPositive = data.qoq_change >= 0;

  return (
    <Paper elevation={1} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Quarterly Summary
      </Typography>
      <Divider sx={{ my: 1 }} />

      {/* Data Row */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            Current Revenue
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2563eb' }}>
            {formatCurrency(data.revenue)}
          </Typography>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            Target
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatCurrency(data.target)}
          </Typography>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            Gap
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h5" sx={{ fontWeight: 700 }} color={isOnTarget ? 'success.main' : 'error.main'}>
              {formatCurrency(Math.abs(data.gap))}
            </Typography>
            <Chip
              label={formatPercentage(Math.abs(data.gap_percentage))}
              color={isOnTarget ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            Quarter-over-Quarter
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h5" sx={{ fontWeight: 700 }} color={isQoQPositive ? 'success.main' : 'error.main'}>
              {formatCurrency(Math.abs(data.qoq_change))}
            </Typography>
            {isQoQPositive ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
            <Chip
              label={formatPercentage(data.qoq_change_percentage)}
              color={isQoQPositive ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Card>
      </Box>

      {/* Full-width Chart */}
      <Box sx={{ width: '100%', height: 250 }}>
        <svg ref={chartRef} style={{ display: 'block' }}></svg>
      </Box>
    </Paper>
  );
};

export default SummaryCard;
