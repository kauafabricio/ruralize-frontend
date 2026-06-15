"use client";

type LogoProps = {
  variant?: "dark" | "light";
  size?: number;
  className?: string;
};

export function Logo({ variant = "dark", size = 64, className = "" }: LogoProps) {
  const isDark = variant === "dark";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
      aria-label="Ruralize Logo"
    >
      <defs>
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="16"
            stdDeviation="20"
            floodColor={isDark ? "#2c4a24" : "#ffffff"}
            floodOpacity={isDark ? "0.18" : "0.08"}
          />
        </filter>
      </defs>

      {/* Background circle */}
      <rect
        width="440"
        height="440"
        x="36"
        y="36"
        rx="110"
        fill={isDark ? "#2c4a24" : "#ffffff"}
        filter="url(#soft-shadow)"
      />

      {/* Border circle */}
      <rect
        width="436"
        height="436"
        x="38"
        y="38"
        rx="108"
        fill="none"
        stroke={isDark ? "#a1ba9b" : "#b0cdba"}
        strokeWidth="4"
        strokeOpacity={isDark ? "0.4" : "0.5"}
      />

      {/* Main shape - leaf/plant form */}
      <path
        d="M256 120 C340 120, 380 160, 380 250 C380 320, 350 350, 380 380 C320 380, 270 380, 220 380 C150 380, 132 320, 132 250 C132 160, 172 120, 256 120 Z"
        fill={isDark ? "#36592d" : "#e8f4e3"}
        stroke={isDark ? "#b0cdba" : "#2c4a24"}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Growth lines - representing sustainability */}
      <path
        d="M150 360 C180 330, 220 290, 280 210"
        stroke={isDark ? "#b0cdba" : "#2c4a24"}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M210 303 C260 305, 300 320, 335 340"
        stroke={isDark ? "#b0cdba" : "#2c4a24"}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M245 257 C290 240, 325 210, 340 170"
        stroke={isDark ? "#b0cdba" : "#2c4a24"}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M190 250 C170 210, 185 180, 210 160"
        stroke={isDark ? "#b0cdba" : "#2c4a24"}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Accent circle at top */}
      <circle
        cx="340"
        cy="170"
        r="16"
        fill={isDark ? "#f5eee0" : "#2c4a24"}
        stroke={isDark ? "#2c4a24" : "#f5eee0"}
        strokeWidth="4"
      />
    </svg>
  );
}
