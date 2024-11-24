import mobiles from "../../assets/images/Categories/phone.png";
import fashion from "../../assets/images/Categories/fashion.png";
import electronics from "../../assets/images/Categories/electronics.png";
import home from "../../assets/images/Categories/home.png";
import travel from "../../assets/images/Categories/travel.png";
import appliances from "../../assets/images/Categories/appliances.png";
import furniture from "../../assets/images/Categories/furniture.png";
import beauty from "../../assets/images/Categories/beauty.png";
import grocery from "../../assets/images/Categories/grocery.png";
import { Link } from "react-router-dom";

const catNav = [
    {
        name: "Mobiles",
        icon: mobiles,
    },
    {
        name: "Fashion",
        icon: fashion,
    },
    {
        name: "Electronics",
        icon: electronics,
    },
    {
        name: "Home",
        icon: home,
    },
    {
        name: "Travel",
        icon: travel,
    },
    {
        name: "Appliances",
        icon: appliances,
    },
    {
        name: "Furniture",
        icon: furniture,
    },
    {
        name: "Beauty,Toys & more",
        icon: beauty,
    },
    {
        name: "Grocery",
        icon: grocery,
    },
];

const Categories = () => {
    return (
        <section className="hidden min-w-full p-0 px-12 bg-white sm:block">
          <div className="flex justify-center space-x-4 group">
            {catNav.map((item, i) => (
              <Link
                to={`/products?category=${item.name}`}
                className="flex flex-col items-center"
                key={i}
              >
                <span className="pt-1 pb-2 text-base font-light text-black uppercase border-b-2 border-transparent hover:border-black">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      );
};

export default Categories;
