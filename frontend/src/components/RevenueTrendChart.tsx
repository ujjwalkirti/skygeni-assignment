import { Paper, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RevenueTrendChart = () => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 250;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };

    // Sample data for 6 months (Oct-Mar)
    const data = [
      { month: 'Oct', revenue: 228374, target: 228374 },
      { month: 'Nov', revenue: 187641, target: 187641 },
      { month: 'Dec', revenue: 214840, target: 214840 },
      { month: 'Jan', revenue: 181715, target: 181715 },
      { month: 'Feb', revenue: 207359, target: 207359 },
      { month: 'Mar', revenue: 244409, target: 244409 },
    ];

    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const maxValue = d3.max(data, d => Math.max(d.revenue, d.target))!;
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('width', width).attr('height', height);

    // Draw bars
    svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.month)!)
      .attr('y', d => y(d.revenue))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.bottom - y(d.revenue))
      .attr('fill', '#3b82f6')
      .attr('rx', 4);

    // Draw line for target
    const line = d3.line<typeof data[0]>()
      .x(d => x(d.month)! + x.bandwidth() / 2)
      .y(d => y(d.target))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#fb923c')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Draw dots on line
    svg.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.month)! + x.bandwidth() / 2)
      .attr('cy', d => y(d.target))
      .attr('r', 4)
      .attr('fill', '#fb923c')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('color', '#64748b');

    // Y axis
    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => `${(+d / 1000).toFixed(0)}K`);

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('color', '#64748b');

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '2,2');

  }, []);

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Revenue Trend (Last 6 Months)
      </Typography>
      <svg ref={chartRef}></svg>
    </Paper>
  );
};

export default RevenueTrendChart;
