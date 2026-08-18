# 🇳🇦 Part C: Matching Engine – Namibia Market Access Network

> **Hackathon 2026** – Connecting Namibian producers to buyers with intelligent match scoring.

## What This Does

This is the **brain** of the platform. It takes all active product listings (supply) and buyer demands (demand), runs a smart scoring algorithm, and ranks the best business opportunities. It also calculates distance, transport cost, and price differences automatically.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MySQL (via `mysql2`)
- **Algorithm**: Pure JavaScript (Haversine formula for distance, weighted scoring)

## How It Works (The Scoring System)

| Factor | Weight | Why it matters |
|--------|--------|----------------|
| **Product Match** | 30 pts | Ensures we don't match apples to onions |
| **Quantity Feasibility** | 20 pts | Can the seller fulfill the entire order? |
| **Price Alignment** | 20 pts | Is the seller's price within the buyer's budget? |
| **Distance (Logistics)** | 15 pts | Lower distance = lower fuel/time cost |
| **Transport Cost** | 10 pts | Estimates actual delivery fees |
| **Recurring Demand** | 5 pts | Bonus for stable, repeat business |

## API Endpoints

- `POST /api/matches/run` – Triggers the matching engine, computes scores, and saves to DB.
- `GET /api/matches` – Returns the top pending matches ranked by score.

## Setup Instructions

1. Clone the repo.
2. Run the SQL schema in `/sql/schema.sql` to set up your database.
3. Copy `.env.example` to `.env` and fill in your database credentials.
4. Run `npm install` inside `/backend`.
5. Run `npm start` to launch the server on port 5000.

## Files I Own (Part C)

- `sql/schema.sql` – Database tables and sample data.
- `backend/matchEngine.js` – The core scoring logic.
- `backend/server.js` – REST API to run matching and fetch results.
- `frontend-demo/index.html` – Standalone UI prototype (for judging demos).

## Demo Example

> A farmer in Otjiwarongo has 1,500 kg of tomatoes at N$8/kg.  
> A hotel in Windhoek needs 300 kg/month at N$10/kg.  
> **Result**: Score = 82.5, Distance = 249 km, Transport = N$186.  
> This is displayed as the #1 match.

---

**Built with ❤️ for the Namibia Hackathon 2026**