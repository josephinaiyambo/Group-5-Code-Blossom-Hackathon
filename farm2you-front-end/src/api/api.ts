const BUYER_API =
  import.meta.env.VITE_PERSON_B_API_URL;

const MATCH_API =
  import.meta.env.VITE_MATCH_ENGINE_API_URL;


export async function createBuyer(data: {
  name: string;
  type: string;
  location: string;
  region: string;
  contact: string;
}) {
  const response = await fetch(`${BUYER_API}/buyers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Could not create buyer");
  }

  return response.json();
}


export async function getBuyer(id: number) {
  const response = await fetch(
    `${BUYER_API}/buyers/${id}`
  );

  if (!response.ok) {
    throw new Error("Could not load buyer");
  }

  return response.json();
}




export async function createDemand(data: {
  buyer_id: number;
  product_id: number;
  quantity_needed: number;
  budget_price: number;
  frequency: "once" | "weekly" | "monthly";
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
    const error = await response.json();

    throw new Error(
      error.error || "Could not create demand"
    );
  }

  return response.json();
}


export async function getDemands() {
  const response = await fetch(
    `${BUYER_API}/demands`
  );

  if (!response.ok) {
    throw new Error("Could not load demands");
  }

  return response.json();
}


/* =========================
   MATCHING
========================= */

export async function runMatching() {
  const response = await fetch(
    `${MATCH_API}/api/matches/run`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Matching failed");
  }

  return response.json();
}


export async function getMatches() {
  const response = await fetch(
    `${MATCH_API}/api/matches`
  );

  if (!response.ok) {
    throw new Error("Could not load matches");
  }

  return response.json();
}