import React from "react";

/**
 * Small rotating CSS-3D wireframe cube for the hero banner — a nod to the
 * portfolio's math/CS identity (lattice geometry) rendered with real 3D
 * transforms rather than a flat SVG spinner.
 */
export default function HeroWireframe({ size = 96 }: { size?: number }) {
  const half = size / 2;
  const faces: { transform: string }[] = [
    { transform: `translateZ(${half}px)` },
    { transform: `rotateY(180deg) translateZ(${half}px)` },
    { transform: `rotateY(90deg) translateZ(${half}px)` },
    { transform: `rotateY(-90deg) translateZ(${half}px)` },
    { transform: `rotateX(90deg) translateZ(${half}px)` },
    { transform: `rotateX(-90deg) translateZ(${half}px)` }
  ];

  return (
    <div
      className="eg-cube-scene"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="eg-cube">
        {faces.map((face, i) => (
          <div key={i} className="eg-cube-face" style={{ transform: face.transform }} />
        ))}
      </div>
    </div>
  );
}
