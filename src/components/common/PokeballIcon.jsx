/**
 * PokéNexus branded Pokéball icon.
 *
 * Props:
 *   size        — pixel size (width & height). Default: 40
 *   spinning    — when true, applies continuous rotation. Default: false
 *   glowing     — when true, shows the outer energy ring + pulse. Default: false
 *   className   — extra classes on the root <svg>
 */
export default function PokeballIcon({
  size = 40,
  spinning = false,
  glowing = false,
  className = "",
}) {
  const id = "pb"; // short prefix for all internal SVG ids

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={[
        spinning ? "animate-spin" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        spinning
          ? { animationDuration: "3s", animationTimingFunction: "linear" }
          : undefined
      }
    >
      <defs>
        {/* ── Radial gradient: top-half dark dome with subtle highlight ── */}
        <radialGradient
          id={`${id}-top`}
          cx="42%"
          cy="35%"
          r="60%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#1C2A45" />
          <stop offset="60%" stopColor="#111A2C" />
          <stop offset="100%" stopColor="#080C17" />
        </radialGradient>

        {/* ── Radial gradient: bottom-half slightly lighter ── */}
        <radialGradient
          id={`${id}-bot`}
          cx="58%"
          cy="72%"
          r="55%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#172035" />
          <stop offset="100%" stopColor="#080C17" />
        </radialGradient>

        {/* ── Band gradient: gold centre strip ── */}
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6C945" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#F6C945" />
          <stop offset="100%" stopColor="#C89A1A" stopOpacity="0.85" />
        </linearGradient>

        {/* ── Button radial: glowing gold centre ── */}
        <radialGradient
          id={`${id}-btn`}
          cx="40%"
          cy="35%"
          r="65%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="45%" stopColor="#F6C945" />
          <stop offset="100%" stopColor="#A07010" />
        </radialGradient>

        {/* ── Outer glow filter ── */}
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* ── Button pulse glow filter ── */}
        <filter id={`${id}-pulse`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* ── Clip to circle ── */}
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OUTER ENERGY RING (visible when glowing)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {glowing && (
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="#F6C945"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          fill="none"
          filter={`url(#${id}-glow)`}
        >
          <animate
            attributeName="stroke-opacity"
            values="0.15;0.5;0.15"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="47;49;47"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BALL BODY (clipped to circle)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <g clipPath={`url(#${id}-clip)`}>
        {/* Top half */}
        <rect
          x="6"
          y="6"
          width="88"
          height="44"
          fill={`url(#${id}-top)`}
        />

        {/* Bottom half */}
        <rect
          x="6"
          y="50"
          width="88"
          height="44"
          fill={`url(#${id}-bot)`}
        />

        {/* Gold horizontal band */}
        <rect
          x="6"
          y="43"
          width="88"
          height="14"
          fill={`url(#${id}-band)`}
        />

        {/* Subtle top-half sheen — thin arc highlight */}
        <ellipse
          cx="50"
          cy="26"
          rx="28"
          ry="10"
          fill="white"
          fillOpacity="0.045"
        />

        {/* Gold rim lines bordering the band */}
        <line
          x1="6" y1="43" x2="94" y2="43"
          stroke="#F6C945"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />
        <line
          x1="6" y1="57" x2="94" y2="57"
          stroke="#C89A1A"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
      </g>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OUTER CIRCLE STROKE — gold rim light
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="#F6C945"
        strokeWidth="2.5"
        strokeOpacity="0.75"
        fill="none"
      />

      {/* Inner shadow ring — depth */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="#080C17"
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="none"
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CENTRE BUTTON
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* Pulse glow behind button (when glowing) */}
      {glowing && (
        <circle
          cx="50"
          cy="50"
          r="13"
          fill="#F6C945"
          fillOpacity="0.25"
          filter={`url(#${id}-pulse)`}
        >
          <animate
            attributeName="r"
            values="11;15;11"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            values="0.2;0.45;0.2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Dark outer ring */}
      <circle
        cx="50"
        cy="50"
        r="11.5"
        fill="#080C17"
        stroke="#F6C945"
        strokeWidth="2.5"
        strokeOpacity="0.9"
      />

      {/* Gold button face */}
      <circle cx="50" cy="50" r="8" fill={`url(#${id}-btn)`} />

      {/* Button specular highlight */}
      <ellipse
        cx="47.5"
        cy="47"
        rx="3.5"
        ry="2"
        fill="white"
        fillOpacity="0.35"
      />
    </svg>
  );
}
