/**
 * Wireframes de los layouts del catálogo (src/data/layoutCatalog.js).
 * SVG livianos dibujados a mano en una grilla de 120×90: marco de navegador
 * (o de teléfono para los móviles), bloques con borde, líneas de texto y la
 * zona protagonista resaltada con el color de acento.
 */

const R = (x, y, w, h, kind = "box") => ({ x, y, w, h, kind });

const rows = (x, y, w, count, gap = 5, h = 2) =>
  Array.from({ length: count }, (_, i) => R(x, y + i * gap, w, h, "line"));

const grid = (x0, y0, w, h, cols, rowsN, gapX, gapY, accIndex = -1) =>
  Array.from({ length: cols * rowsN }, (_, i) =>
    R(
      x0 + (i % cols) * (w + gapX),
      y0 + Math.floor(i / cols) * (h + gapY),
      w,
      h,
      i === accIndex ? "acc" : "box",
    ),
  );

const WIREFRAMES = {
  "one-page": {
    shapes: [
      R(6, 15, 108, 4, "line"),
      R(6, 22, 108, 24, "acc"),
      R(6, 49, 34, 14), R(43, 49, 34, 14), R(80, 49, 34, 14),
      R(6, 66, 108, 8),
      R(6, 77, 108, 7, "fill"),
    ],
  },
  zigzag: {
    shapes: [
      R(6, 16, 46, 20, "acc"), ...rows(58, 19, 50, 3, 5),
      R(68, 40, 46, 20, "acc"), ...rows(6, 43, 50, 3, 5),
      R(6, 64, 46, 20, "acc"), ...rows(58, 67, 50, 3, 5),
    ],
    path: "M30 26 L90 50 L30 74",
  },
  "f-pattern": {
    shapes: [
      R(6, 16, 108, 6, "acc"),
      R(6, 25, 70, 5, "acc"),
      R(6, 33, 24, 51, "acc"),
      ...rows(34, 35, 78, 9, 5.5),
    ],
  },
  "hero-media": {
    shapes: [
      R(6, 16, 66, 68, "acc"),
      R(78, 30, 36, 4, "line"), ...rows(78, 38, 30, 3, 5),
      R(78, 56, 22, 7),
    ],
    play: [39, 50],
  },
  "split-screen": {
    shapes: [
      R(6, 16, 52, 68),
      R(12, 38, 36, 4, "line"), ...rows(12, 46, 30, 2, 5),
      R(12, 58, 18, 6, "acc"),
      R(62, 16, 52, 68, "acc"),
    ],
  },
  asymmetric: {
    shapes: [
      R(6, 16, 72, 8), R(82, 16, 32, 32, "acc"),
      R(6, 27, 20, 57), R(30, 27, 48, 25), R(30, 55, 84, 29),
    ],
  },
  magazine: {
    shapes: [
      R(6, 16, 56, 32, "acc"), R(66, 18, 48, 4, "line"), ...rows(66, 26, 44, 4, 5),
      ...grid(6, 52, 24, 16, 4, 1, 4, 0),
      ...rows(6, 72, 24, 2, 5), ...rows(34, 72, 24, 2, 5),
      ...rows(62, 72, 24, 2, 5), ...rows(90, 72, 24, 2, 5),
    ],
  },
  masonry: {
    shapes: [
      R(6, 16, 24, 30), R(6, 49, 24, 18, "acc"), R(6, 70, 24, 14),
      R(34, 16, 24, 16), R(34, 35, 24, 30), R(34, 68, 24, 16),
      R(62, 16, 24, 24, "acc"), R(62, 43, 24, 22), R(62, 68, 24, 16),
      R(90, 16, 24, 18), R(90, 37, 24, 26), R(90, 66, 24, 18, "acc"),
    ],
  },
  "article-sidebar": {
    shapes: [
      R(6, 16, 74, 5, "line"), ...rows(6, 25, 74, 2, 4.5),
      R(6, 36, 74, 20),
      ...rows(6, 60, 74, 5, 5),
      R(84, 16, 30, 68, "acc"), ...rows(88, 22, 22, 4, 6),
    ],
  },
  "product-grid": {
    shapes: [
      R(6, 16, 22, 68), ...rows(9, 21, 16, 6, 6),
      ...grid(32, 16, 24, 32, 3, 2, 4, 4, 0),
    ],
  },
  "product-detail": {
    shapes: [
      R(6, 16, 56, 52, "acc"),
      R(6, 71, 12, 13), R(21, 71, 12, 13), R(36, 71, 12, 13), R(51, 71, 11, 13),
      R(68, 18, 46, 5, "line"), R(68, 27, 26, 4, "line"),
      ...rows(68, 36, 44, 2, 5),
      R(68, 48, 14, 7), R(85, 48, 14, 7),
      R(68, 62, 46, 9, "acc"),
    ],
  },
  "checkout-steps": {
    shapes: [
      R(6, 30, 64, 7), R(6, 40, 64, 7), R(6, 50, 30, 7), R(40, 50, 30, 7),
      R(6, 62, 64, 7),
      R(76, 30, 38, 54, "acc"), ...rows(80, 36, 30, 4, 6),
      R(80, 74, 30, 6),
    ],
    steps: { y: 21, xs: [20, 45, 70], done: 2 },
  },
  "sidebar-content": {
    shapes: [
      R(6, 15, 22, 69, "acc"), ...rows(10, 22, 14, 6, 7),
      R(32, 15, 82, 7),
      R(32, 26, 40, 24), R(76, 26, 38, 24),
      R(32, 54, 82, 30),
    ],
  },
  "topnav-views": {
    shapes: [
      R(6, 15, 108, 8, "acc"),
      R(6, 27, 108, 14),
      R(6, 45, 52, 39), R(62, 45, 52, 39),
      ...rows(12, 52, 40, 3, 6), ...rows(68, 52, 40, 3, 6),
    ],
  },
  bento: {
    shapes: [
      R(6, 16, 52, 32, "acc"), R(62, 16, 24, 32), R(90, 16, 24, 14), R(90, 34, 24, 14),
      R(6, 52, 24, 32), R(34, 52, 52, 32), R(90, 52, 24, 32),
    ],
  },
  "cards-grid": {
    shapes: [
      ...grid(6, 16, 33, 32, 3, 2, 4.5, 4, 1),
      ...rows(9, 38, 26, 2, 4), ...rows(46.5, 38, 26, 2, 4), ...rows(84, 38, 26, 2, 4),
    ],
  },
  "crud-table": {
    shapes: [
      R(6, 15, 18, 69), ...rows(9, 22, 12, 6, 7),
      R(28, 16, 46, 7), R(96, 16, 18, 7, "acc"),
      R(28, 27, 86, 6, "acc"),
      ...Array.from({ length: 6 }, (_, i) => R(28, 36 + i * 8, 86, 6)),
    ],
  },
  "master-detail": {
    shapes: [
      R(6, 16, 38, 68),
      ...Array.from({ length: 6 }, (_, i) => R(9, 20 + i * 10.5, 32, 7, i === 1 ? "acc" : "fill")),
      R(48, 16, 66, 68),
      ...rows(70, 24, 38, 2, 5),
      R(54, 42, 54, 7), R(54, 52, 54, 7), R(54, 62, 54, 7),
      R(84, 73, 24, 7, "acc"),
    ],
    circle: [60, 28, 6],
  },
  "wizard-form": {
    shapes: [
      R(18, 30, 84, 52),
      R(24, 36, 72, 7), R(24, 46, 72, 7), R(24, 56, 72, 7),
      R(24, 70, 26, 7), R(70, 70, 26, 7, "acc"),
    ],
    steps: { y: 21, xs: [24, 48, 72, 96], done: 2 },
  },
  "pos-split": {
    shapes: [
      ...grid(6, 16, 20, 20, 3, 3, 2.5, 4, 4),
      R(74, 16, 40, 68), ...rows(78, 22, 32, 6, 6),
      R(78, 70, 32, 9, "acc"),
    ],
  },
  calendar: {
    shapes: [
      R(6, 16, 108, 6, "line"),
      ...Array.from({ length: 35 }, (_, i) =>
        R(6 + (i % 7) * 15.5, 26 + Math.floor(i / 7) * 11.7, 14, 10.2,
          [9, 16, 17, 25].includes(i) ? "acc" : "box"),
      ),
    ],
  },
  "booking-steps": {
    shapes: [
      R(6, 24, 30, 48, "acc"), R(45, 24, 30, 48), R(84, 24, 30, 48),
      ...rows(10, 30, 22, 3, 6), ...rows(49, 30, 22, 3, 6), ...rows(88, 30, 22, 3, 6),
      R(10, 62, 22, 6), R(49, 62, 22, 6), R(88, 62, 22, 6),
    ],
    arrows: [[38, 48], [77, 48]],
  },
  "bottom-tabs": {
    mobile: true,
    shapes: [
      R(43, 12, 34, 6, "line"),
      R(43, 21, 34, 14), R(43, 38, 34, 14), R(43, 55, 34, 14),
      R(42, 73, 36, 10, "acc"),
    ],
  },
  "list-detail": {
    mobile: "double",
    shapes: [
      ...Array.from({ length: 6 }, (_, i) => R(18, 14 + i * 11, 32, 8, i === 2 ? "acc" : "box")),
      R(70, 14, 32, 26, "acc"), ...rows(70, 44, 32, 6, 6),
    ],
    arrows: [[58, 45]],
  },
  "stack-nav": {
    mobile: true,
    shapes: [
      R(43, 12, 34, 6, "line"),
      R(49, 30, 28, 48), R(46, 27, 28, 48), R(43, 24, 28, 48, "acc"),
    ],
  },
};

