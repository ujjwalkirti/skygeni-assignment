package services

import (
	"fmt"
	"revenue-intelligence-api/models"
	"time"
)

type AnalyticsService struct {
	DataService *DataService
}

func NewAnalyticsService(ds *DataService) *AnalyticsService {
	return &AnalyticsService{
		DataService: ds,
	}
}

func (as *AnalyticsService) GetSummary() models.SummaryResponse {
	quarter, year := as.DataService.GetCurrentQuarter()
	currentRevenue := as.DataService.GetQuarterRevenue(quarter, year)
	currentTarget := as.DataService.GetQuarterTarget(quarter, year)
	gap := currentTarget - currentRevenue
	gapPercentage := 0.0
	if currentTarget > 0 {
		gapPercentage = (gap / currentTarget) * 100
	}

	prevQuarter := quarter - 1
	prevYear := year
	if prevQuarter < 1 {
		prevQuarter = 4
		prevYear--
	}

	prevRevenue := as.DataService.GetQuarterRevenue(prevQuarter, prevYear)
	qoqChange := currentRevenue - prevRevenue
	qoqChangePercentage := 0.0
	if prevRevenue > 0 {
		qoqChangePercentage = (qoqChange / prevRevenue) * 100
	}

	return models.SummaryResponse{
		CurrentQuarter:      quarter,
		CurrentQuarterYear:  year,
		Revenue:             currentRevenue,
		Target:              currentTarget,
		Gap:                 gap,
		GapPercentage:       gapPercentage,
		QoQChange:           qoqChange,
		QoQChangePercentage: qoqChangePercentage,
	}
}

func (as *AnalyticsService) GetRevenueDrivers() models.RevenueDrivers {
	openDeals := as.DataService.GetOpenDeals()
	pipelineSize := 0.0
	dealCount := 0

	for _, deal := range openDeals {
		if deal.Amount != nil {
			pipelineSize += *deal.Amount
			dealCount++
		}
	}

	closedWonDeals := as.DataService.GetClosedWonDeals()
	totalClosedWon := len(closedWonDeals)

	totalDeals := len(as.DataService.Deals)
	winRate := 0.0
	if totalDeals > 0 {
		winRate = (float64(totalClosedWon) / float64(totalDeals)) * 100
	}

	averageDealSize := 0.0
	if totalClosedWon > 0 {
		totalWonAmount := 0.0
		for _, deal := range closedWonDeals {
			if deal.Amount != nil {
				totalWonAmount += *deal.Amount
			}
		}
		averageDealSize = totalWonAmount / float64(totalClosedWon)
	}

	totalCycleTime := 0
	cycleCount := 0
	for _, deal := range closedWonDeals {
		age := as.DataService.GetDealAge(deal)
		if age > 0 {
			totalCycleTime += age
			cycleCount++
		}
	}

	avgSalesCycleTime := 0.0
	if cycleCount > 0 {
		avgSalesCycleTime = float64(totalCycleTime) / float64(cycleCount)
	}

	return models.RevenueDrivers{
		PipelineSize:    pipelineSize,
		WinRate:         winRate,
		AverageDealSize: averageDealSize,
		SalesCycleTime:  avgSalesCycleTime,
	}
}

func (as *AnalyticsService) GetRiskFactors() []models.RiskFactor {
	risks := []models.RiskFactor{}

	staleDeals := as.findStaleDeals()
	if len(staleDeals) > 0 {
		risks = append(risks, models.RiskFactor{
			Type:        "stale_deals",
			Description: fmt.Sprintf("Found %d deals older than 60 days without recent activity", len(staleDeals)),
			Severity:    "high",
			Data: map[string]interface{}{
				"count": len(staleDeals),
				"deals": staleDeals[:min(5, len(staleDeals))],
			},
		})
	}

	underperformingReps := as.findUnderperformingReps()
	if len(underperformingReps) > 0 {
		risks = append(risks, models.RiskFactor{
			Type:        "underperforming_reps",
			Description: fmt.Sprintf("Found %d sales reps with win rate below 20%%", len(underperformingReps)),
			Severity:    "medium",
			Data: map[string]interface{}{
				"count": len(underperformingReps),
				"reps":  underperformingReps,
			},
		})
	}

	lowActivityAccounts := as.findLowActivityAccounts()
	if len(lowActivityAccounts) > 0 {
		risks = append(risks, models.RiskFactor{
			Type:        "low_activity_accounts",
			Description: fmt.Sprintf("Found %d accounts with open deals but low activity", len(lowActivityAccounts)),
			Severity:    "medium",
			Data: map[string]interface{}{
				"count":    len(lowActivityAccounts),
				"accounts": lowActivityAccounts[:min(5, len(lowActivityAccounts))],
			},
		})
	}

	return risks
}

