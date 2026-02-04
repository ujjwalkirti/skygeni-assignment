import { Paper, Typography, Box, Divider } from "@mui/material";
import type { RevenueDrivers } from "../services/api";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface RevenueDriversCompactProps {
	data: RevenueDrivers | undefined;
}

const RevenueDriversCompact = ({ data }: RevenueDriversCompactProps) => {
	const sparkline1Ref = useRef<SVGSVGElement>(null);
	const sparkline2Ref = useRef<SVGSVGElement>(null);
	const sparkline3Ref = useRef<SVGSVGElement>(null);
	const sparkline4Ref = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!data) return;

		// Generate sample trend data (in production, this would come from API)
		const generateTrendData = (baseValue: number, trend: number) => {
			const points = [];
			for (let i = 0; i < 12; i++) {
				const variation = (Math.random() - 0.5) * 0.1 * baseValue;
				const trendEffect = (i / 11) * trend * baseValue;
				points.push(baseValue + variation + trendEffect);
			}
			return points;
		};

		// Area chart for continuous metrics
		const drawAreaChart = (ref: React.RefObject<SVGSVGElement | null>, chartData: number[], color: string) => {
			if (!ref.current) return;

			const svg = d3.select(ref.current);
			svg.selectAll("*").remove();

			const parentWidth = ref.current.parentElement?.clientWidth || 200;
			const width = parentWidth;
      const parentHeight = ref.current.parentElement?.clientHeight || 200;
			const height = parentHeight;

			const x = d3
				.scaleLinear()
				.domain([0, chartData.length - 1])
				.range([0, width]);
			const y = d3
				.scaleLinear()
				.domain([d3.min(chartData)! * 0.95, d3.max(chartData)! * 1.05])
				.range([height, 0]);

			svg.attr("width", "100%").attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

			// Area fill
			const area = d3
				.area<number>()
				.x((_, i) => x(i))
				.y0(height)
				.y1((d) => y(d))
				.curve(d3.curveMonotoneX);

			svg.append("path").datum(chartData).attr("fill", color).attr("fill-opacity", 0.2).attr("d", area);

			// Line
			const line = d3
				.line<number>()
				.x((_, i) => x(i))
				.y((d) => y(d))
				.curve(d3.curveMonotoneX);

			svg.append("path").datum(chartData).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).attr("d", line);
		};

		// Bar chart for Win Rate
		const drawBarChart = (ref: React.RefObject<SVGSVGElement | null>, chartData: number[], color: string) => {
			if (!ref.current) return;

			const svg = d3.select(ref.current);
			svg.selectAll("*").remove();

			const parentWidth = ref.current.parentElement?.clientWidth || 200;
			const width = parentWidth;
      const parentHeight = ref.current.parentElement?.clientHeight || 200;
			const height = parentHeight;
			const barCount = 8;

			const x = d3.scaleBand().domain(d3.range(barCount).map(String)).range([0, width]).padding(0.2);

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(chartData.slice(0, barCount))!])
				.range([height, 0]);

			svg.attr("width", "100%").attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

			svg.selectAll("rect")
				.data(chartData.slice(0, barCount))
				.join("rect")
				.attr("x", (_, i) => x(String(i))!)
				.attr("y", (d) => y(d))
				.attr("width", x.bandwidth())
				.attr("height", (d) => height - y(d))
				.attr("fill", color)
				.attr("rx", 1);
		};

		drawAreaChart(sparkline1Ref, generateTrendData(data.pipeline_size, 0.12), "#3b82f6");
		drawBarChart(sparkline2Ref, generateTrendData(data.win_rate, -0.04), "#3b82f6");
		drawAreaChart(sparkline3Ref, generateTrendData(data.average_deal_size, 0.03), "#3b82f6");
		drawAreaChart(sparkline4Ref, generateTrendData(data.sales_cycle_time, 0.09), "#f59e0b");
	}, [data]);

	if (!data) return null;

	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(1)}M`;
		}
		return `$${(value / 1000).toFixed(0)}K`;
	};

	const metrics = [
		{ label: "Pipeline Value", value: formatCurrency(data.pipeline_size), trend: "+12%", trendColor: "#10b981", ref: sparkline1Ref },
		{ label: "Win Rate", value: `${data.win_rate.toFixed(0)}%`, trend: "-4%", trendColor: "#ef4444", ref: sparkline2Ref },
		{ label: "Avg Deal Size", value: formatCurrency(data.average_deal_size), trend: "+3%", trendColor: "#10b981", ref: sparkline3Ref },
		{ label: "Sales Cycle", value: `${data.sales_cycle_time.toFixed(0)} Days`, trend: "+9 Days", trendColor: "#f59e0b", ref: sparkline4Ref },
	];

	return (
		<Paper elevation={1} sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
			<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
				Revenue Drivers
			</Typography>
			<Divider sx={{ my: 1 }} />

			<Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
				{metrics.map((metric, index) => (
					<Box key={index}>
						{/* Title, Value, and Percent on one line */}
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
							<Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
								{metric.label}
							</Typography>
							<Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{metric.value}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										color: metric.trendColor,
										fontWeight: 600,
									}}
								>
									{metric.trend}
								</Typography>
							</Box>
						</Box>
						{/* Graph below */}
						<Box sx={{ width: "100%", height: 70 }}>
							<svg ref={metric.ref} style={{ display: "block" }}></svg>
						</Box>
					</Box>
				))}
			</Box>
		</Paper>
	);
};

export default RevenueDriversCompact;
