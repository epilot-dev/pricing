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
  { id: 'overview', label: 'Overview', icon: '\uD83C\uDFE0', component: OverviewDemo },
  {
    group: 'Energy & Utility Use Cases',
    items: [
      { id: 'electricity', label: 'Electricity', icon: '\u26A1', component: ElectricityDemo },
      { id: 'gas', label: 'Gas', icon: '\uD83D\uDD25', component: GasDemo },
      { id: 'house-connection', label: 'House Connection', icon: '\uD83C\uDFE1', component: HouseConnectionDemo },
      { id: 'non-commodity', label: 'Non-Commodity', icon: '\uD83D\uDCCB', component: NonCommodityDemo },
    ],
  },
  {
    group: 'Capabilities',
    items: [
      { id: 'per-unit', label: 'Per Unit', icon: '\uD83D\uDCE6', component: PerUnitDemo },
      { id: 'tiered-volume', label: 'Tiered Volume', icon: '\uD83D\uDCCA', component: TieredVolumeDemo },
      { id: 'tiered-graduated', label: 'Tiered Graduated', icon: '\uD83D\uDCC8', component: TieredGraduatedDemo },
      { id: 'tiered-flatfee', label: 'Tiered Flat Fee', icon: '\uD83C\uDFF7\uFE0F', component: TieredFlatFeeDemo },
      { id: 'tax', label: 'Tax Handling', icon: '\uD83E\uDDFE', component: TaxDemo },
      { id: 'discounts', label: 'Discounts & Coupons', icon: '\uD83C\uDF9F\uFE0F', component: DiscountDemo },
      { id: 'composite', label: 'Composite Pricing', icon: '\uD83E\uDDE9', component: CompositePriceDemo },
      { id: 'recurring', label: 'Recurring Billing', icon: '\uD83D\uDD04', component: RecurringBillingDemo },
      { id: 'currency', label: 'Currency & Formatting', icon: '\uD83D\uDCB1', component: CurrencyDemo },
      { id: 'dynamic-tariff', label: 'Dynamic Tariff', icon: '\u26A1', component: DynamicTariffDemo },
      { id: 'getag', label: 'GetAG Energy', icon: '\uD83D\uDD0C', component: GetAGDemo },
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">epilot Pricing</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pricing Playground</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((section) => {
            if (isGroup(section)) {
              return (
                <div key={section.group}>
                  <div className="px-4 pt-4 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {section.group}
                    </p>
                  </div>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-4 pl-6 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary-50 text-primary-700 font-medium border-r-2 border-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              );
            }

            return (
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
            );
          })}
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
            {activeItem?.icon} {activeItem?.label}
          </h2>
        </div>
        <div className="p-6 max-w-6xl mx-auto">
          <ActiveComponent onNavigate={setActiveSection} />
        </div>
      </main>
    </div>
  );
}
