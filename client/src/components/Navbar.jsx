import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";
import api from "../services/api";
import { defaultBranding } from "../utils/siteSettingsDefaults";

const FALLBACK_CATEGORIES = [
  { label: "Carton Box", value: "carton-box" },
  { label: "Corrugated Box", value: "corrugated-box" },
  { label: "Printed Corrugated Box", value: "printed-corrugated-box" },
  { label: "Duplex Box", value: "duplex-box" },
];

function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [branding, setBranding] = useState(defaultBranding);
  const closeMenuTimeoutRef = useRef(null);

  const [productCategories, setProductCategories] = useState(FALLBACK_CATEGORIES);

  const openCategory = (category) => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }
    setShowProductsMenu(false);
    navigate(`/products?category=${category}`);
  };

  const openProductsMenu = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }
    setShowProductsMenu(true);
  };

  const closeProductsMenuWithDelay = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }

    closeMenuTimeoutRef.current = setTimeout(() => {
      setShowProductsMenu(false);
    }, 180);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBranding = async () => {
      try {
        const res = await api.get("/site-settings/branding");
        if (isMounted) {
          setBranding({ ...defaultBranding, ...(res.data || {}) });
        }
      } catch (error) {
        if (isMounted) {
          setBranding(defaultBranding);
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get("/product-types");
        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : [];
          setProductCategories(
            list.length > 0
              ? list.map((item) => ({ label: item.label, value: item.value }))
              : FALLBACK_CATEGORIES
          );
        }
      } catch (error) {
        if (isMounted) {
          setProductCategories(FALLBACK_CATEGORIES);
        }
      }
    };

    fetchBranding();
    fetchCategories();

    return () => {
      if (closeMenuTimeoutRef.current) {
        clearTimeout(closeMenuTimeoutRef.current);
      }
      isMounted = false;
    };
  }, []);

  const logoSrc = branding.logoData || logo;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="brand-container">
        <div className="flex flex-col gap-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-[24px] bg-[var(--brand-primary-soft)] p-2 shadow-sm">
              <img
                src={logoSrc}
                alt={branding.logoAlt || "Company Logo"}
                className="h-16 w-auto object-contain md:h-20"
              />
            </div>
            <div>
              <p className="brand-kicker">{branding.kicker || defaultBranding.kicker}</p>
              <p className="text-2xl font-black leading-tight md:text-3xl">
                {branding.companyName || defaultBranding.companyName}
              </p>
              <p className="text-sm text-slate-500 md:text-base">
                {branding.description || defaultBranding.description}
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold md:text-base">
            <Link to="/" className="rounded-full px-4 py-2 hover:bg-amber-50">
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={openProductsMenu}
              onMouseLeave={closeProductsMenuWithDelay}
            >
              <button
                type="button"
                className="rounded-full px-4 py-2 hover:bg-amber-50"
                onClick={() => setShowProductsMenu((prev) => !prev)}
              >
                Shop Boxes
              </button>

              {showProductsMenu && (
                <div
                  className="absolute right-0 z-20 pt-3 md:right-auto md:left-0"
                  onMouseEnter={openProductsMenu}
                  onMouseLeave={closeProductsMenuWithDelay}
                >
                  <div className="absolute inset-x-0 -top-3 h-3" />
                  <div className="min-w-[250px] rounded-[24px] border border-black/10 bg-white p-3 shadow-2xl">
                    {productCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        className="block w-full rounded-2xl px-4 py-3 text-left text-sm hover:bg-amber-50"
                        onClick={() => openCategory(category.value)}
                      >
                        {category.label}
                      </button>
                    ))}
                    <Link
                      to="/order"
                      className="mt-2 block w-full rounded-2xl px-4 py-3 text-left text-sm hover:bg-amber-50"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      Custom Order
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user?.role === "admin" && (
              <Link to="/admin" className="rounded-full px-4 py-2 hover:bg-amber-50">
                Admin Dashboard
              </Link>
            )}

            {user && (
              <Link to="/profile" className="rounded-full px-4 py-2 hover:bg-amber-50">
                Profile
              </Link>
            )}

            {user && user.role !== "admin" && (
              <Link to="/invoices" className="rounded-full px-4 py-2 hover:bg-amber-50">
                Invoices
              </Link>
            )}

            {!user ? (
              <Link to="/login" className="brand-button">
                Login
              </Link>
            ) : user.role === "customer" ? (
              <Link to="/customer" className="brand-button-dark">
                My Orders
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