func (as *AnalyticsService) findStaleDeals() []map[string]interface{} {
	staleDeals := []map[string]interface{}{}
	cutoffDate := time.Now().AddDate(0, 0, -60)

	for _, deal := range as.DataService.Deals {
		if deal.Stage != "Closed Won" && deal.Stage != "Closed Lost" {
			createdDate, err := as.DataService.ParseDate(deal.CreatedAt)
			if err == nil && createdDate.Before(cutoffDate) {
				account := as.DataService.GetAccountByID(deal.AccountID)
				rep := as.DataService.GetRepByID(deal.RepID)
				age := as.DataService.GetDealAge(deal)
				activityCount := as.DataService.GetActivityCount(deal.DealID)

				dealInfo := map[string]interface{}{
					"deal_id":        deal.DealID,
					"account_name":   account.Name,
					"rep_name":       rep.Name,
					"stage":          deal.Stage,
					"age_days":       age,
					"activity_count": activityCount,
					"segment":        account.Segment,
				}

				if deal.Amount != nil {
					dealInfo["amount"] = *deal.Amount
				}

				staleDeals = append(staleDeals, dealInfo)
			}
		}
	}

	return staleDeals
}

func (as *AnalyticsService) findUnderperformingReps() []map[string]interface{} {
	underperforming := []map[string]interface{}{}
	repStats := make(map[string]struct {
		TotalDeals int
		WonDeals   int
		RepName    string
	})

	for _, deal := range as.DataService.Deals {
		stats := repStats[deal.RepID]
		if stats.RepName == "" {
			rep := as.DataService.GetRepByID(deal.RepID)
			if rep != nil {
				stats.RepName = rep.Name
			}
		}
		stats.TotalDeals++
		if deal.Stage == "Closed Won" {
			stats.WonDeals++
		}
		repStats[deal.RepID] = stats
	}

	for repID, stats := range repStats {
		winRate := 0.0
		if stats.TotalDeals > 0 {
			winRate = (float64(stats.WonDeals) / float64(stats.TotalDeals)) * 100
		}

		if winRate < 20.0 && stats.TotalDeals >= 5 {
			underperforming = append(underperforming, map[string]interface{}{
				"rep_id":      repID,
				"rep_name":    stats.RepName,
				"win_rate":    winRate,
				"total_deals": stats.TotalDeals,
				"won_deals":   stats.WonDeals,
			})
		}
	}

	return underperforming
}

func (as *AnalyticsService) findLowActivityAccounts() []map[string]interface{} {
	lowActivity := []map[string]interface{}{}
	accountDeals := make(map[string][]models.Deal)

	for _, deal := range as.DataService.Deals {
		if deal.Stage != "Closed Won" && deal.Stage != "Closed Lost" {
			accountDeals[deal.AccountID] = append(accountDeals[deal.AccountID], deal)
		}
	}

	for accountID, deals := range accountDeals {
		totalActivity := 0
		for _, deal := range deals {
			totalActivity += as.DataService.GetActivityCount(deal.DealID)
		}

		avgActivity := float64(totalActivity) / float64(len(deals))
		if avgActivity < 2.0 {
			account := as.DataService.GetAccountByID(accountID)
			lowActivity = append(lowActivity, map[string]interface{}{
				"account_id":          accountID,
				"account_name":        account.Name,
				"segment":             account.Segment,
				"industry":            account.Industry,
				"open_deals":          len(deals),
				"total_activities":    totalActivity,
				"avg_activities":      avgActivity,
			})
		}
	}

	return lowActivity
}

