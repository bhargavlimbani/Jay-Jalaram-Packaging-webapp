import BoxCube3D from "./BoxCube3D";

/**
 * Shared shell for the auth pages: the lit gridded backdrop plus a set of
 * decorative cartons drifting in 3D behind the card. Purely presentational —
 * the boxes are hidden from assistive tech and never capture pointer events.
 */
const DECOR = [
  { size: 128, w: 3, h: 3, d: 3, rx: -16, ry: 28, pos: "left-[6%] top-[14%]", float: "brand-float-slow", opacity: "opacity-50" },
  { size: 96, w: 4, h: 2.4, d: 3, rx: -20, ry: -26, pos: "right-[9%] top-[18%]", float: "brand-float-delay", opacity: "opacity-40" },
  { size: 150, w: 3, h: 3.6, d: 3, rx: -13, ry: 22, pos: "left-[11%] bottom-[10%]", float: "brand-float", opacity: "opacity-45" },
  { size: 110, w: 3.4, h: 2.6, d: 3, rx: -18, ry: -32, pos: "right-[7%] bottom-[14%]", float: "brand-float-slow", opacity: "opacity-45" },
];

function AuthScene({ children, className = "" }) {
  return (
    <div className={`brand-auth-shell relative flex items-center justify-center overflow-hidden ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        {DECOR.map((box) => (
          <div key={box.pos} className={`absolute ${box.pos} ${box.float} ${box.opacity}`}>
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
        ))}
      </div>

      <div className="relative z-10 flex w-full items-center justify-center">{children}</div>
    </div>
  );
}

export default AuthScene;
