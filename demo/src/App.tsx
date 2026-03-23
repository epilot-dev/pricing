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
import { ElectricityDemo } from './sections/ElectricityDemo';
import { GasDemo } from './sections/GasDemo';
import { HouseConnectionDemo } from './sections/HouseConnectionDemo';
import { NonCommodityDemo } from './sections/NonCommodityDemo';

type SectionItem = {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
};

type SectionGroup = {
  group: string;
  items: SectionItem[];
};

type Section = SectionItem | SectionGroup;

function isGroup(s: Section): s is SectionGroup {
  return 'group' in s;
}

const sections: Section[] = [
  { id: 'overview', label: 'Overview', icon: '🏠', component: OverviewDemo },
  {
    group: 'Energy Products',
    items: [
      { id: 'electricity', label: 'Electricity', icon: '⚡', component: ElectricityDemo },
      { id: 'gas', label: 'Gas', icon: '🔥', component: GasDemo },
      { id: 'house-connection', label: 'House Connection', icon: '🏡', component: HouseConnectionDemo },
      { id: 'non-commodity', label: 'Products & Add-ons', icon: '☀️', component: NonCommodityDemo },
    ],
  },
  {
    group: 'Pricing Models',
    items: [
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
    ],
  },
];

function getAllSections(): SectionItem[] {
  const result: SectionItem[] = [];
  for (const s of sections) {
    if (isGroup(s)) {
      result.push(...s.items);
    } else {
      result.push(s);
    }
  }
  return result;
}

const allSections = getAllSections();

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ActiveComponent = allSections.find((s) => s.id === activeSection)?.component ?? OverviewDemo;
  const activeItem = allSections.find((s) => s.id === activeSection);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight">epilot Pricing</h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Interactive Playground</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {sections.map((section) => {
            if (isGroup(section)) {
              return (
                <div key={section.group} className="mt-5 first:mt-0">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                    {section.group}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-all duration-200 ${
                          activeSection === item.id
                            ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <span className="text-base w-6 text-center">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span className="text-base w-6 text-center">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="font-mono">v5.4.0</span>
          </div>
          <p className="text-[10px] text-gray-300 mt-1.5">
            Made with care by{' '}
            <a href="https://github.com/jpinho" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 font-medium">
              @jpinho
            </a>
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeItem?.icon}</span>
            <h2 className="text-sm font-bold text-gray-700">{activeItem?.label}</h2>
          </div>
        </div>
        <div className="p-8 max-w-7xl mx-auto">
          <ActiveComponent onNavigate={setActiveSection} />
        </div>
      </main>
    </div>
  );
}
