package models

type Account struct {
	AccountID string `json:"account_id"`
	Name      string `json:"name"`
	Industry  string `json:"industry"`
	Segment   string `json:"segment"`
}

type Rep struct {
	RepID string `json:"rep_id"`
	Name  string `json:"name"`
}

type Deal struct {
	DealID    string     `json:"deal_id"`
	AccountID string     `json:"account_id"`
	RepID     string     `json:"rep_id"`
	Stage     string     `json:"stage"`
	Amount    *float64   `json:"amount"`
	CreatedAt string     `json:"created_at"`
	ClosedAt  *string    `json:"closed_at"`
}

type Activity struct {
	ActivityID string `json:"activity_id"`
	DealID     string `json:"deal_id"`
	Type       string `json:"type"`
	Timestamp  string `json:"timestamp"`
}

type Target struct {
	Month  string  `json:"month"`
	Target float64 `json:"target"`
}

type SummaryResponse struct {
	CurrentQuarter       int     `json:"current_quarter"`
	CurrentQuarterYear   int     `json:"current_quarter_year"`
	Revenue              float64 `json:"revenue"`
	Target               float64 `json:"target"`
	Gap                  float64 `json:"gap"`
	GapPercentage        float64 `json:"gap_percentage"`
	QoQChange            float64 `json:"qoq_change"`
	QoQChangePercentage  float64 `json:"qoq_change_percentage"`
}

type RevenueDrivers struct {
	PipelineSize      float64 `json:"pipeline_size"`
	WinRate           float64 `json:"win_rate"`
	AverageDealSize   float64 `json:"average_deal_size"`
	SalesCycleTime    float64 `json:"sales_cycle_time"`
}

type RiskFactor struct {
	Type        string      `json:"type"`
	Description string      `json:"description"`
	Severity    string      `json:"severity"`
	Data        interface{} `json:"data"`
}

type Recommendation struct {
	Priority    string `json:"priority"`
	Action      string `json:"action"`
	Impact      string `json:"impact"`
	Description string `json:"description"`
}
