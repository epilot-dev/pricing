interface ResultCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
  color?: 'default' | 'green' | 'red' | 'blue' | 'amber';
}

const colorMap = {
  default: 'text-gray-900',
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-primary-600',
  amber: 'text-amber-600',
};

export function ResultCard({ label, value, sublabel, highlight, color = 'default' }: ResultCardProps) {
  return (
    <div
      className={`rounded-lg p-4 ${highlight ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 border border-gray-100'}`}
    >
      <p className="result-label">{label}</p>
      <p className={`text-xl font-bold mt-1 ${colorMap[color]}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
