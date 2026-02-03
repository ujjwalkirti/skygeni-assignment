# Revenue Intelligence Console

A full-stack web application that provides revenue intelligence insights for sales teams. Built with React, TypeScript, Material-UI, D3.js on the frontend and Golang on the backend.

## Features

- **Quarterly Summary**: Track current quarter revenue vs targets with QoQ comparisons
- **Revenue Drivers**: Analyze key metrics including pipeline size, win rate, average deal size, and sales cycle time
- **Risk Factors**: Identify stale deals, underperforming reps, and low-activity accounts
- **Actionable Recommendations**: Get prioritized suggestions to improve revenue performance
- **Interactive Visualizations**: D3.js charts for data visualization

## Tech Stack

### Frontend
- **Vite** - Fast build tool
- **React 18** with TypeScript
- **TanStack Query (React Query)** - Data fetching and state management
- **Material-UI (MUI)** - Component library
- **D3.js** - Data visualization
- **Axios** - HTTP client

### Backend
- **Golang** - Backend API server
- **Standard Library** - HTTP routing and JSON handling
- **File-based data** - JSON data loading

## Project Structure

```
skygeni-assignment/
├── backend/
│   ├── handlers/         # HTTP request handlers
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   └── main.go          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── package.json
├── data/                # JSON data files
│   ├── accounts.json
│   ├── reps.json
│   ├── deals.json
│   ├── activities.json
│   └── targets.json
├── README.md
└── THINKING.md
```

## Prerequisites

- **Node.js** (v18 or higher)
- **Go** (v1.20 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd skygeni-assignment
```

### 2. Backend Setup

```bash
cd backend

# Initialize Go modules (if not already done)
go mod init revenue-intelligence-api

# Install dependencies
go mod tidy

# Run the server
go run main.go
```

The backend server will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### GET /api/summary
Returns quarterly revenue summary including:
- Current quarter revenue
- Target
- Gap and gap percentage
- Quarter-over-quarter change

**Response:**
```json
{
  "current_quarter": 1,
  "current_quarter_year": 2025,
  "revenue": 500000,
  "target": 633483,
  "gap": 133483,
  "gap_percentage": 21.08,
  "qoq_change": -215000,
  "qoq_change_percentage": -30.07
}
```

### GET /api/drivers
Returns revenue driver metrics:
- Pipeline size
- Win rate
- Average deal size
- Sales cycle time

**Response:**
```json
{
  "pipeline_size": 2500000,
  "win_rate": 22.5,
  "average_deal_size": 45000,
  "sales_cycle_time": 45.2
}
```

### GET /api/risk-factors
Returns identified risk factors with severity levels and detailed data.

**Response:**
```json
[
  {
    "type": "stale_deals",
    "description": "Found 15 deals older than 60 days without recent activity",
    "severity": "high",
    "data": {
      "count": 15,
      "deals": [...]
    }
  }
]
```

### GET /api/recommendations
Returns prioritized actionable recommendations.

**Response:**
```json
[
  {
    "priority": "high",
    "action": "Focus on Enterprise deals older than 30 days",
    "impact": "Potential revenue at risk: $450000",
    "description": "Enterprise deals have the highest value but are moving slowly..."
  }
]
```

## Development

### Frontend Development

```bash
cd frontend
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```

### Backend Development

```bash
cd backend
go run main.go              # Run with live reload
go build -o server main.go  # Build binary
```

## Data

The application uses sample data from the `data/` directory:
- **accounts.json** - Customer accounts (120 accounts)
- **reps.json** - Sales representatives (15 reps)
- **deals.json** - Sales deals with various stages
- **activities.json** - Sales activities (calls, emails, demos)
- **targets.json** - Monthly revenue targets for 2025

## Testing

To test the application:

1. Ensure the backend server is running on port 8080
2. Start the frontend development server
3. Open `http://localhost:5173` in your browser
4. Verify all dashboard sections load correctly

## Assumptions & Design Decisions

See [THINKING.md](./THINKING.md) for detailed documentation on:
- Assumptions made during development
- Data quality issues and handling
- Architectural trade-offs
- Scalability considerations
- AI tool usage

## Future Enhancements

- Add database support (PostgreSQL/SQLite)
- Implement real-time data updates with WebSockets
- Add user authentication and role-based access
- Implement data filtering and drill-down capabilities
- Add export functionality (PDF, Excel)
- Create mobile-responsive views
- Add unit and integration tests

## License

MIT

## Author

Built as a full-stack engineering assignment
