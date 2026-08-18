// matchEngine.js - Part C: Matching Logic for Namibia Market Access Network
const mysql = require('mysql2/promise');

// ---------- HELPER: Haversine Distance (km) ----------
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------- LOCATION COORDINATES (Namibia) ----------
const coords = {
    'Windhoek': { lat: -22.5700, lng: 17.0800 },
    'Otjiwarongo': { lat: -20.4600, lng: 16.6500 },
    'Swakopmund': { lat: -22.6800, lng: 14.5300 },
    'Walvis Bay': { lat: -22.9600, lng: 14.5100 },
    'Rundu': { lat: -17.9200, lng: 19.7700 },
    'Oshakati': { lat: -17.7800, lng: 15.7000 },
    'Gobabis': { lat: -22.4500, lng: 18.9700 },
    'Keetmanshoop': { lat: -26.5800, lng: 18.1300 },
    'Mariental': { lat: -24.6200, lng: 17.9600 },
    'Tsumeb': { lat: -19.2300, lng: 17.7200 }
};

function getCoords(location) { return coords[location] || null; }

function calculateDistance(locA, locB) {
    const cA = getCoords(locA);
    const cB = getCoords(locB);
    if (!cA || !cB) return 9999;
    return haversine(cA.lat, cA.lng, cB.lat, cB.lng);
}

function estimateTransportCost(distanceKm, weightKg) {
    const rate = 2.50; // N$ per km per tonne
    let cost = distanceKm * rate * (weightKg / 1000);
    if (cost < 50) cost = 50;
    if (cost > 20000) cost = 20000;
    return Math.round(cost * 100) / 100;
}

// ---------- MAIN MATCHING FUNCTION ----------
function computeMatchScore(listing, demand) {
    // Product match (name match)
    let productScore = 0;
    const prodName = listing.product_name.toLowerCase().trim();
    const demandName = demand.product_name.toLowerCase().trim();
    if (prodName === demandName) productScore = 30;
    else if (prodName.includes(demandName) || demandName.includes(prodName)) productScore = 20;
    else productScore = 0;

    // Quantity match
    let qtyScore = 0;
    const ratio = demand.quantity / listing.quantity;
    if (ratio <= 1) qtyScore = 20;
    else if (ratio <= 1.5) qtyScore = 15;
    else if (ratio <= 2.5) qtyScore = 8;
    else qtyScore = 2;

    // Price match
    let priceScore = 0;
    if (listing.price_per_unit <= demand.budget_per_unit) priceScore = 20;
    else if (listing.price_per_unit <= demand.budget_per_unit * 1.2) priceScore = 14;
    else if (listing.price_per_unit <= demand.budget_per_unit * 1.5) priceScore = 7;
    else priceScore = 0;

    // Distance score
    const dist = calculateDistance(listing.producer_location, demand.buyer_location);
    let distanceScore = 0;
    if (dist <= 50) distanceScore = 15;
    else if (dist <= 150) distanceScore = 12;
    else if (dist <= 300) distanceScore = 8;
    else if (dist <= 500) distanceScore = 4;
    else distanceScore = 1;

    // Transport cost score
    const transportCost = estimateTransportCost(dist, demand.quantity);
    let transportScore = 0;
    if (transportCost <= 100) transportScore = 10;
    else if (transportCost <= 300) transportScore = 7;
    else if (transportCost <= 600) transportScore = 4;
    else if (transportCost <= 1000) transportScore = 2;
    else transportScore = 0;

    // Availability bonus
    let availScore = 5; // Default if available
    // Recurring bonus
    let recurringBonus = (demand.recurring == 1) ? 5 : 0;

    let total = productScore + qtyScore + priceScore + distanceScore + transportScore + availScore + recurringBonus;
    total = Math.min(100, Math.round(total * 10) / 10);

    return {
        total,
        breakdown: { product: productScore, quantity: qtyScore, price: priceScore, distance: distanceScore, transport: transportScore, availability: availScore, recurring: recurringBonus },
        distance: dist,
        transportCost: transportCost,
        priceDifference: listing.price_per_unit - demand.budget_per_unit
    };
}

// ---------- RUN MATCHING AND SAVE TO DB ----------
async function runMatching(connection) {
    try {
        // 1. Fetch active listings and demands
        const [listings] = await connection.query(`
            SELECT * FROM v_active_listings
        `);
        const [demands] = await connection.query(`
            SELECT * FROM v_active_demands
        `);

        if (listings.length === 0 || demands.length === 0) {
            return { success: false, message: 'No active listings or demands found.' };
        }

        // 2. Compute matches
        const matches = [];
        for (const demand of demands) {
            for (const listing of listings) {
                // Only match if product names match (or similar)
                const prodA = listing.product_name.toLowerCase().trim();
                const prodB = demand.product_name.toLowerCase().trim();
                if (prodA !== prodB && !prodA.includes(prodB) && !prodB.includes(prodA)) continue;

                const result = computeMatchScore(listing, demand);
                if (result.total > 0) {
                    matches.push({
                        listing_id: listing.listing_id,
                        demand_id: demand.demand_id,
                        score: result.total,
                        distance_km: result.distance,
                        transport_cost: result.transportCost,
                        price_difference: result.priceDifference,
                        breakdown: JSON.stringify(result.breakdown) // store breakdown as JSON
                    });
                }
            }
        }

        // 3. Sort by score descending
        matches.sort((a, b) => b.score - a.score);

        // 4. Delete old matches (optional, or just insert new ones)
        await connection.query('DELETE FROM matches WHERE status = "pending"');

        // 5. Insert new matches (top 50 to avoid bloat)
        const topMatches = matches.slice(0, 50);
        for (const match of topMatches) {
            await connection.query(`
                INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
            `, [match.listing_id, match.demand_id, match.score, match.distance_km, match.transport_cost, match.price_difference]);
        }

        return { success: true, matches_inserted: topMatches.length, total_computed: matches.length };

    } catch (error) {
        console.error('Matching engine error:', error);
        throw error;
    }
}

module.exports = { runMatching, computeMatchScore, calculateDistance };