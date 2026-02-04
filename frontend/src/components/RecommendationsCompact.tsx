import { Paper, Typography, Box, Button, Divider } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Recommendation } from '../services/api';

interface RecommendationsCompactProps {
  data: Recommendation[];
}

const RecommendationsCompact = ({ data }: RecommendationsCompactProps) => {
  const handleKnowMore = () => {
    const element = document.getElementById('detailed-recommendations');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
		<Paper elevation={1} sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
			<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
				Recommended Actions
			</Typography>
			<Divider sx={{ my: 1 }} />

			<Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
				{data.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						No recommendations at this time
					</Typography>
				) : (
					data.slice(0, 3).map((recommendation, index) => (
						<Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
							<FiberManualRecordIcon
								sx={{
									fontSize: 10,
									color: "#fb923c",
									mt: 0.8,
								}}
							/>
							<Typography variant="body2" sx={{ lineHeight: 1.6, flex: 1 }}>
								{recommendation.action}
							</Typography>
						</Box>
					))
				)}
			</Box>

			{data.length > 0 && (
				<Button
					onClick={handleKnowMore}
					endIcon={<ArrowForwardIcon />}
					sx={{
						mt: 3,
						alignSelf: "flex-start",
						textTransform: "none",
						color: "#2563eb",
						fontWeight: 600,
						"&:hover": {
							bgcolor: "rgba(37, 99, 235, 0.04)",
						},
					}}
				>
					Know More
				</Button>
			)}
		</Paper>
  );
};

export default RecommendationsCompact;
