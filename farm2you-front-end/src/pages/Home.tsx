import heroImage from "../assets/images/hero.jpg";
import tomatoes from "../assets/images/tomatoes.jpg";
import honey from "../assets/images/honey.jpg";
import broccoli from "../assets/images/broccoli.jpg";
import nuts from "../assets/images/nuts.jpg";
import avocado from "../assets/images/avocado.jpg";
import grain from "../assets/images/grain.jpg";

const products = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: "N$25 / kg",
    location: "Windhoek",
    image: tomatoes,
  },
  {
    id: 2,
    name: "Natural Honey",
    price: "N$85 / jar",
    location: "Okahandja",
    image: honey,
  },
  {
    id: 3,
    name: "Fresh Broccoli",
    price: "N$30 / kg",
    location: "Omaruru",
    image: broccoli,
  },
  {
    id: 4,
    name: "Farm Nuts",
    price: "N$60 / kg",
    location: "Otjiwarongo",
    image: nuts,
  },
];

function Home() {
  return (
    <main>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-small">FRESH • LOCAL • NAMIBIAN</p>

          <h1>
            Fresh Produce
            <br />
            Straight From
            <br />
            The Farm
          </h1>

          <p className="hero-description">
            Connecting Namibian farmers directly with restaurants,
            hotels, schools, shops and local buyers.
          </p>

          <div className="hero-buttons">
            <button className="primary-button">
              Browse Produce
            </button>

            <button className="secondary-button">
              Sell Produce
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="Fresh farm produce" />
        </div>
      </section>


      {/* PRODUCTS */}
      <section className="products-section">

        <div className="section-heading">
          <p>FRESH FROM NAMIBIAN FARMS</p>
          <h2>Our Products</h2>
        </div>

        <div className="product-grid">

          {products.map((product) => (
            <article className="product-card" key={product.id}>

              <img
                src={product.image}
                alt={product.name}
              />

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-location">
                  {product.location}
                </p>

                <p className="product-price">
                  {product.price}
                </p>
              </div>

            </article>
          ))}

        </div>

      </section>


      {/* PROMOTION */}
      <section className="promo-section">

        <div className="promo-card">
          <div className="promo-image">
            <img src={avocado} alt="Fresh vegetables" />
          </div>

          <div className="promo-text">
            <p>FOR FARMERS</p>

            <h2>
              Sell Your
              <br />
              Produce
            </h2>

            <button className="primary-button">
              Start Selling
            </button>
          </div>
        </div>


        <div className="promo-card">
          <div className="promo-text">
            <p>FOR BUYERS</p>

            <h2>
              Find Fresh
              <br />
              Local Produce
            </h2>

            <button className="primary-button">
              Find Produce
            </button>
          </div>

          <div className="promo-image">
            <img src={grain} alt="Local produce" />
          </div>
        </div>

      </section>


      {/* FOOTER */}
      <footer>

        <div className="footer-column">
          <h3>Farm2You</h3>

          <p>
            Connecting Namibian farmers and buyers
            through a smarter local marketplace.
          </p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <p>Marketplace</p>
          <p>Sell Produce</p>
          <p>Buy Produce</p>
          <p>Matches</p>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <p>Namibia</p>
          <p>Farm2You Marketplace</p>
        </div>

      </footer>

    </main>
  );
}

export default Home;