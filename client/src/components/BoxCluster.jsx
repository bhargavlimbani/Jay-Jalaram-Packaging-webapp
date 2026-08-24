import BoxCube3D from "./BoxCube3D";

/**
 * A focal carton with a swarm of smaller ones floating around it at varied
 * depths — the classic logistics composition, built in real CSS 3D rather
 * than as a flat image.
 *
 * The centre carton turns slowly and carries the branding; the satellites hold
 * fixed angles and only drift, so the group reads as one scene instead of a
 * dozen competing animations.
 */
const SATELLITES = [
  { size: 64, w: 3.2, h: 2.2, d: 3, rx: -20, ry: 34, top: "2%", left: "4%", o: 0.5, drift: 11, delay: -1 },
  { size: 82, w: 3, h: 3, d: 3, rx: -15, ry: -28, top: "-2%", right: "6%", o: 0.72, drift: 9, delay: -4 },
  { size: 58, w: 2.8, h: 3.2, d: 3, rx: -24, ry: 20, top: "26%", left: "-4%", o: 0.42, drift: 13, delay: -6 },
  { size: 92, w: 3.5, h: 2.4, d: 3, rx: -13, ry: -22, top: "34%", right: "-5%", o: 0.85, drift: 8, delay: -2 },
  { size: 74, w: 3, h: 2.6, d: 3, rx: -18, ry: 30, bottom: "6%", left: "2%", o: 0.66, drift: 10, delay: -7 },
  { size: 54, w: 3, h: 3, d: 3, rx: -22, ry: -36, bottom: "18%", right: "10%", o: 0.4, drift: 12, delay: -3 },
  { size: 68, w: 3.4, h: 2.3, d: 3, rx: -16, ry: 26, bottom: "-2%", right: "30%", o: 0.55, drift: 9, delay: -5 },
];

function BoxCluster({ size = 210, className = "" }) {
  return (
    <div className={`relative isolate w-full ${className}`} style={{ minHeight: size * 1.85 }}>
      {/* Warm light pooling behind the group */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(58%_52%_at_50%_45%,rgba(255,205,74,0.42),transparent_72%)] blur-2xl"
      />

      {SATELLITES.map((s, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="boxfield-item absolute"
          style={{
            top: s.top,
            bottom: s.bottom,
            left: s.left,
            right: s.right,
            opacity: s.o,
            animationDuration: `${s.drift}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <BoxCube3D
            size={s.size}
            w={s.w}
            h={s.h}
            d={s.d}
            rx={s.rx}
            ry={s.ry}
            spin={false}
            branded={false}
          />
        </div>
      ))}

      {/* Focal carton */}
      <div className="relative z-10 flex items-center justify-center py-10">
        <BoxCube3D size={size} />
      </div>
    </div>
  );
}

export default BoxCluster;
