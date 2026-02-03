import { Paper, Typography, Box, Chip, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import type { RiskFactor } from '../services/api';

interface RiskFactorsCardProps {
  data: RiskFactor[];
}

const RiskFactorsCard = ({ data }: RiskFactorsCardProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity: string): "error" | "warning" | "info" => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  const renderRiskData = (risk: RiskFactor) => {
    if (!risk.data) return null;

    if (risk.type === 'stale_deals' && risk.data.deals) {
      return (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Deal ID</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Rep</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell align="right">Age (days)</TableCell>
                <TableCell>Segment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risk.data.deals.map((deal: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{deal.deal_id}</TableCell>
                  <TableCell>{deal.account_name}</TableCell>
                  <TableCell>{deal.rep_name}</TableCell>
                  <TableCell>{deal.stage}</TableCell>
                  <TableCell align="right">{deal.age_days}</TableCell>
                  <TableCell>{deal.segment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (risk.type === 'underperforming_reps' && risk.data.reps) {
      return (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rep Name</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Total Deals</TableCell>
                <TableCell align="right">Won Deals</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risk.data.reps.map((rep: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{rep.rep_name}</TableCell>
                  <TableCell align="right">{rep.win_rate.toFixed(1)}%</TableCell>
                  <TableCell align="right">{rep.total_deals}</TableCell>
                  <TableCell align="right">{rep.won_deals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (risk.type === 'low_activity_accounts' && risk.data.accounts) {
      return (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Segment</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell align="right">Open Deals</TableCell>
                <TableCell align="right">Avg Activities</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risk.data.accounts.map((account: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{account.account_name}</TableCell>
                  <TableCell>{account.segment}</TableCell>
                  <TableCell>{account.industry}</TableCell>
                  <TableCell align="right">{account.open_deals}</TableCell>
                  <TableCell align="right">{account.avg_activities.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Risk Factors
      </Typography>

      {data.length === 0 ? (
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No significant risks identified
          </Typography>
        </Box>
      ) : (
        <Box>
          {data.map((risk, index) => (
            <Accordion key={index} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  {getSeverityIcon(risk.severity)}
                  <Box flex={1}>
                    <Typography variant="subtitle1">
                      {risk.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={risk.severity.toUpperCase()}
                    color={getSeverityColor(risk.severity)}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {renderRiskData(risk)}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default RiskFactorsCard;
