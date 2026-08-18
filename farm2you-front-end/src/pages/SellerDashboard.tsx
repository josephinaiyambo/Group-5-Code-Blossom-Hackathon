import { useState } from "react";

interface Product {
  id: number;
  name: string;
  quantity: string;
  price: string;
  location: string;
}

function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: Date.now(),
      name,
      quantity,
      price,
      location,
    };

    setProducts([...products, newProduct]);

    setName("");
    setQuantity("");
    setPrice("");
    setLocation("");
  };

  return (
    <main className="dashboard-page">

      <div className="dashboard-heading">

        <div>
          <p>SELLER DASHBOARD</p>

          <h1>Your Farm Produce</h1>

          <span>
            Add produce and make it available to buyers across Namibia.
          </span>
        </div>

      </div>


      <div className="seller-layout">

        <section className="add-product-panel">

          <h2>Add Produce</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Produce Name</label>

              <input
                type="text"
                placeholder="e.g. Tomatoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>


            <div className="form-group">
              <label>Quantity Available</label>

              <input
                type="text"
                placeholder="e.g. 120 kg"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>


            <div className="form-group">
              <label>Price</label>

              <input
                type="number"
                placeholder="e.g. 25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>


            <div className="form-group">
              <label>Location</label>

              <input
                type="text"
                placeholder="e.g. Windhoek"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>


            <button className="login-submit" type="submit">
              Add Produce
            </button>

          </form>

        </section>


        <section className="seller-products">

          <h2>Your Listings</h2>

          {products.length === 0 ? (

            <div className="empty-products">
              <span>🌱</span>

              <h3>No produce listed yet</h3>

              <p>
                Add your first product using the form.
              </p>
            </div>

          ) : (

            products.map((product) => (

              <div className="seller-product-card" key={product.id}>

                <div>
                  <h3>{product.name}</h3>

                  <p>
                    {product.quantity} available
                  </p>

                  <span>
                    {product.location}
                  </span>
                </div>

                <strong>
                  N${product.price}
                </strong>

              </div>

            ))

          )}

        </section>

      </div>

    </main>
  );
}

export default SellerDashboard;