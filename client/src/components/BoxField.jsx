import BoxCube3D from "./BoxCube3D";

/**
 * Ambient background: corrugated cartons drifting in 3D space behind the whole
 * app, the way stock they'd actually ship floats around a hero shot.
 *
 * Three depth tiers sell the space — far cartons are small, faded and slightly
 * out of focus; near ones are larger and crisper. Each holds a fixed angle and
 * only drifts, because a dozen spinning boxes would fight the content.
 *
 * Positioned toward the left and right edges so the field frames the centre
 * column instead of sitting behind body copy. Rendered once at the app root,
 * fixed and pointer-transparent, hidden on small screens.
 */
const TIERS = {
  far: { opacity: 0.2, blur: "blur(2.5px)" },
  mid: { opacity: 0.34, blur: "blur(1px)" },
  near: { opacity: 0.46, blur: "none" },
};

const BOXES = [
  // Left cluster
  { x: "1.5%", y: "9%", size: 74, w: 3.2, h: 2.3, d: 3, rx: -20, ry: 32, tier: "far", drift: 13, delay: -2 },
  { x: "6%", y: "23%", size: 116, w: 3, h: 3, d: 3, rx: -16, ry: -26, tier: "mid", drift: 10, delay: -5 },
  { x: "2%", y: "41%", size: 148, w: 3.6, h: 2.6, d: 3, rx: -14, ry: 22, tier: "near", drift: 9, delay: 0 },
  { x: "8%", y: "60%", size: 88, w: 2.8, h: 3.2, d: 3, rx: -22, ry: 38, tier: "far", drift: 14, delay: -7 },
  { x: "3%", y: "76%", size: 124, w: 3.4, h: 2.4, d: 3, rx: -18, ry: -30, tier: "mid", drift: 11, delay: -3 },
  { x: "12%", y: "88%", size: 68, w: 3, h: 3, d: 3, rx: -24, ry: 18, tier: "far", drift: 15, delay: -9 },

  // Right cluster
  { x: "auto", right: "2%", y: "7%", size: 108, w: 3.4, h: 2.5, d: 3, rx: -17, ry: -24, tier: "mid", drift: 12, delay: -4 },
  { x: "auto", right: "9%", y: "21%", size: 72, w: 3, h: 3, d: 3, rx: -21, ry: 34, tier: "far", drift: 13, delay: -8 },
  { x: "auto", right: "1.5%", y: "38%", size: 152, w: 3.2, h: 2.8, d: 3, rx: -13, ry: -20, tier: "near", drift: 9, delay: -1 },
  { x: "auto", right: "10%", y: "56%", size: 92, w: 2.9, h: 3.3, d: 3, rx: -19, ry: 28, tier: "mid", drift: 11, delay: -6 },
  { x: "auto", right: "3%", y: "73%", size: 120, w: 3.5, h: 2.4, d: 3, rx: -15, ry: -34, tier: "mid", drift: 10, delay: -2 },
  { x: "auto", right: "13%", y: "90%", size: 66, w: 3, h: 3, d: 3, rx: -23, ry: 20, tier: "far", drift: 14, delay: -5 },
];

function BoxField() {
  return (
    <div aria-hidden="true" className="boxfield">
      {BOXES.map((box, index) => {
        const tier = TIERS[box.tier];

        return (
          <div
            key={`${box.tier}-${index}`}
            className="boxfield-item"
            style={{
              top: box.y,
              left: box.x === "auto" ? undefined : box.x,
              right: box.right,
              opacity: tier.opacity,
              filter: tier.blur,
              animationDuration: `${box.drift}s`,
              animationDelay: `${box.delay}s`,
            }}
          >
            <BoxCube3D
              size={box.size}
              w={box.w}
              h={box.h}
              d={box.d}
              rx={box.rx}
              ry={box.ry}
              spin={false}
              branded={false}
            />
          </div>
        );
      })}
    </div>
  );
}

export default BoxField;
