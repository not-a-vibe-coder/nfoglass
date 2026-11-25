import { img } from "@/lib/site";

/*
 * The die-cut sheet, after the A24 poster: a cube unfolded flat. Three photo faces with chamfered
 * side flaps, dashed fold lines, a headline that runs across the folds and is cut off by the
 * edges, two ink label bars and a white face carrying the wordmark. Drawn as one SVG in the
 * poster's own 1932-unit square, so it scales as a single piece at any width.
 */

const LEFT = "423,397 675,397 757,497 757,913 675,1016 423,1016 340,913 340,497";
const RIGHT = "1257,397 1508,397 1592,497 1592,913 1508,1016 1257,1016 1175,913 1175,497";

export function CubeNet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1932 1932" className={className} role="img" aria-labelledby="net-title">
      <title id="net-title">Cut to your measure: an unfolded glass cube showing a staircase, a balustrade and a shower screen</title>
      <defs>
        <clipPath id="net-left">
          <polygon points={LEFT} />
        </clipPath>
        <clipPath id="net-right">
          <polygon points={RIGHT} />
        </clipPath>
        <clipPath id="net-centre">
          <rect x="757" y="82" width="418" height="1248" />
        </clipPath>
        <clipPath id="net-band">
          <polygon points={LEFT} />
          <polygon points={RIGHT} />
          <rect x="757" y="82" width="418" height="1248" />
        </clipPath>
      </defs>

      {/* outline flaps, white with a hairline, like the glue tabs on the sheet */}
      <g fill="#fff" stroke="#0e1716" strokeWidth="3" strokeLinejoin="round">
        <polygon points="340,497 238,580 238,830 340,913" />
        <polygon points="1592,497 1693,580 1693,830 1592,913" />
        <polygon points="757,1745 837,1890 1093,1890 1175,1745" />
        <rect x="757" y="82" width="418" height="1663" />
      </g>

      <image href={img("balustrade")} x="340" y="397" width="417" height="619" preserveAspectRatio="xMidYMid slice" clipPath="url(#net-left)" />
      <image href={img("shower")} x="1175" y="397" width="417" height="619" preserveAspectRatio="xMidYMid slice" clipPath="url(#net-right)" />
      <image href={img("stair")} x="757" y="82" width="418" height="1248" preserveAspectRatio="xMidYMid slice" clipPath="url(#net-centre)" />

      <g fill="none" stroke="#0e1716" strokeWidth="3" strokeLinejoin="round">
        <polygon points={LEFT} />
        <polygon points={RIGHT} />
      </g>

      {/* fold lines */}
      <g stroke="#0e1716" strokeWidth="3" strokeDasharray="14 10" opacity="0.85">
        <line x1="340" y1="497" x2="1592" y2="497" />
        <line x1="340" y1="913" x2="1592" y2="913" />
        <line x1="340" y1="497" x2="340" y2="913" />
        <line x1="1592" y1="497" x2="1592" y2="913" />
        <line x1="757" y1="397" x2="757" y2="1016" />
        <line x1="1175" y1="397" x2="1175" y2="1016" />
        <line x1="757" y1="1330" x2="1175" y2="1330" />
        <line x1="757" y1="1745" x2="1175" y2="1745" />
      </g>

      {/* the headline crosses the folds and is cut off where the photos end */}
      <g clipPath="url(#net-band)" fill="#fff" fontFamily="var(--font-display-face)" fontWeight="800" fontSize="132" letterSpacing="-4">
        <text x="880" y="760">
          CUT TO YOUR
        </text>
        <text x="1040" y="882" textAnchor="end">
          MEASURE
        </text>
      </g>

      <rect x="757" y="1330" width="418" height="52" fill="#0e1716" />
      <text x="776" y="1352" fill="#fff" fontSize="17" fontWeight="700" fontFamily="var(--font-sans-face)">
        Glass made to measure by
      </text>
      <text x="776" y="1373" fill="#fff" fontSize="17" fontWeight="700" fontFamily="var(--font-sans-face)">
        NFO Glass, Lagos Island
      </text>

      <image href="/logo-512.png" x="806" y="1394" width="150" height="150" />
      <text x="966" y="1500" fill="#0e1716" fontFamily="var(--font-display-face)" fontWeight="800" fontSize="80" letterSpacing="-3">
        glass
      </text>
      <text x="826" y="1640" fill="#087263" fontFamily="var(--font-display-face)" fontWeight="700" fontSize="50" letterSpacing="-1">
        .com.ng
      </text>

      <rect x="757" y="1693" width="418" height="52" fill="#0e1716" />
      <text x="966" y="1729" textAnchor="middle" fill="#fff" fontSize="27" fontWeight="700" fontFamily="var(--font-sans-face)">
        Delivered across Nigeria
      </text>

    </svg>
  );
}