const KIND_CLASS = {
  box: "fill-transparent stroke-current",
  line: "fill-current opacity-40",
  fill: "fill-current opacity-15",
  acc: "fill-emerald-400/25 stroke-emerald-400",
};

function BrowserFrame() {
  return (
    <>
      <rect x="1.5" y="1.5" width="117" height="87" rx="5" className="fill-transparent stroke-current" strokeWidth="1.2" />
      <line x1="1.5" y1="11" x2="118.5" y2="11" className="stroke-current" strokeWidth="1" />
      <circle cx="7" cy="6.3" r="1.3" className="fill-current" />
      <circle cx="11.5" cy="6.3" r="1.3" className="fill-current" />
      <circle cx="16" cy="6.3" r="1.3" className="fill-current" />
      <rect x="26" y="5" width="56" height="2.6" rx="1.3" className="fill-current opacity-40" />
    </>
  );
}

function PhoneFrame({ x = 40 }) {
  return (
    <>
      <rect x={x} y="3" width="40" height="84" rx="6" className="fill-transparent stroke-current" strokeWidth="1.2" />
      <rect x={x + 14} y="6" width="12" height="2" rx="1" className="fill-current opacity-60" />
    </>
  );
}

export function LayoutWireframe({ id, className = "" }) {
  const spec = WIREFRAMES[id];
  if (!spec) return null;

  return (
    <svg
      viewBox="0 0 120 90"
      aria-hidden="true"
      className={className}
      strokeLinecap="round"
    >
      {spec.mobile === "double" ? (
        <>
          <PhoneFrame x={14} />
          <PhoneFrame x={66} />
        </>
      ) : spec.mobile ? (
        <PhoneFrame />
      ) : (
        <BrowserFrame />
      )}

      {spec.shapes.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={s.kind === "line" ? 1 : 1.6}
          strokeWidth="0.9"
          className={KIND_CLASS[s.kind]}
        />
      ))}

      {spec.path && (
        <path d={spec.path} fill="none" strokeWidth="1.4" strokeDasharray="3 2.5" className="stroke-emerald-300" />
      )}
      {spec.play && (
        <path
          d={`M${spec.play[0] - 4} ${spec.play[1] - 6} L${spec.play[0] + 6} ${spec.play[1]} L${spec.play[0] - 4} ${spec.play[1] + 6} Z`}
          className="fill-emerald-300"
        />
      )}
      {spec.circle && (
        <circle cx={spec.circle[0]} cy={spec.circle[1]} r={spec.circle[2]} className="fill-current opacity-30" />
      )}
      {spec.steps && (
        <>
          <line
            x1={spec.steps.xs[0]}
            y1={spec.steps.y}
            x2={spec.steps.xs.at(-1)}
            y2={spec.steps.y}
            strokeWidth="1"
            className="stroke-current opacity-50"
          />
          {spec.steps.xs.map((cx, i) => (
            <circle
              key={cx}
              cx={cx}
              cy={spec.steps.y}
              r="3.2"
              strokeWidth="0.9"
              className={i < spec.steps.done ? "fill-emerald-400 stroke-emerald-400" : "fill-neutral-950 stroke-current"}
            />
          ))}
        </>
      )}
      {spec.arrows?.map(([ax, ay]) => (
        <path
          key={`${ax}-${ay}`}
          d={`M${ax - 3} ${ay - 4} L${ax + 2} ${ay} L${ax - 3} ${ay + 4}`}
          fill="none"
          strokeWidth="1.4"
          className="stroke-emerald-300"
        />
      ))}
    </svg>
  );
}
