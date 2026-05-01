import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const fallbackTypes = [
    { label: "Carton Box", value: "carton-box" },
    { label: "Corrugated Box", value: "corrugated-box" },
    { label: "Printed Corrugated Box", value: "printed-corrugated-box" },
    { label: "Duplex Box", value: "duplex-box" },
  ];
  const typeList = productTypes.length > 0 ? productTypes : fallbackTypes;
  const categoryTitleMap = typeList.reduce((acc, item) => {
    acc[item.value] = item.label;
    return acc;
  }, {});
  const categoryOptions = [{ label: "All Boxes", value: "" }, ...typeList];

  const getProductCategory = (product) => product.box_type || "corrugated-box";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
        setProducts([]);
      }
    };

    const loadTypes = async () => {
      try {
        const res = await api.get("/product-types");
        setProductTypes(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
        setProductTypes([]);
      }
    };

    loadProducts();
    loadTypes();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || getProductCategory(product) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="brand-page">
      <Navbar />

      <section className="brand-container py-8">
        <div className="brand-panel px-6 py-10 md:px-10">
          <p className="brand-kicker">Shop Front</p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black md:text-5xl">
                {categoryTitleMap[selectedCategory] || "All Packaging Boxes"}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Browse production-ready box styles with a cleaner, product-first storefront experience.
              </p>
            </div>

            <Link to="/order" className="brand-button-dark">
              Request Custom Box
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <input
              type="text"
              placeholder="Search boxes..."
              className="brand-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <Link
                  key={category.label}
                  to={category.value ? `/products?category=${category.value}` : "/products"}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    selectedCategory === category.value
                      ? "bg-[var(--brand-primary)] text-[var(--brand-ink)]"
                      : "bg-white text-slate-600 hover:bg-amber-50"
                  }`}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-container pb-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="brand-panel brand-card-hover overflow-hidden p-4">
                <img
                  src={product.image_url
                    ? product.image_url
                    : product.image_data
                    ? product.image_data
                    : "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="h-64 w-full rounded-[24px] bg-gray-100 object-contain p-4"
                />

                <div className="p-2 pt-5">
                  <p className="brand-kicker">
                    {categoryTitleMap[getProductCategory(product)] || "Packaging Box"}
                  </p>

                  <h3 className="mt-2 text-2xl font-black">{product.name}</h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                    {product.description || "Quality packaging product"}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black text-amber-700">
                        Rs. {product.price}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Stock: {product.stock}</p>
                    </div>

                    <Link to="/customer" className="brand-button">
                      Order Box
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="brand-panel col-span-full p-10 text-center text-gray-600">
              No products found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Products;
