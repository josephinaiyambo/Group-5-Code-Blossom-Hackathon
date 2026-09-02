// matchEngine.js
// Matching logic for Namibia Market Access Network


// =========================================================
// 1. NAMIBIAN LOCATION COORDINATES
// =========================================================

const coords = {
    Windhoek: {
        lat: -22.5700,
        lng: 17.0800
    },

    Otjiwarongo: {
        lat: -20.4600,
        lng: 16.6500
    },

    Swakopmund: {
        lat: -22.6800,
        lng: 14.5300
    },

    "Walvis Bay": {
        lat: -22.9600,
        lng: 14.5100
    },

    Rundu: {
        lat: -17.9200,
        lng: 19.7700
    },

    Oshakati: {
        lat: -17.7800,
        lng: 15.7000
    },

    Gobabis: {
        lat: -22.4500,
        lng: 18.9700
    },

    Keetmanshoop: {
        lat: -26.5800,
        lng: 18.1300
    },

    Mariental: {
        lat: -24.6200,
        lng: 17.9600
    },

    Tsumeb: {
        lat: -19.2300,
        lng: 17.7200
    }
};


// =========================================================
// 2. HAVERSINE DISTANCE
// =========================================================

function haversine(
    lat1,
    lng1,
    lat2,
    lng2
) {
    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI /
        180;

    const dLng =
        (lng2 - lng1) *
        Math.PI /
        180;


    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            dLng / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


// =========================================================
// 3. GET LOCATION COORDINATES
// =========================================================

function getCoords(location) {
    return coords[location] || null;
}


// =========================================================
// 4. CALCULATE DISTANCE
// =========================================================

function calculateDistance(
    locationA,
    locationB
) {
    const coordsA =
        getCoords(locationA);

    const coordsB =
        getCoords(locationB);


    /*
        If we do not recognise one of the
        locations, return a very large
        distance.

        This prevents an unknown location
        from receiving a good distance score.
    */

    if (!coordsA || !coordsB) {
        return 9999;
    }


    return haversine(
        coordsA.lat,
        coordsA.lng,
        coordsB.lat,
        coordsB.lng
    );
}


// =========================================================
// 5. TRANSPORT COST
// =========================================================

function estimateTransportCost(
    distanceKm,
    weightKg
) {
    /*
        N$2.50 per km per tonne
    */

    const ratePerKmPerTonne =
        2.50;


    const tonnes =
        Number(weightKg) /
        1000;


    let cost =
        Number(distanceKm) *
        ratePerKmPerTonne *
        tonnes;


    /*
        Minimum transport charge
    */

    if (cost < 50) {
        cost = 50;
    }


    /*
        Maximum estimate
    */

    if (cost > 20000) {
        cost = 20000;
    }


    return Math.round(
        cost * 100
    ) / 100;
}


// =========================================================
// 6. PRODUCT MATCH
// =========================================================

function calculateProductScore(
    listing,
    demand
) {
    /*
        Our React application now lets the
        buyer and seller choose products
        from the same products table.

        Therefore matching product_id is
        the strongest and most reliable
        product match.
    */

    if (
        listing.product_id &&
        demand.product_id &&
        Number(listing.product_id) ===
        Number(demand.product_id)
    ) {
        return 30;
    }


    /*
        Fallback to product names in case
        older data does not contain IDs.
    */

    const listingName =
        String(
            listing.product_name || ""
        )
            .toLowerCase()
            .trim();


    const demandName =
        String(
            demand.product_name || ""
        )
            .toLowerCase()
            .trim();


    if (
        !listingName ||
        !demandName
    ) {
        return 0;
    }


    if (
        listingName ===
        demandName
    ) {
        return 30;
    }


    if (
        listingName.includes(
            demandName
        ) ||

        demandName.includes(
            listingName
        )
    ) {
        return 20;
    }


    return 0;
}


// =========================================================
// 7. COMPUTE ONE MATCH SCORE
// =========================================================

function computeMatchScore(
    listing,
    demand
) {
    // -----------------------------------------------------
    // PRODUCT
    // Maximum: 30
    // -----------------------------------------------------

    const productScore =
        calculateProductScore(
            listing,
            demand
        );


    // -----------------------------------------------------
    // QUANTITY
    // Maximum: 20
    // -----------------------------------------------------

    const sellerQuantity =
        Number(
            listing.quantity
        );


    const buyerQuantity =
        Number(
            demand.quantity_needed
        );


    let qtyScore = 0;


    if (
        sellerQuantity > 0
    ) {
        const ratio =
            buyerQuantity /
            sellerQuantity;


        if (ratio <= 1) {
            qtyScore = 20;

        } else if (
            ratio <= 1.5
        ) {
            qtyScore = 15;

        } else if (
            ratio <= 2.5
        ) {
            qtyScore = 8;

        } else {
            qtyScore = 2;
        }
    }


    // -----------------------------------------------------
    // PRICE
    // Maximum: 20
    // -----------------------------------------------------

    const sellerPrice =
        Number(
            listing.price_per_unit
        );


    const buyerBudget =
        Number(
            demand.budget_price
        );


    let priceScore = 0;


    if (
        sellerPrice <=
        buyerBudget
    ) {
        priceScore = 20;

    } else if (
        sellerPrice <=
        buyerBudget * 1.2
    ) {
        priceScore = 14;

    } else if (
        sellerPrice <=
        buyerBudget * 1.5
    ) {
        priceScore = 7;

    } else {
        priceScore = 0;
    }


    // -----------------------------------------------------
    // DISTANCE
    // Maximum: 15
    // -----------------------------------------------------

    const distance =
        calculateDistance(
            listing.producer_location,
            demand.buyer_location
        );


    let distanceScore = 0;


    if (distance <= 50) {
        distanceScore = 15;

    } else if (
        distance <= 150
    ) {
        distanceScore = 12;

    } else if (
        distance <= 300
    ) {
        distanceScore = 8;

    } else if (
        distance <= 500
    ) {
        distanceScore = 4;

    } else {
        distanceScore = 1;
    }


    // -----------------------------------------------------
    // TRANSPORT
    // Maximum: 10
    // -----------------------------------------------------

    const transportCost =
        estimateTransportCost(
            distance,
            buyerQuantity
        );


    let transportScore = 0;


    if (
        transportCost <= 100
    ) {
        transportScore = 10;

    } else if (
        transportCost <= 300
    ) {
        transportScore = 7;

    } else if (
        transportCost <= 600
    ) {
        transportScore = 4;

    } else if (
        transportCost <= 1000
    ) {
        transportScore = 2;

    } else {
        transportScore = 0;
    }


    // -----------------------------------------------------
    // AVAILABILITY
    // Maximum: 5
    // -----------------------------------------------------

    /*
        v_active_listings should already
        contain only listings that are:

        - active
        - available from today or earlier

        Therefore anything reaching the
        matching engine receives the full
        availability score.
    */

    const availabilityScore =
        5;


    // -----------------------------------------------------
    // RECURRING DEMAND
    // Bonus: 5
    // -----------------------------------------------------

    let recurringBonus = 0;


    if (
        demand.frequency ===
        "weekly" ||

        demand.frequency ===
        "monthly"
    ) {
        recurringBonus = 5;
    }


    // -----------------------------------------------------
    // TOTAL
    // -----------------------------------------------------

    let total =
        productScore +
        qtyScore +
        priceScore +
        distanceScore +
        transportScore +
        availabilityScore +
        recurringBonus;


    /*
        Score can never exceed 100.
    */

    total =
        Math.min(
            100,
            Math.round(
                total * 10
            ) / 10
        );


    // -----------------------------------------------------
    // PRICE DIFFERENCE
    // -----------------------------------------------------

    /*
        Negative:
        seller is below buyer budget

        Positive:
        seller is above buyer budget
    */

    const priceDifference =
        sellerPrice -
        buyerBudget;


    return {
        total,

        breakdown: {
            product:
                productScore,

            quantity:
                qtyScore,

            price:
                priceScore,

            distance:
                distanceScore,

            transport:
                transportScore,

            availability:
                availabilityScore,

            recurring:
                recurringBonus
        },

        distance,

        transportCost,

        priceDifference
    };
}


// =========================================================
// 8. RUN MATCHING
// =========================================================

async function runMatching(
    connection,
    demandId = null
) {
    try {

        // -------------------------------------------------
        // STEP 1
        // LOAD ACTIVE SELLER LISTINGS
        // -------------------------------------------------

        const [listings] =
            await connection.query(`
                SELECT *
                FROM v_active_listings
            `);


        // -------------------------------------------------
        // STEP 2
        // LOAD BUYER DEMANDS
        // -------------------------------------------------

        let demands;


        if (demandId) {

            /*
                Buyer has just created one demand.

                Only process that particular demand.
            */

            const [rows] =
                await connection.query(
                    `
                    SELECT *
                    FROM v_active_demands
                    WHERE demand_id = ?
                    `,
                    [
                        Number(
                            demandId
                        )
                    ]
                );


            demands = rows;

        } else {

            /*
                Seller has just added new produce.

                Process all open buyer demands,
                because the new listing might match
                any one of them.
            */

            const [rows] =
                await connection.query(`
                    SELECT *
                    FROM v_active_demands
                `);


            demands = rows;
        }


        // -------------------------------------------------
        // NO DATA
        // -------------------------------------------------

        if (
            listings.length === 0 ||
            demands.length === 0
        ) {
            return {
                success: true,

                message:
                    "No active listings or demands available for matching.",

                matches_inserted: 0,

                total_computed: 0
            };
        }


        // -------------------------------------------------
        // STEP 3
        // COMPUTE MATCHES
        // -------------------------------------------------

        const matches = [];


        for (
            const demand
            of demands
        ) {

            for (
                const listing
                of listings
            ) {

                /*
                    First check whether these
                    products are compatible.

                    This prevents us from
                    calculating a score between,
                    for example:

                    Tomatoes ↔ Wheat
                */

                const productScore =
                    calculateProductScore(
                        listing,
                        demand
                    );


                if (
                    productScore === 0
                ) {
                    continue;
                }


                const result =
                    computeMatchScore(
                        listing,
                        demand
                    );


                if (
                    result.total > 0
                ) {

                    matches.push({
                        listing_id:
                            listing.listing_id,

                        demand_id:
                            demand.demand_id,

                        score:
                            result.total,

                        distance_km:
                            result.distance,

                        transport_cost:
                            result.transportCost,

                        price_difference:
                            result.priceDifference,

                        breakdown:
                            result.breakdown
                    });

                }

            }

        }


        // -------------------------------------------------
        // STEP 4
        // SORT BEST MATCHES FIRST
        // -------------------------------------------------

        matches.sort(
            (a, b) =>
                b.score -
                a.score
        );


        // -------------------------------------------------
        // STEP 5
        // REMOVE OLD PENDING MATCHES
        // -------------------------------------------------

        if (demandId) {

            /*
                Very important:

                Do NOT delete everybody's
                pending matches when only one
                buyer creates a new demand.
            */

            await connection.query(
                `
                DELETE FROM matches
                WHERE status = 'pending'
                AND demand_id = ?
                `,
                [
                    Number(
                        demandId
                    )
                ]
            );

        } else {

            /*
                Global refresh.

                Used when seller adds new supply.
            */

            await connection.query(`
                DELETE FROM matches
                WHERE status = 'pending'
            `);

        }


        // -------------------------------------------------
        // STEP 6
        // LIMIT NUMBER OF MATCHES
        // -------------------------------------------------

        const topMatches =
            matches.slice(
                0,
                50
            );


        // -------------------------------------------------
        // STEP 7
        // SAVE MATCHES
        // -------------------------------------------------

        for (
            const match
            of topMatches
        ) {

            await connection.query(
                `
                INSERT INTO matches
                (
                    listing_id,
                    demand_id,
                    score,
                    distance_km,
                    transport_cost,
                    price_difference,
                    status
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'pending'
                )
                `,
                [
                    match.listing_id,
                    match.demand_id,
                    match.score,
                    match.distance_km,
                    match.transport_cost,
                    match.price_difference
                ]
            );

        }


        // -------------------------------------------------
        // STEP 8
        // RETURN RESULT
        // -------------------------------------------------

        return {
            success: true,

            message:
                `Matching completed: ${topMatches.length} matches saved.`,

            matches_inserted:
                topMatches.length,

            total_computed:
                matches.length
        };


    } catch (error) {

        console.error(
            "Matching engine error:",
            error
        );

        throw error;
    }
}


// =========================================================
// 9. EXPORTS
// =========================================================

module.exports = {
    runMatching,
    computeMatchScore,
    calculateDistance,
    estimateTransportCost
};