import { Paper, Grid, Typography, Box } from '@mui/material';
import type { RevenueDrivers } from '../services/api';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RevenueDriversCardProps {
  data: RevenueDrivers | undefined;
}

const RevenueDriversCard = ({ data }: RevenueDriversCardProps) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 100, left: 60 };

    const chartData = [
      { label: 'Pipeline Size', value: data.pipeline_size / 1000, unit: 'K' },
      { label: 'Win Rate', value: data.win_rate, unit: '%' },
      { label: 'Avg Deal Size', value: data.average_deal_size / 1000, unit: 'K' },
      { label: 'Sales Cycle', value: data.sales_cycle_time, unit: 'd' },
    ];

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const maxValue = Math.max(...chartData.map(d => d.value));
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.2])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('width', width).attr('height', height);

    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'];

    svg.selectAll('rect')
      .data(chartData)
      .join('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.bottom - y(d.value))
      .attr('fill', (_d, i) => colors[i])
      .attr('rx', 4);

    svg.selectAll('.bar-label')
      .data(chartData)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(d => `${d.value.toFixed(1)}${d.unit}`);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(5);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .attr('font-size', '11px');

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

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Revenue Drivers
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Pipeline Size
            </Typography>
            <Typography variant="h5" color="primary">
              {formatCurrency(data.pipeline_size)}
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Win Rate
            </Typography>
            <Typography variant="h5" color="success.main">
              {data.win_rate.toFixed(1)}%
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Average Deal Size
            </Typography>
            <Typography variant="h5" color="warning.main">
              {formatCurrency(data.average_deal_size)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Sales Cycle Time
            </Typography>
            <Typography variant="h5" color="secondary.main">
              {data.sales_cycle_time.toFixed(0)} days
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <svg ref={chartRef}></svg>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RevenueDriversCard;
