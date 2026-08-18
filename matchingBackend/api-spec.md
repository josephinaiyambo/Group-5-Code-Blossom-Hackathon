# API Specification – Matching Engine

## Base URL
`http://localhost:5000/api`

## Endpoints

### `POST /matches/run`
Triggers the matching algorithm.  
**Request Body**: none (uses active listings and demands from DB).  
**Response**:
```json
{
  "success": true,
  "message": "Matching completed: 12 new matches saved.",
  "data": {
    "matches_inserted": 12,
    "total_computed": 45
  }
}