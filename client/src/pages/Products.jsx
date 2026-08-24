import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Tilt3D from "../components/Tilt3D";
import Reveal from "../components/Reveal";
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
        <div className="brand-panel brand-reveal px-6 py-10 md:px-10">
          <p className="brand-kicker">Shop Front</p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="brand-title text-balance">
                {categoryTitleMap[selectedCategory] || "All Packaging Boxes"}
              </h1>
              <p className="brand-subtitle mt-4">
                Browse production-ready box styles with a cleaner, product-first storefront experience.
              </p>
            </div>

            <Link to="/order" className="brand-button-dark shrink-0">
              Request Custom Box
            </Link>
          </div>

          <div className="brand-divider my-8" />

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
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
                  className={`brand-chip ${
                    selectedCategory === category.value ? "brand-chip-active" : "text-slate-600"
                  }`}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-container brand-scene pb-14">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 90}>
                <Tilt3D max={8} lift={12} className="brand-panel h-full overflow-hidden p-4">
                  <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-50 to-white p-3">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-8 bottom-4 h-5 rounded-[50%] bg-slate-900/20 blur-lg"
                    />
                    <img
                      src={
                        product.image_url
                          ? product.image_url
                          : product.image_data
                          ? product.image_data
                          : "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="brand-layer-2 relative h-56 w-full object-contain drop-shadow-[0_18px_24px_rgba(20,24,31,0.2)]"
                    />
                  </div>

                  <div className="brand-layer-1 p-2 pt-5">
                    <p className="brand-kicker">
                      {categoryTitleMap[getProductCategory(product)] || "Packaging Box"}
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-tight">{product.name}</h3>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                      {product.description || "Quality packaging product"}
                    </p>

                    <div className="brand-divider my-4" />

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-2xl font-black tracking-tight text-amber-700">
                          Rs. {product.price}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Stock: {product.stock}</p>
                      </div>

                      <Link to="/customer" className="brand-button">
                        Order Box
                      </Link>
                    </div>
                  </div>
                </Tilt3D>
              </Reveal>
            ))
          ) : (
            <div className="brand-panel col-span-full p-12 text-center text-slate-600">
              No products found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Products;
