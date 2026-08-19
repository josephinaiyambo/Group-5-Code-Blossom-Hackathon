import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createListing,
  getListings,
  getProducts,
  runMatching,
} from "../api/api";

import type {
  Product,
} from "../api/api";

import farmerProduce from
  "../assets/images/farmer-produce.jpg";


/* =====================================
   LISTING TYPE

   This is what GET /listings
   should return.
===================================== */

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


function SellerDashboard() {
  const navigate = useNavigate();


  /* =====================================
     DATABASE PRODUCTS
  ===================================== */

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);


  /* =====================================
     SELLER'S REAL LISTINGS
  ===================================== */

  const [
    listings,
    setListings,
  ] = useState<Listing[]>([]);


  /* =====================================
     FORM STATE
  ===================================== */

  const [
    productId,
    setProductId,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    price,
    setPrice,
  ] = useState("");


  /*
    Today's date becomes the default
    "available from" date.
  */

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  const [
    availableDate,
    setAvailableDate,
  ] = useState(today);


  /* =====================================
     IMAGE
  ===================================== */

  const [
    imageData,
    setImageData,
  ] = useState("");


  /* =====================================
     PAGE STATE
  ===================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingListings,
    setLoadingListings,
  ] = useState(true);


  /* =====================================
     PRODUCER INFORMATION

     These are created by SellerSetup.tsx
  ===================================== */

  const producerId =
    Number(
      localStorage.getItem(
        "producerId"
      )
    );


  const producerName =
    localStorage.getItem(
      "producerName"
    ) || "Your Farm";


  const producerLocation =
    localStorage.getItem(
      "producerLocation"
    ) || "";


  /* =====================================
     CURRENT SELECTED PRODUCT
  ===================================== */

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            String(product.id) ===
            productId
        ),

      [
        products,
        productId,
      ]
    );


  /* =====================================
     LOAD SELLER LISTINGS
  ===================================== */

  const loadListings =
    async () => {
      if (!producerId) {
        return;
      }

      try {
        const data =
          await getListings(
            producerId
          );

        setListings(data);

      } catch (error) {
        console.error(
          "Could not load listings:",
          error
        );

      } finally {
        setLoadingListings(false);
      }
    };


  /* =====================================
     LOAD DATA WHEN PAGE OPENS
  ===================================== */

  useEffect(() => {
    /*
      A seller needs a real producer ID.

      If SellerSetup has not been completed,
      send them there first.
    */

    if (!producerId) {
      navigate(
        "/seller/setup"
      );

      return;
    }


    const loadData =
      async () => {
        try {
          setLoadingListings(true);


          /*
            Load the master products table.

            This gives us real product IDs.
          */

          const productData =
            await getProducts();

          setProducts(
            productData
          );


          /*
            Load this farmer's existing
            database listings.
          */

          const listingData =
            await getListings(
              producerId
            );

          setListings(
            listingData
          );

        } catch (error) {
          console.error(error);

          alert(
            "Could not load seller information."
          );

        } finally {
          setLoadingListings(false);
        }
      };


    loadData();

  }, [
    producerId,
    navigate,
  ]);


  /* =====================================
     IMAGE UPLOAD
  ===================================== */

  const handleImageChange =
    (
      e:
        ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];


      if (!file) {
        return;
      }


      /*
        Keep images reasonably small
        for the hackathon demo.
      */

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          "Please choose an image smaller than 5 MB."
        );

        return;
      }


      /*
        IMPORTANT:

        We are using FileReader instead of
        URL.createObjectURL().

        URL.createObjectURL() only creates
        a temporary browser URL.

        FileReader converts the image to
        Base64 so it can actually be sent
        to the backend.
      */

      const reader =
        new FileReader();


      reader.onloadend =
        () => {
          setImageData(
            String(
              reader.result
            )
          );
        };


      reader.readAsDataURL(
        file
      );
    };


  /* =====================================
     ADD PRODUCE
  ===================================== */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();


      if (!producerId) {
        navigate(
          "/seller/setup"
        );

        return;
      }


      if (!productId) {
        alert(
          "Please select a product."
        );

        return;
      }


      if (
        Number(quantity) <= 0
      ) {
        alert(
          "Quantity must be greater than 0."
        );

        return;
      }


      if (
        Number(price) <= 0
      ) {
        alert(
          "Price must be greater than 0."
        );

        return;
      }


      try {
        setLoading(true);


        /* =================================
           STEP 1

           SAVE REAL LISTING TO MYSQL
        ================================= */

        await createListing({
          producer_id:
            producerId,

          product_id:
            Number(productId),

          quantity:
            Number(quantity),

          price_per_unit:
            Number(price),

          available_date:
            availableDate,

          image_data:
            imageData,
        });


        /* =================================
           STEP 2

           RUN MATCHING AGAIN

           Existing buyer demands may now
           match this new seller listing.
        ================================= */

        await runMatching();


        /* =================================
           STEP 3

           RELOAD SELLER'S LISTINGS
        ================================= */

        await loadListings();


        /* =================================
           STEP 4

           RESET FORM
        ================================= */

        setProductId("");

        setQuantity("");

        setPrice("");

        setAvailableDate(
          today
        );

        setImageData("");


        alert(
          "Produce added successfully."
        );

      } catch (error) {
        console.error(
          "Could not add produce:",
          error
        );


        alert(
          error instanceof Error
            ? error.message
            : "Could not add produce."
        );

      } finally {
        setLoading(false);
      }
    };


  return (
    <main className="dashboard-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="dashboard-heading">

        <div>

          <p>
            SELLER DASHBOARD
          </p>


          <h1>
            What do you have
            available?
          </h1>


          <span>
            {producerLocation
              ? `${producerName} • ${producerLocation}`
              : "Add fresh produce and find buyers."}
          </span>

        </div>


        <button
          type="button"
          className="primary-button"
          onClick={() =>
            navigate(
              "/seller/matches"
            )
          }
        >
          View Buyer Matches →
        </button>

      </div>



      <div className="seller-layout">


        {/* =================================
            ADD PRODUCE
        ================================= */}

        <section className="add-product-panel">

          <h2>
            Add Produce
          </h2>


          <form
            onSubmit={
              handleSubmit
            }
          >


            {/* PRODUCT IMAGE */}

            <div className="form-group">

              <label>
                Product Image
              </label>


              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={
                  handleImageChange
                }
              />

            </div>


            {/* IMAGE PREVIEW */}

            {imageData && (

              <div className="image-preview">

                <img
                  src={imageData}
                  alt="Product preview"
                />

              </div>

            )}



            {/* PRODUCT */}

            <div className="form-group">

              <label>
                What are you selling?
              </label>


              <select
                value={productId}

                onChange={(e) =>
                  setProductId(
                    e.target.value
                  )
                }

                required
              >

                <option value="">
                  Select produce
                </option>


                {products.map(
                  (product) => (

                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </option>

                  )
                )}

              </select>

            </div>



            {/* UNIT */}

            {selectedProduct && (

              <div className="form-group">

                <label>
                  Unit
                </label>


                <input
                  value={
                    selectedProduct.unit
                  }
                  readOnly
                />

              </div>

            )}



            {/* QUANTITY */}

            <div className="form-group">

              <label>
                Quantity Available
              </label>


              <input
                type="number"

                min="1"

                step="0.01"

                placeholder="e.g. 120"

                value={quantity}

                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }

                required
              />

            </div>



            {/* PRICE */}

            <div className="form-group">

              <label>
                Price Per{" "}
                {selectedProduct?.unit ||
                  "Unit"}
              </label>


              <div className="money-input">

                <span>
                  N$
                </span>


                <input
                  type="number"

                  min="0.01"

                  step="0.01"

                  placeholder="e.g. 25"

                  value={price}

                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }

                  required
                />

              </div>

            </div>



            {/* LOCATION */}

            <div className="form-group">

              <label>
                Farm Location
              </label>


              <input
                type="text"
                value={
                  producerLocation
                }
                readOnly
              />

            </div>



            {/* AVAILABILITY */}

            <div className="form-group">

              <label>
                Available From
              </label>


              <input
                type="date"

                value={
                  availableDate
                }

                onChange={(e) =>
                  setAvailableDate(
                    e.target.value
                  )
                }

                required
              />

            </div>



            {/* SUBMIT */}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >

              {loading
                ? "Adding Produce..."
                : "Add Produce"}

            </button>

          </form>

        </section>



        {/* =================================
            SELLER LISTINGS
        ================================= */}

        <section className="seller-products">

          <div className="seller-products-heading">

            <div>

              <p>
                YOUR SUPPLY
              </p>

              <h2>
                Your Listings
              </h2>

            </div>


            <span>
              {listings.length}
              {" "}
              active listing
              {listings.length !== 1
                ? "s"
                : ""}
            </span>

          </div>


          {/* LOADING */}

          {loadingListings ? (

            <div className="empty-products">

              <span>
                🌱
              </span>

              <h3>
                Loading your produce...
              </h3>

            </div>

          ) : listings.length === 0 ? (

            /* EMPTY */

            <div className="empty-products">

              <span>
                🌱
              </span>

              <h3>
                No produce listed yet
              </h3>

              <p>
                Add your first product
                using the form.
              </p>

            </div>

          ) : (

            /* REAL DATABASE LISTINGS */

            listings.map(
              (listing) => (

                <div
                  className="seller-product-card"
                  key={listing.id}
                >


                  <img
                    className="seller-product-image"

                    src={
                      listing.image_data ||
                      farmerProduce
                    }

                    alt={
                      listing.product_name
                    }
                  />


                  <div className="seller-product-info">

                    <p className="seller-name">
                      AVAILABLE
                    </p>


                    <h3>
                      {
                        listing.product_name
                      }
                    </h3>


                    <p>

                      {
                        Number(
                          listing.quantity
                        )
                      }
                      {" "}
                      {
                        listing.unit
                      }
                      {" "}
                      available

                    </p>


                    <span>

                      📍
                      {" "}
                      {
                        listing.producer_location
                      }

                    </span>


                    <span>

                      Available from:
                      {" "}
                      {
                        listing.available_date
                      }

                    </span>

                  </div>


                  <strong>

                    N$
                    {
                      Number(
                        listing.price_per_unit
                      ).toFixed(2)
                    }

                    /
                    {
                      listing.unit
                    }

                  </strong>


                </div>

              )
            )

          )}

        </section>

      </div>

    </main>
  );
}


export default SellerDashboard;