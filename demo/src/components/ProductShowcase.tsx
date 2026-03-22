interface ProductShowcaseProps {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
  price: string;
  priceLabel: string;
  features: string[];
  tag?: string;
  tagColor?: string;
  selected?: boolean;
  onToggle?: () => void;
}

// SVG illustrations for product categories
export function SolarIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect width="200" height="120" fill="url(#solar-sky)" rx="0" />
      {/* Sun */}
      <circle cx="160" cy="30" r="18" fill="#FCD34D" />
      <circle cx="160" cy="30" r="14" fill="#FBBF24" />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1={160 + Math.cos((angle * Math.PI) / 180) * 22}
          y1={30 + Math.sin((angle * Math.PI) / 180) * 22}
          x2={160 + Math.cos((angle * Math.PI) / 180) * 28}
          y2={30 + Math.sin((angle * Math.PI) / 180) * 28}
          stroke="#FBBF24"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {/* House */}
      <rect x="55" y="60" width="50" height="40" rx="2" fill="#94A3B8" />
      <polygon points="40,62 80,38 120,62" fill="#64748B" />
      {/* Solar panels on roof */}
      <rect x="58" y="44" width="18" height="12" rx="1" fill="#1E3A5F" stroke="#3B82F6" strokeWidth="0.5" />
      <rect x="78" y="44" width="18" height="12" rx="1" fill="#1E3A5F" stroke="#3B82F6" strokeWidth="0.5" />
      <line x1="67" y1="44" x2="67" y2="56" stroke="#3B82F6" strokeWidth="0.3" />
      <line x1="58" y1="50" x2="76" y2="50" stroke="#3B82F6" strokeWidth="0.3" />
      <line x1="87" y1="44" x2="87" y2="56" stroke="#3B82F6" strokeWidth="0.3" />
      <line x1="78" y1="50" x2="96" y2="50" stroke="#3B82F6" strokeWidth="0.3" />
      {/* Battery */}
      <rect x="125" y="82" width="22" height="16" rx="3" fill="#059669" />
      <rect x="127" y="84" width="5" height="12" rx="1" fill="#34D399" opacity="0.8" />
      <rect x="133" y="84" width="5" height="12" rx="1" fill="#34D399" opacity="0.6" />
      <rect x="139" y="87" width="5" height="9" rx="1" fill="#34D399" opacity="0.3" />
      {/* Lightning bolt */}
      <path d="M136 76 L132 82 L136 82 L134 88 L140 80 L136 80 Z" fill="#FBBF24" />
      {/* Ground */}
      <rect x="0" y="100" width="200" height="20" fill="#86EFAC" opacity="0.3" />
      <defs>
        <linearGradient id="solar-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WallboxIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="url(#wb-bg)" rx="0" />
      {/* Garage wall */}
      <rect x="20" y="20" width="160" height="80" rx="4" fill="#E2E8F0" />
      <rect x="20" y="20" width="160" height="8" rx="2" fill="#CBD5E1" />
      {/* Wallbox unit */}
      <rect x="130" y="40" width="30" height="45" rx="4" fill="#1E40AF" />
      <rect x="133" y="43" width="24" height="10" rx="2" fill="#3B82F6" />
      <circle cx="145" cy="58" r="3" fill="#60A5FA" />
      <circle cx="145" cy="58" r="1.5" fill="#93C5FD" />
      {/* Charging cable */}
      <path d="M145 70 C145 78 140 82 130 85 C120 88 100 88 90 85" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Car */}
      <rect x="30" y="72" width="70" height="22" rx="4" fill="#3B82F6" />
      <rect x="38" y="64" width="48" height="12" rx="3" fill="#60A5FA" />
      {/* Windows */}
      <rect x="42" y="66" width="18" height="8" rx="1.5" fill="#BFDBFE" />
      <rect x="63" y="66" width="18" height="8" rx="1.5" fill="#BFDBFE" />
      {/* Wheels */}
      <circle cx="48" cy="94" r="7" fill="#374151" />
      <circle cx="48" cy="94" r="4" fill="#6B7280" />
      <circle cx="82" cy="94" r="7" fill="#374151" />
      <circle cx="82" cy="94" r="4" fill="#6B7280" />
      {/* Charging plug connector */}
      <circle cx="90" cy="85" r="3" fill="#60A5FA" />
      {/* LED indicator */}
      <circle cx="145" cy="66" r="1.5" fill="#34D399" />
      <circle cx="145" cy="66" r="3" fill="#34D399" opacity="0.3" />
      <defs>
        <linearGradient id="wb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeatPumpIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="url(#hp-bg)" rx="0" />
      {/* House silhouette */}
      <rect x="90" y="35" width="60" height="50" rx="2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <polygon points="80,37 120,15 160,37" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      {/* Window */}
      <rect x="105" y="50" width="14" height="14" rx="1" fill="#BFDBFE" />
      <line x1="112" y1="50" x2="112" y2="64" stroke="#93C5FD" strokeWidth="0.5" />
      <line x1="105" y1="57" x2="119" y2="57" stroke="#93C5FD" strokeWidth="0.5" />
      {/* Door */}
      <rect x="125" y="60" width="12" height="25" rx="1" fill="#94A3B8" />
      {/* Heat pump outdoor unit */}
      <rect x="25" y="55" width="40" height="35" rx="4" fill="#DC2626" />
      <rect x="28" y="58" width="34" height="18" rx="2" fill="#991B1B" />
      {/* Fan grille */}
      <circle cx="45" cy="67" r="7" stroke="#FCA5A5" strokeWidth="1" fill="none" />
      <circle cx="45" cy="67" r="4" stroke="#FCA5A5" strokeWidth="0.5" fill="none" />
      <line x1="45" y1="60" x2="45" y2="74" stroke="#FCA5A5" strokeWidth="0.5" />
      <line x1="38" y1="67" x2="52" y2="67" stroke="#FCA5A5" strokeWidth="0.5" />
      {/* Connection pipes */}
      <path d="M65 65 L90 65" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M65 75 L90 75" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" />
      {/* Heat waves */}
      <path d="M110 42 Q113 38 110 34" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M116 42 Q119 38 116 34" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M122 42 Q125 38 122 34" stroke="#FCA5A5" strokeWidth="1" fill="none" opacity="0.2" />
      {/* Temperature indicator */}
      <rect x="30" y="80" width="8" height="3" rx="1" fill="#FCA5A5" />
      <rect x="40" y="80" width="8" height="3" rx="1" fill="#34D399" />
      {/* Ground */}
      <rect x="0" y="100" width="200" height="20" fill="#86EFAC" opacity="0.2" />
      <defs>
        <linearGradient id="hp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF2F2" />
          <stop offset="100%" stopColor="#FFF7ED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SmartHomeIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="url(#sh-bg)" rx="0" />
      {/* House */}
      <rect x="60" y="45" width="80" height="50" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <polygon points="50,47 100,20 150,47" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      {/* Smart windows with glow */}
      <rect x="70" y="55" width="16" height="16" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
      <rect x="115" y="55" width="16" height="16" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
      {/* Door */}
      <rect x="93" y="68" width="14" height="27" rx="1.5" fill="#94A3B8" />
      <circle cx="104" cy="82" r="1.5" fill="#34D399" />
      {/* WiFi symbol above house */}
      <path d="M92 28 Q100 22 108 28" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M95 24 Q100 20 105 24" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="30" r="1.5" fill="#10B981" />
      {/* Thermostat icon */}
      <circle cx="30" cy="55" r="12" fill="white" stroke="#10B981" strokeWidth="1.5" />
      <path d="M30 48 L30 55 L35 55" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
      <text x="25" y="66" fontSize="5" fill="#6B7280">22°</text>
      {/* Energy meter */}
      <rect x="160" y="45" width="24" height="30" rx="3" fill="white" stroke="#10B981" strokeWidth="1" />
      <rect x="163" y="48" width="18" height="8" rx="1" fill="#D1FAE5" />
      <text x="165" y="55" fontSize="5" fill="#059669" fontFamily="monospace">3.2kW</text>
      {/* Connection lines */}
      <path d="M42 55 L60 55" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
      <path d="M140 60 L160 60" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
      {/* Ground */}
      <rect x="0" y="100" width="200" height="20" fill="#86EFAC" opacity="0.15" />
      <defs>
        <linearGradient id="sh-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#F0FDF4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const illustrations: Record<string, React.ComponentType> = {
  solar: SolarIllustration,
  emobility: WallboxIllustration,
  heating: HeatPumpIllustration,
  smarthome: SmartHomeIllustration,
};

export function ProductShowcase({
  icon,
  gradient,
  title,
  description,
  price,
  priceLabel,
  features,
  tag,
  tagColor = 'bg-primary-100 text-primary-700',
  selected,
  onToggle,
}: ProductShowcaseProps) {
  const Illustration = illustrations[gradient] || SolarIllustration;

  return (
    <div
      className={`showcase-card cursor-pointer ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
      onClick={onToggle}
    >
      <div className="showcase-card-image relative">
        <Illustration />
        {tag && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagColor}`}>
            {tag}
          </span>
        )}
        {selected !== undefined && (
          <div className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            selected ? 'bg-primary-600 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 border border-gray-200'
          }`}>
            {selected ? '\u2713' : ''}
          </div>
        )}
      </div>
      <div className="showcase-card-body">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="showcase-card-price">{price}</span>
          <span className="text-sm text-gray-400">{priceLabel}</span>
        </div>
        <div className="space-y-1.5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
