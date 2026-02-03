import { Paper, Grid, Typography, Box, Card, CardContent, Chip } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import type { Recommendation } from '../services/api';

interface RecommendationsCardProps {
  data: Recommendation[];
}

const RecommendationsCard = ({ data }: RecommendationsCardProps) => {
  const getPriorityColor = (priority: string): "error" | "warning" | "info" => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <LightbulbIcon color="primary" />
        <Typography variant="h6">
          Actionable Recommendations
        </Typography>
      </Box>

      {data.length === 0 ? (
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No recommendations at this time
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {data.map((recommendation, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderLeft: 4,
                  borderColor: `${getPriorityColor(recommendation.priority)}.main`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {recommendation.priority.toLowerCase() === 'high' && (
                        <PriorityHighIcon color="error" fontSize="small" />
                      )}
                      <Chip
                        label={recommendation.priority.toUpperCase()}
                        color={getPriorityColor(recommendation.priority)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                    {recommendation.action}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {recommendation.description}
                  </Typography>

                  <Box
                    mt={2}
                    p={1.5}
                    bgcolor="action.hover"
                    borderRadius={1}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Expected Impact
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {recommendation.impact}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default RecommendationsCard;
