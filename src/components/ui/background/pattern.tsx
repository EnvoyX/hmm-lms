
type PatternVariant =
  | 'dots'
  | 'grid'
  | 'diagonals'
  | 'hexagon'
  | 'waves'
  | 'circles'
  | 'cross'
  | 'triangles'
  | 'gradient'
  | 'noise'
  | 'radial'
  | 'mesh';

interface BackgroundPatternProps {
  variant?: PatternVariant;
  className?: string;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  variant = 'dots',
  className = ''
}) => {
  const patterns: Record<PatternVariant, React.ReactElement> = {
    // Dot pattern
    dots: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="fill-secondary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-pattern)" />
      </svg>
    ),

    // Grid pattern
    grid: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-accent" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    ),

    // Diagonal lines
    diagonals: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="diagonal-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M0,10 L10,0" className="stroke-primary" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal-pattern)" />
      </svg>
    ),

    // Hexagon pattern
    hexagon: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-pattern" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
            <polygon points="14,0 28,8 28,24 14,32 0,24 0,8" fill="none" className="stroke-secondary" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>
    ),

    // Waves pattern
    waves: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wave-pattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
            <path d="M0,10 Q25,0 50,10 T100,10" fill="none" className="stroke-accent" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave-pattern)" />
      </svg>
    ),

    // Circles pattern
    circles: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circles-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="20" fill="none" className="stroke-primary" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circles-pattern)" />
      </svg>
    ),

    // Cross pattern
    cross: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cross-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15,5 L15,25 M5,15 L25,15" className="stroke-secondary" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cross-pattern)" />
      </svg>
    ),

    // Triangle pattern
    triangles: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="triangle-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="20,5 35,35 5,35" fill="none" className="stroke-accent" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#triangle-pattern)" />
      </svg>
    ),

    // Gradient overlay (no pattern, just subtle gradient)
    gradient: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-secondary" />
    ),

    // Noise texture effect
    noise: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="noise-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            {Array.from({ length: 50 }, (_, i) => (
              <circle
                key={i}
                cx={Math.random() * 100}
                cy={Math.random() * 100}
                r={Math.random() * 0.5 + 0.5}
                className="fill-primary"
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#noise-pattern)" />
      </svg>
    ),

    // Subtle radial gradient
    radial: (
      <div className="absolute inset-0 bg-gradient-radial from-accent via-transparent to-transparent" />
    ),

    // Mesh gradient effect
    mesh: (
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-secondary blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-accent blur-2xl" />
      </div>
    )
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {patterns[variant] || patterns.dots}
    </div>
  );
};



export default BackgroundPattern;