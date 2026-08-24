import { useCallback, useEffect, useRef } from "react";

/**
 * Wraps children in a card that tips toward the pointer in real 3D and
 * tracks a specular highlight under the cursor. Purely presentational —
 * it never intercepts clicks on the content inside.
 *
 * Tilt is applied only for fine pointers (mouse/trackpad). On touch there is
 * no hover state and no mouseleave, so a tap would otherwise leave the card
 * stuck at an angle.
 */
function Tilt3D({
  children,
  className = "",
  max = 9,
  scale = 1.02,
  lift = 10,
  glare = true,
  as: Tag = "div",
  ...rest
}) {
  const ref = useRef(null);
  const frame = useRef(null);

  // Cancel any frame still queued when this card unmounts.
  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    []
  );

  const apply = useCallback(
    (rx, ry, px, py, hovering) => {
      const node = ref.current;
      if (!node) return;
      node.style.setProperty("--rx", `${rx}deg`);
      node.style.setProperty("--ry", `${ry}deg`);
      node.style.setProperty("--px", `${px}%`);
      node.style.setProperty("--py", `${py}%`);
      node.style.setProperty("--lift", hovering ? `${-lift}px` : "0px");
      node.style.setProperty("--scale", hovering ? `${scale}` : "1");
      node.style.setProperty("--glare", hovering && glare ? "0.5" : "0");
    },
    [lift, scale, glare]
  );

  const handleMove = (event) => {
    const node = ref.current;
    if (!node) return;

    // Touch and pen taps report a coarse pointer; leave those cards flat.
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      apply(((50 - py) / 50) * max, ((px - 50) / 50) * max, px, py, true);
    });
  };

  const handleLeave = () => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    apply(0, 0, 50, 50, false);
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onBlur={handleLeave}
      className={`tilt3d ${className}`}
      {...rest}
    >
      {children}
      {glare && <span aria-hidden="true" className="tilt3d-glare" />}
    </Tag>
  );
}

export default Tilt3D;
