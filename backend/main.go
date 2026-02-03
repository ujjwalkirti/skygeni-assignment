package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"revenue-intelligence-api/handlers"
	"revenue-intelligence-api/services"
)

func main() {
	dataPath := filepath.Join("..", "data")

	dataService, err := services.NewDataService(dataPath)
	if err != nil {
		log.Fatalf("Failed to load data: %v", err)
	}

	analyticsService := services.NewAnalyticsService(dataService)
	h := handlers.NewHandlers(analyticsService)

	http.HandleFunc("/api/summary", handlers.EnableCORS(h.GetSummary))
	http.HandleFunc("/api/drivers", handlers.EnableCORS(h.GetDrivers))
	http.HandleFunc("/api/risk-factors", handlers.EnableCORS(h.GetRiskFactors))
	http.HandleFunc("/api/recommendations", handlers.EnableCORS(h.GetRecommendations))

	port := "8080"
	fmt.Printf("Server starting on port %s...\n", port)
	fmt.Println("Endpoints available:")
	fmt.Println("  GET /api/summary")
	fmt.Println("  GET /api/drivers")
	fmt.Println("  GET /api/risk-factors")
	fmt.Println("  GET /api/recommendations")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
