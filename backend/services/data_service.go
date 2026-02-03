package services

import (
	"encoding/json"
	"os"
	"path/filepath"
	"revenue-intelligence-api/models"
	"sort"
	"time"
)

type DataService struct {
	Accounts   []models.Account
	Reps       []models.Rep
	Deals      []models.Deal
	Activities []models.Activity
	Targets    []models.Target
}

func NewDataService(dataPath string) (*DataService, error) {
	ds := &DataService{}

	if err := ds.loadData(dataPath); err != nil {
		return nil, err
	}

	return ds, nil
}

func (ds *DataService) loadData(dataPath string) error {
	if err := ds.loadJSON(filepath.Join(dataPath, "accounts.json"), &ds.Accounts); err != nil {
		return err
	}
	if err := ds.loadJSON(filepath.Join(dataPath, "reps.json"), &ds.Reps); err != nil {
		return err
	}
	if err := ds.loadJSON(filepath.Join(dataPath, "deals.json"), &ds.Deals); err != nil {
		return err
	}
	if err := ds.loadJSON(filepath.Join(dataPath, "activities.json"), &ds.Activities); err != nil {
		return err
	}
	if err := ds.loadJSON(filepath.Join(dataPath, "targets.json"), &ds.Targets); err != nil {
		return err
	}

	return nil
}

func (ds *DataService) loadJSON(filename string, v interface{}) error {
	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

func (ds *DataService) GetCurrentQuarter() (int, int) {
	now := time.Now()
	year := now.Year()
	month := int(now.Month())
	quarter := (month-1)/3 + 1
	return quarter, year
}

func (ds *DataService) GetQuarterMonths(quarter, year int) []string {
	months := []string{}
	startMonth := (quarter-1)*3 + 1

	for i := 0; i < 3; i++ {
		month := startMonth + i
		months = append(months, time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC).Format("2006-01"))
	}

	return months
}

func (ds *DataService) GetAccountByID(accountID string) *models.Account {
	for _, acc := range ds.Accounts {
		if acc.AccountID == accountID {
			return &acc
		}
	}
	return nil
}

func (ds *DataService) GetRepByID(repID string) *models.Rep {
	for _, rep := range ds.Reps {
		if rep.RepID == repID {
			return &rep
		}
	}
	return nil
}

func (ds *DataService) GetDealsByAccountID(accountID string) []models.Deal {
	var deals []models.Deal
	for _, deal := range ds.Deals {
		if deal.AccountID == accountID {
			deals = append(deals, deal)
		}
	}
	return deals
}

func (ds *DataService) GetActivitiesByDealID(dealID string) []models.Activity {
	var activities []models.Activity
	for _, activity := range ds.Activities {
		if activity.DealID == dealID {
			activities = append(activities, activity)
		}
	}
	return activities
}

func (ds *DataService) GetClosedWonDeals() []models.Deal {
	var deals []models.Deal
	for _, deal := range ds.Deals {
		if deal.Stage == "Closed Won" && deal.Amount != nil {
			deals = append(deals, deal)
		}
	}
	return deals
}

func (ds *DataService) GetOpenDeals() []models.Deal {
	var deals []models.Deal
	for _, deal := range ds.Deals {
		if deal.Stage != "Closed Won" && deal.Stage != "Closed Lost" {
			deals = append(deals, deal)
		}
	}
	return deals
}

func (ds *DataService) GetDealsByRepID(repID string) []models.Deal {
	var deals []models.Deal
	for _, deal := range ds.Deals {
		if deal.RepID == repID {
			deals = append(deals, deal)
		}
	}
	return deals
}

func (ds *DataService) ParseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

func (ds *DataService) GetDealAge(deal models.Deal) int {
	created, err := ds.ParseDate(deal.CreatedAt)
	if err != nil {
		return 0
	}

	var endDate time.Time
	if deal.ClosedAt != nil && *deal.ClosedAt != "" {
		endDate, err = ds.ParseDate(*deal.ClosedAt)
		if err != nil {
			endDate = time.Now()
		}
	} else {
		endDate = time.Now()
	}

	return int(endDate.Sub(created).Hours() / 24)
}

func (ds *DataService) GetTargetForMonth(month string) float64 {
	for _, target := range ds.Targets {
		if target.Month == month {
			return target.Target
		}
	}
	return 0
}

func (ds *DataService) GetQuarterTarget(quarter, year int) float64 {
	months := ds.GetQuarterMonths(quarter, year)
	total := 0.0
	for _, month := range months {
		total += ds.GetTargetForMonth(month)
	}
	return total
}

func (ds *DataService) GetQuarterRevenue(quarter, year int) float64 {
	months := ds.GetQuarterMonths(quarter, year)
	monthMap := make(map[string]bool)
	for _, m := range months {
		monthMap[m] = true
	}

	total := 0.0
	for _, deal := range ds.Deals {
		if deal.Stage == "Closed Won" && deal.Amount != nil && deal.ClosedAt != nil && *deal.ClosedAt != "" {
			closedDate, err := ds.ParseDate(*deal.ClosedAt)
			if err == nil {
				monthKey := closedDate.Format("2006-01")
				if monthMap[monthKey] {
					total += *deal.Amount
				}
			}
		}
	}

	return total
}

func (ds *DataService) GetDealsInStage(stage string) []models.Deal {
	var deals []models.Deal
	for _, deal := range ds.Deals {
		if deal.Stage == stage {
			deals = append(deals, deal)
		}
	}
	return deals
}

func (ds *DataService) SortDealsByAge(deals []models.Deal) []models.Deal {
	sorted := make([]models.Deal, len(deals))
	copy(sorted, deals)

	sort.Slice(sorted, func(i, j int) bool {
		return ds.GetDealAge(sorted[i]) > ds.GetDealAge(sorted[j])
	})

	return sorted
}

func (ds *DataService) GetActivityCount(dealID string) int {
	count := 0
	for _, activity := range ds.Activities {
		if activity.DealID == dealID {
			count++
		}
	}
	return count
}
