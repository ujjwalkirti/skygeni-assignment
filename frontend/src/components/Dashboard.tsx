import { useQuery } from "@tanstack/react-query";
import { Container, Box, CircularProgress, Alert, Typography, Divider } from "@mui/material";
import { api } from "../services/api";
import QTDRevenueBanner from "./QTDRevenueBanner";
import RevenueDriversCompact from "./RevenueDriversCompact";
import RiskFactorsCompact from "./RiskFactorsCompact";
import RecommendationsCompact from "./RecommendationsCompact";
import RevenueTrendChart from "./RevenueTrendChart";
import SummaryCard from "./SummaryCard";
import RiskFactorsCard from "./RiskFactorsCard";
import RecommendationsCard from "./RecommendationsCard";

const Dashboard = () => {
	const {
		data: summary,
		isLoading: summaryLoading,
		error: summaryError,
	} = useQuery({
		queryKey: ["summary"],
		queryFn: api.getSummary,
	});

	const { data: drivers, isLoading: driversLoading } = useQuery({
		queryKey: ["drivers"],
		queryFn: api.getDrivers,
	});

	const { data: risks, isLoading: risksLoading } = useQuery({
		queryKey: ["risks"],
		queryFn: api.getRiskFactors,
	});

	const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
		queryKey: ["recommendations"],
		queryFn: api.getRecommendations,
	});

	if (summaryLoading || driversLoading || risksLoading || recommendationsLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<CircularProgress size={60} />
			</Box>
		);
	}

	if (summaryError) {
		return (
			<Container maxWidth="lg" sx={{ mt: 4 }}>
				<Alert severity="error">Failed to load dashboard data. Please ensure the backend server is running on http://localhost:8080</Alert>
			</Container>
		);
	}

	return (
		<Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
			{/* Header */}
			<Box
				sx={{
					bgcolor: "white",
					borderBottom: "1px solid #e2e8f0",
					px: 4,
					py: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Typography sx={{ color: "white", fontWeight: 700, fontSize: "20px" }}>S</Typography>
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
						SkyGeni
					</Typography>
				</Box>
			</Box>

			<Container maxWidth="xl" sx={{ py: 4 }}>
				{/* QTD Revenue Banner */}
				<QTDRevenueBanner data={summary} />

				{/* Main Dashboard Grid */}
				<Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mt: 4 }}>
					<Box sx={{ width: { xs: "100%", md: "30%" } }}>
						<RevenueDriversCompact data={drivers} />
					</Box>
					<Box sx={{ flexGrow: 1 }}>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
								gap: 3,
								mb: 3,
							}}
						>
							<RiskFactorsCompact data={risks || []} />
							<RecommendationsCompact data={recommendations || []} />
						</Box>

						{/* Revenue Trend Chart */}
						<RevenueTrendChart />
					</Box>
				</Box>

				{/* Detailed Sections Below */}
				<Divider sx={{ my: 6 }} />

				<Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#0f172a" }}>
					Detailed Analysis
				</Typography>

				{/* Full Details - Original Cards */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
					<Box id="detailed-summary">
						<SummaryCard data={summary} />
					</Box>

					<Box id="detailed-risk-factors">
						<RiskFactorsCard data={risks || []} />
					</Box>

					<Box id="detailed-recommendations">
						<RecommendationsCard data={recommendations || []} />
					</Box>
				</Box>
			</Container>
		</Box>
	);
};

export default Dashboard;
