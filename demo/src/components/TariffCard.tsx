interface TariffCardProps {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  price: string;
  priceUnit: string;
  priceLabel?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function TariffCard({
  gradient,
  icon,
  title,
  subtitle,
  badge,
  price,
  priceUnit,
  priceLabel,
  children,
  footer,
}: TariffCardProps) {
  return (
    <div className="tariff-card">
      <div className={`tariff-card-header ${gradient}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
            </div>
          </div>
          {badge && (
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-4">
          {priceLabel && <p className="tariff-card-label mb-1">{priceLabel}</p>}
          <div className="flex items-baseline">
            <span className="tariff-card-price">{price}</span>
            <span className="tariff-card-price-unit">{priceUnit}</span>
          </div>
        </div>
      </div>
      {children && <div className="tariff-card-body">{children}</div>}
      {footer && <div className="tariff-card-footer">{footer}</div>}
    </div>
  );
}
