interface ResultCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
  color?: 'default' | 'green' | 'red' | 'blue' | 'amber';
  icon?: React.ReactNode;
  large?: boolean;
}

const colorMap = {
  default: { text: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-100' },
  green: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  blue: { text: 'text-primary-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
};

export function ResultCard({ label, value, sublabel, highlight, color = 'default', icon, large }: ResultCardProps) {
  const colors = colorMap[color];
  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        highlight ? `${colors.bg} ${colors.border} shadow-sm` : `bg-gray-50/50 border-gray-100`
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <p className="result-label">{label}</p>
      </div>
      <p
        className={`${large ? 'text-3xl' : 'text-xl'} font-extrabold mt-1.5 tracking-tight tabular-nums ${highlight ? colors.text : 'text-gray-900'}`}
      >
        {value}
      </p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}
