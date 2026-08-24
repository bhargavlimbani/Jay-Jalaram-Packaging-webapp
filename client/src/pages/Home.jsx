import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Tilt3D from "../components/Tilt3D";
import Reveal from "../components/Reveal";
import BoxCluster from "../components/BoxCluster";
import { AuthContext } from "../context/AuthContext";
import smallBoxImage from "../assets/small.png";
import mediumBoxImage from "../assets/Medium.png";
import largeBoxImage from "../assets/large.png";
import api from "../services/api";
import { defaultHome } from "../utils/siteSettingsDefaults";

function Home() {
  const { user } = useContext(AuthContext);
  const [selectedContact, setSelectedContact] = useState(null);
  const [homeContent, setHomeContent] = useState(defaultHome);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeSettings = async () => {
      try {
        const res = await api.get("/site-settings/home");
        if (isMounted) {
          setHomeContent({ ...defaultHome, ...(res.data || {}) });
        }
      } catch (error) {
        if (isMounted) {
          setHomeContent(defaultHome);
        }
      }
    };

    fetchHomeSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const contacts =
    Array.isArray(homeContent.contacts) && homeContent.contacts.length > 0
      ? homeContent.contacts
      : defaultHome.contacts;

  const stats =
    Array.isArray(homeContent.stats) && homeContent.stats.length > 0
      ? homeContent.stats
      : defaultHome.stats;

  const collectionItems =
    Array.isArray(homeContent.collectionItems) &&
    homeContent.collectionItems.length > 0
      ? homeContent.collectionItems
      : defaultHome.collectionItems;

  const benefitsPoints =
    Array.isArray(homeContent.benefitsPoints) &&
    homeContent.benefitsPoints.length > 0
      ? homeContent.benefitsPoints
      : defaultHome.benefitsPoints;

  return (
    <div className="brand-page">
      <Navbar />

      {/* ---------- Hero ---------- */}
      <section className="brand-container py-8 lg:py-12">
        <div className="brand-panel brand-scene overflow-hidden">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
            <div className="brand-reveal brand-reveal-1 flex flex-col justify-center">
              <p className="brand-kicker">
                {homeContent.heroKicker || defaultHome.heroKicker}
              </p>
              <h1 className="brand-title mt-4 text-balance">
                {homeContent.heroTitle || defaultHome.heroTitle}
              </h1>
              <p className="brand-subtitle mt-5 max-w-2xl">
                {homeContent.heroSubtitle || defaultHome.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/products" className="brand-button">
                  {homeContent.primaryCtaLabel || defaultHome.primaryCtaLabel}
                </Link>
                <Link to="/order" className="brand-button-dark">
                  {homeContent.secondaryCtaLabel || defaultHome.secondaryCtaLabel}
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((stat, index) => (
                  <Tilt3D
                    key={`${stat.label}-${index}`}
                    max={12}
                    lift={6}
                    scale={1.04}
                    className={`brand-tile p-4 ${index === 0 ? "brand-tile-amber" : ""}`}
                  >
                    <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                  </Tilt3D>
                ))}
              </div>

              {user?.role === "customer" && (
                <div className="brand-tile brand-tile-amber mt-6 px-5 py-4 text-sm font-semibold text-amber-950">
                  Welcome back, {user.name}. Your cart-style order flow is ready in the customer dashboard.
                </div>
              )}
            </div>

            {/* 3D stage */}
            <div className="brand-reveal brand-reveal-3 relative flex flex-col items-center justify-center gap-10">
              <BoxCluster size={196} className="relative z-10" />

              <Tilt3D max={10} lift={12} className="brand-tile z-10 w-full max-w-md p-5">
                <div className="brand-layer-1">
                  <p className="brand-kicker">Featured Range</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">
                    {homeContent.featureTitle || defaultHome.featureTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {homeContent.featureDescription || defaultHome.featureDescription}
                  </p>
                </div>

                <div className="brand-layer-2 mt-5 grid grid-cols-3 gap-3">
                  {[smallBoxImage, mediumBoxImage, largeBoxImage].map((image, index) => (
                    <img
                      key={image}
                      src={image}
                      alt=""
                      className={`brand-image-3d h-20 w-full rounded-2xl bg-white/70 object-contain p-2 ${
                        index === 1 ? "brand-float-delay" : "brand-float-slow"
                      }`}
                    />
                  ))}
                </div>
              </Tilt3D>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Collection ---------- */}
      <section className="brand-container brand-scene py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {collectionItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <Tilt3D max={8} lift={12} className="brand-panel h-full overflow-hidden p-4">
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-50 to-white p-3">
                  <img
                    src={[smallBoxImage, mediumBoxImage, largeBoxImage][index % 3]}
                    alt={item.title}
                    className="brand-layer-2 h-56 w-full object-contain drop-shadow-[0_22px_28px_rgba(20,24,31,0.22)]"
                  />
                </div>

                <div className="brand-layer-1 p-2 pt-5">
                  <p className="brand-kicker">Packaging Collection</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              </Tilt3D>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Benefits ---------- */}
      <section className="brand-container py-6">
        <Reveal>
          <div className="brand-panel grid gap-6 px-6 py-10 md:px-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="brand-kicker">Why Customers Stay</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                {homeContent.benefitsTitle || defaultHome.benefitsTitle}
              </h2>
              <div className="brand-divider mt-6" />
            </div>
            <div className="brand-scene grid gap-4 sm:grid-cols-2">
              {benefitsPoints.map((point) => (
                <Tilt3D
                  key={point}
                  max={12}
                  lift={6}
                  scale={1.03}
                  className="brand-tile brand-tile-amber p-5 text-sm font-semibold"
                >
                  {point}
                </Tilt3D>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="relative mt-10 overflow-hidden bg-[var(--brand-ink)] py-16 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(40rem 22rem at 8% 0%, rgba(255,212,59,0.22), transparent 60%), radial-gradient(34rem 20rem at 90% 100%, rgba(148,187,255,0.16), transparent 62%)",
          }}
        />

        <div className="brand-container relative grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="brand-kicker !text-amber-300">
              {homeContent.footerKicker || defaultHome.footerKicker}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              {homeContent.footerTitle || defaultHome.footerTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              {homeContent.footerSubtitle || defaultHome.footerSubtitle}
            </p>
          </div>

          <div className="grid gap-4 text-sm text-slate-200">
            {contacts.map((contact) => (
              <button
                key={contact.phone}
                type="button"
                onClick={() => setSelectedContact(contact)}
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.06] px-4 py-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/[0.12] hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.7)]"
              >
                <span className="font-semibold text-white">{contact.name}</span>
                <span className="ml-2 text-slate-300">{contact.phone}</span>
              </button>
            ))}
            <a
              href={homeContent.addressLink || defaultHome.addressLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-semibold text-[var(--brand-primary)] underline underline-offset-4 transition hover:text-amber-200"
            >
              {homeContent.addressText || defaultHome.addressText}
            </a>
          </div>
        </div>
      </footer>

      {/* ---------- Contact sheet ---------- */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="brand-reveal w-full max-w-sm rounded-[28px] border border-white/60 bg-white p-6 text-slate-900 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.6)]">
            <p className="text-sm font-semibold text-amber-700">Contact {selectedContact.name}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">{selectedContact.phone}</h3>
            <p className="mt-2 text-sm text-slate-600">Choose how you want to connect.</p>

            <div className="mt-6 grid gap-3">
              <a href={`tel:${selectedContact.phone}`} className="brand-button w-full">
                Call
              </a>
              <a
                href={`https://wa.me/91${selectedContact.phone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/40 bg-gradient-to-b from-[#37e07c] to-[#1eaa52] px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_0_-1px_#158a41,0_12px_26px_-8px_rgba(30,170,82,0.6)] transition duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
              >
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="brand-button-ghost w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
