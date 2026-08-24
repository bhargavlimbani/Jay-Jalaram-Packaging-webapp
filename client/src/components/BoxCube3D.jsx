import logo from "../assets/logo.png";

/**
 * A real CSS 3D corrugated carton built from six transformed faces.
 *
 * Pass `size` for a cube, or `w` / `h` / `d` (unitless proportions — e.g. the
 * length, width and height a customer typed) to shape a box that matches them.
 * Proportions are normalised so the carton always fits inside `size`.
 */
function BoxCube3D({
  size = 260,
  w,
  h,
  d,
  label = "Jai Jalaram Packaging",
  branded = true,
  spin = true,
  rx = -18,
  ry = 24,
  className = "",
}) {
  // Normalise the requested proportions into pixel dimensions that fit `size`.
  const rw = Number(w) > 0 ? Number(w) : 1;
  const rh = Number(h) > 0 ? Number(h) : 1;
  const rd = Number(d) > 0 ? Number(d) : 1;
  const scale = size / Math.max(rw, rh, rd);

  const bw = Math.max(48, rw * scale);
  const bh = Math.max(48, rh * scale);
  const bd = Math.max(48, rd * scale);

  const faces = [
    { key: "front", w: bw, h: bh, left: 0, top: 0, transform: `translateZ(${bd / 2}px)`, brand: true },
    { key: "back", w: bw, h: bh, left: 0, top: 0, transform: `rotateY(180deg) translateZ(${bd / 2}px)`, brand: true },
    { key: "right", w: bd, h: bh, left: (bw - bd) / 2, top: 0, transform: `rotateY(90deg) translateZ(${bw / 2}px)` },
    { key: "left", w: bd, h: bh, left: (bw - bd) / 2, top: 0, transform: `rotateY(-90deg) translateZ(${bw / 2}px)` },
    {
      key: "top",
      w: bw,
      h: bd,
      left: 0,
      top: (bh - bd) / 2,
      transform: `rotateX(90deg) translateZ(${bh / 2}px)`,
      className: "brand-cube-face-top",
      lid: true,
    },
    {
      key: "bottom",
      w: bw,
      h: bd,
      left: 0,
      top: (bh - bd) / 2,
      transform: `rotateX(-90deg) translateZ(${bh / 2}px)`,
      className: "brand-cube-face-bottom",
    },
  ];

  // Keep the logo readable on small or slim cartons.
  const logoHeight = Math.max(20, Math.min(56, Math.min(bw, bh) * 0.28));
  const showLabel = branded && bw > 130 && bh > 90;

  return (
    <div
      className={`brand-cube-stage relative ${className}`}
      style={{ width: bw, height: bh }}
    >
      <div
        className={`brand-cube ${spin ? "" : "brand-cube-static"}`}
        style={{
          width: bw,
          height: bh,
          // A parked carton holds a fixed, deliberate angle rather than
          // freezing wherever the spin animation happened to stop.
          ...(spin ? null : { transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }),
        }}
      >
        {faces.map((face) => (
          <div
            key={face.key}
            className={`brand-cube-face ${face.className || ""}`}
            style={{
              width: face.w,
              height: face.h,
              left: face.left,
              top: face.top,
              transform: face.transform,
            }}
          >
            {branded && face.brand && (
              <div className="relative z-10 flex flex-col items-center gap-2 px-3 text-center">
                <img
                  src={logo}
                  alt=""
                  style={{ height: logoHeight }}
                  className="w-auto object-contain opacity-95 drop-shadow"
                />
                {showLabel && (
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-950/70">
                    {label}
                  </span>
                )}
              </div>
            )}

            {face.lid && (
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 z-10 h-full w-9 -translate-x-1/2 bg-gradient-to-b from-amber-100/85 to-amber-200/70 shadow-[0_0_12px_rgba(120,70,25,0.25)]"
              />
            )}
          </div>
        ))}
      </div>

      <span aria-hidden="true" className="brand-ground-shadow" />
    </div>
  );
}

export default BoxCube3D;
