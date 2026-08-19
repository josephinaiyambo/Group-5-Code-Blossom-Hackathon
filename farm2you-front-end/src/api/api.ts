const BUYER_API =
  import.meta.env.VITE_PERSON_B_API_URL;

const MATCH_API =
  import.meta.env.VITE_MATCH_ENGINE_API_URL;


/* =========================================================
   TYPES
========================================================= */

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
}


export interface Buyer {
  id: number;
  name: string;
  type: string;
  location: string;
  region: string;
  contact: string;
}


export interface Producer {
  id: number;
  name: string;
  type: string;
  location: string;
  contact_phone: string | null;
  contact_email: string | null;
}


export interface Listing {
  id: number;

  producer_id: number;
  product_id: number;

  quantity: number;
  price_per_unit: number;

  available_date: string;

  image_data: string | null;

  product_name?: string;
  unit?: string;

  producer_name?: string;
  producer_location?: string;
}


/* =========================================================
   PRODUCTS
========================================================= */

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(
    `${BUYER_API}/products`
  );

  if (!response.ok) {
    throw new Error(
      "Could not load products"
    );
  }

  return response.json();
}


/* =========================================================
   BUYERS
========================================================= */

export async function createBuyer(data: {
  name: string;
  type: string;
  location: string;
  region: string;
  contact: string;
}) {
  const response = await fetch(
    `${BUYER_API}/buyers`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.error ||
      "Could not create buyer"
    );
  }

  return response.json();
}


export async function getBuyer(
  id: number
) {
  const response = await fetch(
    `${BUYER_API}/buyers/${id}`
  );

  if (!response.ok) {
    throw new Error(
      "Could not load buyer"
    );
  }

  return response.json();
}


/* =========================================================
   PRODUCERS / FARMERS
========================================================= */

export async function createProducer(data: {
  name: string;

  type:
    | "individual"
    | "cooperative"
    | "company"
    | "farm";

  location: string;

  contact_phone: string;

  contact_email: string;
}) {
  const response = await fetch(
    `${BUYER_API}/producers`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.error ||
      "Could not create producer"
    );
  }

  return response.json();
}


export async function getProducer(
  id: number
) {
  const response = await fetch(
    `${BUYER_API}/producers/${id}`
  );

  if (!response.ok) {
    throw new Error(
      "Could not load producer"
    );
  }

  return response.json();
}


/* =========================================================
   SELLER LISTINGS
========================================================= */

export async function createListing(data: {
  producer_id: number;

  product_id: number;

  quantity: number;

  price_per_unit: number;

  available_date: string;

  image_data?: string;
}) {
  const response = await fetch(
    `${BUYER_API}/listings`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.error ||
      "Could not create listing"
    );
  }

  return response.json();
}


export async function getListings(
  producerId?: number
) {
  let url =
    `${BUYER_API}/listings`;

  if (producerId) {
    url +=
      `?producer_id=${producerId}`;
  }

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Could not load listings"
    );
  }

  return response.json();
}


/* =========================================================
   BUYER DEMANDS
========================================================= */

export async function createDemand(data: {
  buyer_id: number;

  product_id: number;

  quantity_needed: number;

  budget_price: number;

  frequency:
    | "once"
    | "weekly"
    | "monthly";
}) {
  const response = await fetch(
    `${BUYER_API}/demands`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error =
      await response.json();

    throw new Error(
      error.error ||
      "Could not create demand"
    );
  }

  return response.json();
}


export async function getDemands() {
  const response = await fetch(
    `${BUYER_API}/demands`
  );

  if (!response.ok) {
    throw new Error(
      "Could not load demands"
    );
  }

  return response.json();
}


/* =========================================================
   MATCHING ENGINE
========================================================= */

export async function runMatching(
  demandId?: number
) {
  const response = await fetch(
    `${MATCH_API}/api/matches/run`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(
        demandId
          ? {
              demand_id: demandId,
            }
          : {}
      ),
    }
  );

  if (!response.ok) {
    let message =
      "Matching failed";

    try {
      const error =
        await response.json();

      message =
        error.error ||
        error.message ||
        message;

    } catch {
      // Leave the default message.
    }

    throw new Error(message);
  }

  return response.json();
}


/* =========================================================
   GET MATCHES

   Buyer example:
   getMatches({
     demandId: 5
   })

   Seller example:
   getMatches({
     producerId: 2
   })
========================================================= */

export async function getMatches(
  filters: {
    demandId?: number;
    producerId?: number;
  } = {}
) {
  const params =
    new URLSearchParams();


  if (filters.demandId) {
    params.set(
      "demand_id",
      String(filters.demandId)
    );
  }


  if (filters.producerId) {
    params.set(
      "producer_id",
      String(filters.producerId)
    );
  }


  const query =
    params.toString();


  const url =
    query
      ? `${MATCH_API}/api/matches?${query}`
      : `${MATCH_API}/api/matches`;


  const response =
    await fetch(url);


  if (!response.ok) {
    throw new Error(
      "Could not load matches"
    );
  }


  return response.json();
}