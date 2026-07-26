export interface ProjectShieldProps {
  type: "caduceus" | "flame" | "axes" | "book" | "shield";
  color: "blue" | "purple" | "green" | "bronze";
  size?: number;
}

export function ProjectShield({ type, color, size = 48 }: ProjectShieldProps) {
  const getGradientColors = () => {
    switch (color) {
      case "blue":
        return { top: "#1e3a8a", bottom: "#0284c7", border: "#38bdf8", stroke: "#e0f2fe" };
      case "purple":
        return { top: "#581c87", bottom: "#9333ea", border: "#c084fc", stroke: "#f5f3ff" };
      case "green":
        return { top: "#14532d", bottom: "#16a34a", border: "#4ade80", stroke: "#f0fdf4" };
      case "bronze":
      default:
        return { top: "#451a03", bottom: "#b45309", border: "#f59e0b", stroke: "#fef3c7" };
    }
  };

  const colors = getGradientColors();
  const gradId = `shieldGrad-${type}-${color}`;

  const renderEmblem = () => {
    switch (type) {
      case "caduceus":
        return (
          <path
            d="M12 4v16M9 7c1.5-1 4.5-1 6 0M8 11c2-1 6-1 8 0M9 15c1.5-1 4.5-1 6 0"
            stroke={colors.stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "flame":
        return (
          <path
            d="M12 5c-1.5 2.5-3 4.5-3 7 0 2.8 2.2 5 5 5s5-2.2 5-5c0-4.5-4.5-8-7-7z"
            fill={colors.stroke}
            opacity="0.9"
          />
        );
      case "axes":
        return (
          <g stroke={colors.stroke} strokeWidth="1.8" strokeLinecap="round" fill="none">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
            <path d="M5 5l3 2v4L5 9z" fill={colors.stroke} opacity="0.8" />
            <path d="M19 5l-3 2v4l3-2z" fill={colors.stroke} opacity="0.8" />
          </g>
        );
      case "book":
        return (
          <path
            d="M6 7h4a2 2 0 0 1 2 2v8a1.5 1.5 0 0 0-1.5-1.5H6V7zm12 0h-4a2 2 0 0 0-2 2v8a1.5 1.5 0 0 1 1.5-1.5H18V7z"
            stroke={colors.stroke}
            strokeWidth="1.8"
            fill="none"
          />
        );
      default:
        return (
          <polygon
            points="12,6 15,10 12,18 9,10"
            fill={colors.stroke}
          />
        );
    }
  };

  return (
    <div
      className="shield-crest-wrapper"
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 24 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.top} />
            <stop offset="100%" stopColor={colors.bottom} />
          </linearGradient>
          <filter id={`shadow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Shield Frame */}
        <path
          d="M12 2L3 5v8c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-3z"
          fill={`url(#${gradId})`}
          stroke={colors.border}
          strokeWidth="1.5"
          filter={`url(#shadow-${gradId})`}
        />

        {/* Emblem */}
        {renderEmblem()}
      </svg>
    </div>
  );
}
