import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import ScrollToTopOnRouteChange from "../../utils/ScrollToTopOnRouteChange";
import Categories from "../../components/header/Categories";
// import { electronicProducts } from "../../utils/electronics";
// import { accessories } from "../../utils/accessories";
// import { fashionProducts } from "../../utils/fashion";
// import { applianceProducts } from "../../utils/appliances";
// import { furnitureProducts } from "../../utils/furniture";
// import electronics from "../../assets/images/electronics-card.jpg";
// import accessoryCard from "../../assets/images/accessory-card.jpg";
// import fashionCard from "../../assets/images/fashion-card.jpg";
// import applianceCard from "../../assets/images/appliance-card.jpg";
// import furnitureCard from "../../assets/images/furniture-card.jpg";
// import Suggestion from "./Suggestions/Suggestion";
import SeoData from "../../SEO/SeoData";
import axios from "axios";
import Spinner from "../../components/Spinner";
import Product from "../../components/ProductListing/Product";
import Pagination from "@mui/material/Pagination";
import bannerImage from "../../assets/images/banner.png";

const Home = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("Athlete"); // Set category to 'Electronics'
  const [price, setPrice] = useState([0, 200000]);
  const [ratings, setRatings] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [productsCount, setProductsCount] = useState(0);

  // Calculate total pages based on number of products and products per page
  const totalPages = Math.ceil(productsCount / productsPerPage);

  // Calculate range of products to show on the current page
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/product/filtered-products`,
          {
            params: {
              category: category,
              priceRange: [
                parseInt(price[0].toFixed()),
                parseInt(price[1].toFixed()),
              ],
              ratings: ratings,
            },
          }
        );
        if (res.status === 201) {
          setProducts(res.data.products);
          setProductsCount(res.data.products.length);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchFilteredData();
  }, [category, price, ratings, currentPage]);

  return (
    <>
      <SeoData title="Online Shopping Site for Mobiles, Electronics, Furniture, Grocery, Lifestyle, Books & More. Best Offers!" />
      <ScrollToTopOnRouteChange />
      <Categories />
      <main className="flex-col items-center gap-3 px-2 pb-5 sm:mt-2">
        {/* Banner Section */}
        <div
          className="w-full h-[600px] sm:h-[600px] bg-cover bg-center rounded-lg shadow-md mb-4"
          style={{
            // Use the imported image as background
            backgroundImage: `url(${bannerImage})`,
          }}
        >
          {/* Optional overlay for text */}
          <div className="flex items-center justify-center w-full h-full text-center text-white bg-black bg-opacity-40">
            {/* <h2 className="ml-40 text-3xl font-semibold">Active Attire</h2> */}
          </div>
        </div>

        {/* Product Listing */}
        <div className="relative flex-1">
          {/* Loading or no products found */}
          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-start gap-3 bg-white shadow-sm rounded-sm p-6 sm:p-16 sm:min-h-[750px] mt-20 mb-5">
              <img
                draggable="true"
                className="object-contain w-1/2 h-44"
                src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/error-no-search-results_2353c5.png"
                alt="Search Not Found"
              />
              <h1 className="text-2xl font-medium text-gray-900">
                Sorry, no results found!
              </h1>
              <p className="text-xl text-center text-primary-grey">
                Please check the spelling or try searching for something else.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-2 pb-4">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 w-full place-content-start pb-4 min-h-[750px]">
                {currentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="relative p-2 hover:outline-[1px] hover:outline-black transition-all"
                  >
                    <Product key={product._id} {...product} />
                  </div>
                ))}
              </div>
              {productsCount > productsPerPage && (
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
