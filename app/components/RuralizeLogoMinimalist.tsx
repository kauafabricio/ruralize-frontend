type RuralizeLogoMinimalistProps = {
  size?: number;
  className?: string;
};

export function RuralizeLogoMinimalist({
  size = 64,
  className = "",
}: RuralizeLogoMinimalistProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-label="Ruralize logo"
    >
      <defs>
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="16"
            stdDeviation="20"
            floodColor="#2c4a24"
            floodOpacity="0.18"
          />
        </filter>
      </defs>
      <rect
        width="440"
        height="440"
        x="36"
        y="36"
        rx="110"
        fill="#2c4a24"
        filter="url(#soft-shadow)"
      />
      <rect
        width="436"
        height="436"
        x="38"
        y="38"
        rx="108"
        fill="none"
        stroke="#a1ba9b"
        strokeWidth="4"
        strokeOpacity="0.4"
      />
      <path
        d="M256 120 C340 120, 380 160, 380 250 C380 320, 350 350, 380 380 C320 380, 270 380, 220 380 C150 380, 132 320, 132 250 C132 160, 172 120, 256 120 Z"
        fill="#36592d"
        stroke="#b0cdba"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M150 360 C180 330, 220 290, 280 210"
        stroke="#b0cdba"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M210 303 C260 305, 300 320, 335 340"
        stroke="#b0cdba"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M245 257 C290 240, 325 210, 340 170"
        stroke="#b0cdba"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M190 250 C170 210, 185 180, 210 160"
        stroke="#b0cdba"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="340" cy="170" r="16" fill="#f5eee0" stroke="#2c4a24" strokeWidth="4" />
    </svg>
  );
}
