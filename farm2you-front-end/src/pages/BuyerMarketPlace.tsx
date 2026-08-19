import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getListings,
} from "../api/api";

import tomatoes from
  "../assets/images/tomatoes.jpg";

import potatoes from
  "../assets/images/potatoes.jpg";

import spinach from
  "../assets/images/spinach.jpg";

import carrots from
  "../assets/images/carrots.jpg";

import farmerProduce from
  "../assets/images/farmer-produce.jpg";


interface Listing {
  id: number;

  producer_id: number;
  product_id: number;

  quantity: number;
  price_per_unit: number;

  available_date: string;

  image_data: string | null;

  product_name: string;
  unit: string;

  producer_name: string;
  producer_location: string;
}


function getFallbackImage(
  productName: string
) {
  const name =
    productName.toLowerCase();

  if (name.includes("tomato")) {
    return tomatoes;
  }

  if (name.includes("potato")) {
    return potatoes;
  }

  if (name.includes("spinach")) {
    return spinach;
  }

  if (name.includes("carrot")) {
    return carrots;
  }

  return farmerProduce;
}


function BuyerMarketPlace() {
  const navigate =
    useNavigate();

  const [
    listings,
    setListings,
  ] = useState<Listing[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =====================================
     LOAD REAL SELLER LISTINGS
  ===================================== */

  useEffect(() => {
    const loadListings =
      async () => {
        try {
          setLoading(true);

          const data =
            await getListings();

          setListings(data);

        } catch (err) {
          console.error(err);

          setError(
            "Could not load available produce."
          );

        } finally {
          setLoading(false);
        }
      };

    loadListings();
  }, []);


  /* =====================================
     SEARCH
  ===================================== */

  const filteredListings =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return listings;
      }

      return listings.filter(
        (listing) =>
          listing.product_name
            .toLowerCase()
            .includes(searchText) ||

          listing.producer_name
            .toLowerCase()
            .includes(searchText) ||

          listing.producer_location
            .toLowerCase()
            .includes(searchText)
      );

    }, [
      listings,
      search,
    ]);


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <main className="dashboard-page">

        <div className="dashboard-heading">
          <div>
            <p>LIVE SUPPLY</p>

            <h1>
              Loading available produce...
            </h1>
          </div>
        </div>

      </main>
    );
  }


  return (
    <main className="dashboard-page">

      {/* =================================
          HEADING
      ================================= */}

      <div className="dashboard-heading">

        <div>

          <p>
            LIVE FARM SUPPLY
          </p>

          <h1>
            Produce Available Now
          </h1>

          <span>
            See what Namibian farmers
            currently have available.
          </span>

        </div>


        <button
          className="find-match-button"
          onClick={() =>
            navigate(
              "/buyer/need"
            )
          }
        >
          Find My Match →
        </button>

      </div>


      {/* =================================
          SEARCH
      ================================= */}

      <div className="marketplace-tools">

        <input
          type="text"
          placeholder="Search tomatoes, potatoes, farms..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <p>
          {error}
        </p>
      )}


      {/* =================================
          NO LISTINGS
      ================================= */}

      {!error &&
        filteredListings.length === 0 && (

          <div className="empty-products">

            <span>
              🌱
            </span>

            <h3>
              No produce available
            </h3>

            <p>
              New farmer listings will
              appear here automatically.
            </p>

          </div>

        )}


      {/* =================================
          REAL LISTINGS
      ================================= */}

      <div className="marketplace-grid">

        {filteredListings.map(
          (listing) => (

            <div
              className="marketplace-card"
              key={listing.id}
            >

              <div className="marketplace-image-placeholder">

                <img
                  src={
                    listing.image_data ||
                    getFallbackImage(
                      listing.product_name
                    )
                  }
                  alt={
                    listing.product_name
                  }
                />

              </div>


              <div className="marketplace-card-content">

                <p className="seller-name">

                  {
                    listing.producer_name
                  }

                </p>


                <h2>

                  {
                    listing.product_name
                  }

                </h2>


                <p>

                  📍
                  {" "}
                  {
                    listing.producer_location
                  }

                </p>


                <div className="marketplace-details">

                  <strong>

                    N$
                    {
                      listing.price_per_unit
                    }
                    {" / "}
                    {
                      listing.unit
                    }

                  </strong>


                  <span>

                    {
                      listing.quantity
                    }
                    {" "}
                    {
                      listing.unit
                    }
                    {" "}
                    available

                  </span>

                </div>


                <p>

                  Available:
                  {" "}
                  {
                    listing.available_date
                  }

                </p>


                <button
                  onClick={() =>
                    navigate(
                      "/buyer/need"
                    )
                  }
                >
                  Find a Match
                </button>

              </div>

            </div>

          )
        )}

      </div>

    </main>
  );
}


export default BuyerMarketPlace;