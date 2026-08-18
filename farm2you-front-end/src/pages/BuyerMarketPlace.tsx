const products = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    seller: "Green Valley Farm",
    location: "Windhoek",
    price: 25,
    amount: "120 kg",
  },
  {
    id: 2,
    name: "Potatoes",
    seller: "Okahandja Fresh Produce",
    location: "Okahandja",
    price: 18,
    amount: "300 kg",
  },
  {
    id: 3,
    name: "Spinach",
    seller: "Northern Greens",
    location: "Oshakati",
    price: 12,
    amount: "80 bunches",
  },
  {
    id: 4,
    name: "Carrots",
    seller: "Sunrise Farm",
    location: "Otjiwarongo",
    price: 22,
    amount: "150 kg",
  },
];

function BuyerMarketPlace() {
  return (
    <main className="dashboard-page">

      <div className="dashboard-heading">
        <div>
          <p>FARM2YOU MARKETPLACE</p>
          <h1>Fresh Produce Near You</h1>

          <span>
            Discover produce directly from Namibian farmers.
          </span>
        </div>
      </div>

      <div className="marketplace-tools">
        <input
          type="text"
          placeholder="Search tomatoes, potatoes, spinach..."
        />

        <select>
          <option>All Categories</option>
          <option>Vegetables</option>
          <option>Fruit</option>
          <option>Grains</option>
          <option>Livestock Products</option>
        </select>
      </div>

      <div className="marketplace-grid">

        {products.map((product) => (
          <div className="marketplace-card" key={product.id}>

            <div className="marketplace-image-placeholder">
              🌱
            </div>

            <div className="marketplace-card-content">

              <p className="seller-name">
                {product.seller}
              </p>

              <h2>{product.name}</h2>

              <p>{product.location}</p>

              <div className="marketplace-details">
                <strong>N${product.price} / kg</strong>
                <span>{product.amount} available</span>
              </div>

              <button>
                View Product
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}

export default BuyerMarketPlace;