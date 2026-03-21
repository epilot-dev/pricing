import { useState } from 'react';
import { OverviewDemo } from './sections/OverviewDemo';
import { PerUnitDemo } from './sections/PerUnitDemo';
import { TieredVolumeDemo } from './sections/TieredVolumeDemo';
import { TieredGraduatedDemo } from './sections/TieredGraduatedDemo';
import { TieredFlatFeeDemo } from './sections/TieredFlatFeeDemo';
import { TaxDemo } from './sections/TaxDemo';
import { DiscountDemo } from './sections/DiscountDemo';
import { CompositePriceDemo } from './sections/CompositePriceDemo';
import { RecurringBillingDemo } from './sections/RecurringBillingDemo';
import { CurrencyDemo } from './sections/CurrencyDemo';
import { DynamicTariffDemo } from './sections/DynamicTariffDemo';
import { GetAGDemo } from './sections/GetAGDemo';

const sections = [
  { id: 'overview', label: 'Overview', icon: '🏠', component: OverviewDemo },
  { id: 'per-unit', label: 'Per Unit', icon: '📦', component: PerUnitDemo },
  { id: 'tiered-volume', label: 'Tiered Volume', icon: '📊', component: TieredVolumeDemo },
  { id: 'tiered-graduated', label: 'Tiered Graduated', icon: '📈', component: TieredGraduatedDemo },
  { id: 'tiered-flatfee', label: 'Tiered Flat Fee', icon: '🏷️', component: TieredFlatFeeDemo },
  { id: 'tax', label: 'Tax Handling', icon: '🧾', component: TaxDemo },
  { id: 'discounts', label: 'Discounts & Coupons', icon: '🎟️', component: DiscountDemo },
  { id: 'composite', label: 'Composite Pricing', icon: '🧩', component: CompositePriceDemo },
  { id: 'recurring', label: 'Recurring Billing', icon: '🔄', component: RecurringBillingDemo },
  { id: 'currency', label: 'Currency & Formatting', icon: '💱', component: CurrencyDemo },
  { id: 'dynamic-tariff', label: 'Dynamic Tariff', icon: '⚡', component: DynamicTariffDemo },
  { id: 'getag', label: 'GetAG Energy', icon: '🔌', component: GetAGDemo },
] as const;

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ActiveComponent = sections.find((s) => s.id === activeSection)?.component ?? OverviewDemo;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">epilot Pricing</h1>
          <p className="text-xs text-gray-500 mt-0.5">Interactive Demo</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-50 text-primary-700 font-medium border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
          @epilot/pricing v5.4.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-gray-700">
            {sections.find((s) => s.id === activeSection)?.icon}{' '}
            {sections.find((s) => s.id === activeSection)?.label}
          </h2>
        </div>
        <div className="p-6 max-w-6xl mx-auto">
          <ActiveComponent onNavigate={setActiveSection} />
        </div>
      </main>
    </div>
  );
}
