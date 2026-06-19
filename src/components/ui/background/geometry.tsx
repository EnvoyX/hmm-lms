import { cn } from '~/lib/utils';

type Variant = 'default' | 'calm' | 'energetic' | 'sunset' | 'space' | 'subtle-glow' | 'gentle-wave';

interface GeometricBackgroundProps {
  variant?: Variant;
  className?: string;
}


const DefaultVariant = () => (
  <>
    <div className="absolute top-[-20%] left-[-20%] md:top-[-25%] md:left-[-15%] w-[60%] md:w-[50%] aspect-square rounded-full opacity-40 blur-3xl bg-secondary"></div>
    <div className="absolute bottom-[-15%] right-[-15%] w-[50%] md:w-[40%] aspect-square rounded-full opacity-30 blur-3xl bg-accent"></div>
    <div className="absolute top-[30%] left-[10%] w-[15%] md:w-[10%] aspect-square rotate-12 opacity-60 blur-xl bg-accent"></div>
    <div className="hidden md:block absolute top-[15%] right-[15%] w-[12%] aspect-square rotate-[25deg] shape-triangle opacity-50 blur-lg bg-secondary"></div>
    <div className="absolute bottom-[20%] left-0 md:left-[20%] w-1/3 h-2 -rotate-12 opacity-50 blur-sm bg-accent"></div>
  </>
);

const CalmVariant = () => (
  <>
    <div className="absolute top-[-30%] left-[50%] -translate-x-1/2 w-[80%] md:w-[70%] aspect-square rounded-full opacity-30 blur-3xl bg-secondary"></div>
    <div className="absolute bottom-[-10%] left-[-20%] w-[140%] h-[20%] rounded-[100%] opacity-40 blur-3xl bg-calm"></div>
    <div className="absolute top-[20%] right-[10%] w-[20%] aspect-square rounded-full opacity-50 blur-2xl bg-calm"></div>
  </>
);

const EnergeticVariant = () => (
  <>
    <div className="absolute top-[-25%] left-[-10%] w-[40%] h-[80%] rotate-[30deg] opacity-50 blur-2xl shape-beam bg-accent"></div>
    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rotate-[-45deg] shape-triangle opacity-60 blur-3xl bg-energetic"></div>
    <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full opacity-40 blur-3xl bg-secondary"></div>
    <div className="absolute bottom-[15%] left-[10%] w-[10%] aspect-square rotate-12 opacity-80 blur-lg bg-energetic"></div>
  </>
);

const SunsetVariant = () => (
  <>
    <div className="absolute top-[5%] left-[-20%] w-[140%] h-[30%] -rotate-6 opacity-40 blur-3xl rounded-[100%] bg-accent"></div>
    <div className="absolute bottom-[5%] right-[-20%] w-[140%] h-[30%] rotate-3 opacity-50 blur-3xl rounded-[100%] bg-sunset"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 opacity-20 blur-3xl bg-secondary"></div>
  </>
);

const SpaceVariant = () => (
  <>
    <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] -rotate-45 opacity-20 blur-3xl rounded-full shape-oval bg-secondary"></div>
    <div className="absolute top-[15%] right-[20%] w-8 h-8 opacity-80 blur-md rounded-full bg-white"></div>
    <div className="absolute bottom-[25%] left-[15%] w-12 h-12 opacity-70 blur-lg rounded-full bg-accent"></div>
    <div className="absolute bottom-[40%] right-[30%] w-4 h-4 opacity-90 blur-sm rounded-full bg-white"></div>
    <div className="absolute top-[40%] left-[40%] w-6 h-6 opacity-60 blur-lg rounded-full bg-accent"></div>
  </>
);

const SubtleGlowVariant = () => (
  <>
    <div className="absolute top-[-25%] left-[-25%] w-3/4 aspect-square opacity-40 blur-3xl rounded-full bg-secondary"></div>
    <div className="absolute bottom-[-25%] right-[-25%] w-1/2 aspect-square opacity-40 blur-3xl rounded-full bg-accent"></div>
  </>
);

const GentleWaveVariant = () => (
  <>
    <div className="absolute -top-1/4 left-0 w-full h-1/2 opacity-30 blur-3xl rounded-full bg-accent -rotate-6"></div>
    <div className="absolute top-1/2 -right-1/3 w-full h-1/2 opacity-30 blur-3xl rounded-full bg-secondary rotate-12"></div>
  </>
);


/**
 * GeometricBackground Component
 * Renders a responsive background with blurred shapes based on a variant prop.
 */
const GeometricBackground: React.FC<GeometricBackgroundProps> = ({ variant = 'default', className }) => {
  const renderVariant = () => {
    switch (variant) {
      case 'calm':
        return <CalmVariant />;
      case 'energetic':
        return <EnergeticVariant />;
      case 'sunset':
        return <SunsetVariant />;
      case 'space':
        return <SpaceVariant />;
      case 'subtle-glow':
        return <SubtleGlowVariant />;
      case 'gentle-wave':
        return <GentleWaveVariant />;
      case 'default':
      default:
        return <DefaultVariant />;
    }
  };

  return (
    <div className={cn(
      "absolute inset-0 w-full h-full z-0 overflow-hidden",
      className
    )}>
      {renderVariant()}
    </div>
  );
};

export default GeometricBackground;