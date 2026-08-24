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

const NAV_LINK =
  "relative rounded-full px-4 py-2 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_-8px_rgba(20,24,31,0.35)]";

function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [branding, setBranding] = useState(defaultBranding);
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? "border-black/[0.07] bg-white/75 shadow-[0_10px_30px_-18px_rgba(20,24,31,0.5)] backdrop-blur-2xl backdrop-saturate-150"
          : "border-transparent bg-white/40 backdrop-blur-xl"
      }`}
    >
      <div className="brand-container">
        <div
          className={`flex flex-col gap-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex-row lg:items-center lg:justify-between ${
            scrolled ? "py-2.5" : "py-4"
          }`}
        >
          <Link to="/" className="group flex items-center gap-3 perspective-1200">
            <div className="rounded-[24px] border border-white/70 bg-gradient-to-br from-[#fff8dd] to-[#ffe89a] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_-10px_rgba(201,138,5,0.7)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateY(-12deg)_rotateX(6deg)_translateY(-4px)]">
              <img
                src={logoSrc}
                alt={branding.logoAlt || "Company Logo"}
                className={`w-auto object-contain drop-shadow-sm transition-all duration-500 ${
                  scrolled ? "h-11 md:h-12" : "h-16 md:h-20"
                }`}
              />
            </div>
            <div>
              <p className="brand-kicker">{branding.kicker || defaultBranding.kicker}</p>
              <p
                className={`font-black leading-tight tracking-tight transition-all duration-500 ${
                  scrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
                }`}
              >
                {branding.companyName || defaultBranding.companyName}
              </p>
              {!scrolled && (
                <p className="text-sm text-slate-600 md:text-base">
                  {branding.description || defaultBranding.description}
                </p>
              )}
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold md:text-base">
            <Link to="/" className={NAV_LINK}>
              Home
            </Link>

            <div
              className="relative perspective-1200"
              onMouseEnter={openProductsMenu}
              onMouseLeave={closeProductsMenuWithDelay}
            >
              <button type="button" className={NAV_LINK} onClick={() => setShowProductsMenu((prev) => !prev)}>
                Shop Boxes
              </button>

              {showProductsMenu && (
                <div
                  className="absolute right-0 z-20 pt-3 md:left-0 md:right-auto"
                  onMouseEnter={openProductsMenu}
                  onMouseLeave={closeProductsMenuWithDelay}
                >
                  <div className="absolute inset-x-0 -top-3 h-3" />
                  <div className="brand-reveal min-w-[260px] origin-top rounded-[24px] border border-white/70 bg-white/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_60px_-20px_rgba(20,24,31,0.55)] backdrop-blur-2xl">
                    {productCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        className="block w-full rounded-2xl px-4 py-3 text-left text-sm transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1 hover:bg-gradient-to-r hover:from-amber-100 hover:to-amber-50"
                        onClick={() => openCategory(category.value)}
                      >
                        {category.label}
                      </button>
                    ))}

                    <div className="brand-divider my-2" />

                    <Link
                      to="/order"
                      className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-amber-800 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1 hover:bg-gradient-to-r hover:from-amber-100 hover:to-amber-50"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      Custom Order
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user?.role === "admin" && (
              <Link to="/admin" className={NAV_LINK}>
                Admin Dashboard
              </Link>
            )}

            {user && (
              <Link to="/profile" className={NAV_LINK}>
                Profile
              </Link>
            )}

            {user && user.role !== "admin" && (
              <Link to="/invoices" className={NAV_LINK}>
                Invoices
              </Link>
            )}

            {!user ? (
              <Link to="/login" className="brand-button ml-1">
                Login
              </Link>
            ) : user.role === "customer" ? (
              <Link to="/customer" className="brand-button-dark ml-1">
                My Orders
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
