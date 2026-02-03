import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { api } from '../services/api';
import SummaryCard from './SummaryCard';
import RevenueDriversCard from './RevenueDriversCard';
import RiskFactorsCard from './RiskFactorsCard';
import RecommendationsCard from './RecommendationsCard';

const Dashboard = () => {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['summary'],
    queryFn: api.getSummary,
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: api.getDrivers,
  });

  const { data: risks, isLoading: risksLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: api.getRiskFactors,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations'],
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
        <Alert severity="error">
          Failed to load dashboard data. Please ensure the backend server is running on http://localhost:8080
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Revenue Intelligence Console
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Q{summary?.current_quarter} {summary?.current_quarter_year} Performance Overview
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SummaryCard data={summary} />
        </Grid>

        <Grid item xs={12} md={6}>
          <RevenueDriversCard data={drivers} />
        </Grid>

        <Grid item xs={12} md={6}>
          <RiskFactorsCard data={risks || []} />
        </Grid>

        <Grid item xs={12}>
          <RecommendationsCard data={recommendations || []} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