func (as *AnalyticsService) GetRecommendations() []models.Recommendation {
	recommendations := []models.Recommendation{}

	staleEnterpriseDeals := as.findStaleEnterpriseDeals()
	if staleEnterpriseDeals > 0 {
		recommendations = append(recommendations, models.Recommendation{
			Priority:    "high",
			Action:      "Focus on Enterprise deals older than 30 days",
			Impact:      fmt.Sprintf("Potential revenue at risk: $%.0f", staleEnterpriseDeals),
			Description: "Enterprise deals have the highest value but are moving slowly. Engage with decision-makers to accelerate closure.",
		})
	}

	underperformingReps := as.findUnderperformingReps()
	if len(underperformingReps) > 0 {
		topRep := underperformingReps[0]
		recommendations = append(recommendations, models.Recommendation{
			Priority:    "medium",
			Action:      fmt.Sprintf("Coach %s on win rate improvement", topRep["rep_name"]),
			Impact:      fmt.Sprintf("Current win rate: %.1f%%, Target: 25%%", topRep["win_rate"]),
			Description: "Provide training on objection handling and closing techniques.",
		})
	}

	lowActivitySegments := as.findLowActivitySegments()
	if lowActivitySegments != "" {
		recommendations = append(recommendations, models.Recommendation{
			Priority:    "medium",
			Action:      fmt.Sprintf("Increase activity for %s segment", lowActivitySegments),
			Impact:      "Expected 15-20% improvement in conversion rate",
			Description: "Accounts with higher engagement show better conversion rates. Schedule regular check-ins and demos.",
		})
	}

	pipelineHealth := as.assessPipelineHealth()
	if pipelineHealth != "" {
		recommendations = append(recommendations, models.Recommendation{
			Priority:    "high",
			Action:      pipelineHealth,
			Impact:      "Ensure target achievement for next quarter",
			Description: "Pipeline should be 3-4x of quarterly target for healthy conversion.",
		})
	}

	fastTrackDeals := as.findFastTrackOpportunities()
	if fastTrackDeals > 0 {
		recommendations = append(recommendations, models.Recommendation{
			Priority:    "medium",
			Action:      "Fast-track deals in Negotiation stage",
			Impact:      fmt.Sprintf("%d deals worth prioritizing", fastTrackDeals),
			Description: "Deals in negotiation are close to closure. Provide additional resources or executive support.",
		})
	}

	return recommendations
}

func (as *AnalyticsService) findStaleEnterpriseDeals() float64 {
	cutoffDate := time.Now().AddDate(0, 0, -30)
	totalValue := 0.0

	for _, deal := range as.DataService.Deals {
		if deal.Stage != "Closed Won" && deal.Stage != "Closed Lost" {
			account := as.DataService.GetAccountByID(deal.AccountID)
			if account != nil && account.Segment == "Enterprise" {
				createdDate, err := as.DataService.ParseDate(deal.CreatedAt)
				if err == nil && createdDate.Before(cutoffDate) && deal.Amount != nil {
					totalValue += *deal.Amount
				}
			}
		}
	}

	return totalValue
}

func (as *AnalyticsService) findLowActivitySegments() string {
	segmentActivity := make(map[string]struct {
		TotalDeals     int
		TotalActivity  int
	})

	for _, deal := range as.DataService.Deals {
		if deal.Stage != "Closed Won" && deal.Stage != "Closed Lost" {
			account := as.DataService.GetAccountByID(deal.AccountID)
			if account != nil {
				stats := segmentActivity[account.Segment]
				stats.TotalDeals++
				stats.TotalActivity += as.DataService.GetActivityCount(deal.DealID)
				segmentActivity[account.Segment] = stats
			}
		}
	}

	lowestSegment := ""
	lowestAvg := 999999.0

	for segment, stats := range segmentActivity {
		if stats.TotalDeals > 0 {
			avg := float64(stats.TotalActivity) / float64(stats.TotalDeals)
			if avg < lowestAvg {
				lowestAvg = avg
				lowestSegment = segment
			}
		}
	}

	if lowestAvg < 3.0 {
		return lowestSegment
	}

	return ""
}

func (as *AnalyticsService) assessPipelineHealth() string {
	quarter, year := as.DataService.GetCurrentQuarter()
	nextQuarter := quarter + 1
	nextYear := year
	if nextQuarter > 4 {
		nextQuarter = 1
		nextYear++
	}

	target := as.DataService.GetQuarterTarget(nextQuarter, nextYear)
	openDeals := as.DataService.GetOpenDeals()
	pipelineValue := 0.0

	for _, deal := range openDeals {
		if deal.Amount != nil {
			pipelineValue += *deal.Amount
		}
	}

	ratio := pipelineValue / target
	if ratio < 3.0 {
		return "Increase pipeline coverage - currently below 3x target"
	}

	return ""
}

func (as *AnalyticsService) findFastTrackOpportunities() int {
	negotiationDeals := as.DataService.GetDealsInStage("Negotiation")
	return len(negotiationDeals)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
