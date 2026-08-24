import { useEffect, useRef, useState } from "react";

/**
 * Reveals its children with a 3D rise-out-of-the-page entrance the first
 * time they scroll into view. Falls back to visible if IntersectionObserver
 * is unavailable.
 */
function Reveal({ children, className = "", delay = 0, as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);

    // Safety net: content must never stay invisible if the observer
    // never fires (background tab, throttled renderer, odd browser).
    const failsafe = setTimeout(() => setShown(true), 1500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal3d ${shown ? "reveal3d-in" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
