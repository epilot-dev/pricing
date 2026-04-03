import { computeAggregatedAndPriceTotals } from '@epilot/pricing';
import { useState, useMemo } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ResultCard } from '../components/ResultCard';
import { TariffCard } from '../components/TariffCard';
import { buildPriceItemDto, fmtCents, fmtEur } from '../helpers';

type EnergyType = 'electricity' | 'gas';

interface FeeComponent {
  key: string;
  label: string;
  description: string;
  ctPerKwh: string;
  color: string;
}

const ELECTRICITY_FEES: FeeComponent[] = [
  {
    key: 'procurement',
    label: 'Energy Procurement',
    description: 'Wholesale energy cost',
    ctPerKwh: '8.50',
    color: 'bg-blue-500',
  },
  { key: 'grid', label: 'Grid Fees', description: 'Network usage charges', ctPerKwh: '8.12', color: 'bg-amber-500' },
  {
    key: 'concession',
    label: 'Concession Levy',
    description: 'Municipality concession fee',
    ctPerKwh: '1.66',
    color: 'bg-orange-400',
  },
  {
    key: 'eeg',
    label: 'EEG Surcharge',
    description: 'Renewable energy surcharge (currently 0)',
    ctPerKwh: '0.00',
    color: 'bg-green-400',
  },
  {
    key: 'kwkg',
    label: 'KWKG Surcharge',
    description: 'Combined heat and power promotion',
    ctPerKwh: '0.275',
    color: 'bg-teal-400',
  },
  {
    key: 'offshore',
    label: 'Offshore Levy',
    description: 'Offshore grid connection costs',
    ctPerKwh: '0.656',
    color: 'bg-cyan-400',
  },
  {
    key: 'stromnev',
    label: 'Grid Fee Exemption Levy',
    description: 'Grid fee exemption reallocation',
    ctPerKwh: '0.417',
    color: 'bg-indigo-400',
  },
  {
    key: 'tax',
    label: 'Electricity Tax',
    description: 'Federal electricity tax',
    ctPerKwh: '2.05',
    color: 'bg-red-400',
  },
];

const GAS_FEES: FeeComponent[] = [
  {
    key: 'procurement',
    label: 'Energy Procurement',
    description: 'Wholesale gas cost',
    ctPerKwh: '5.50',
    color: 'bg-blue-500',
  },
  { key: 'grid', label: 'Grid Fees', description: 'Network usage charges', ctPerKwh: '1.80', color: 'bg-amber-500' },
  {
    key: 'concession',
    label: 'Concession Levy',
    description: 'Municipality concession fee',
    ctPerKwh: '0.03',
    color: 'bg-orange-400',
  },
  { key: 'co2', label: 'CO2 Levy', description: 'Carbon tax', ctPerKwh: '0.546', color: 'bg-emerald-400' },
  {
    key: 'storage',
    label: 'Gas Storage Levy',
    description: 'Strategic reserve fee',
    ctPerKwh: '0.059',
    color: 'bg-teal-400',
  },
  { key: 'energytax', label: 'Energy Tax', description: 'Federal energy tax', ctPerKwh: '0.55', color: 'bg-red-400' },
];

const ZIP_VARIATIONS: Record<
  string,
  { electricity: Partial<Record<string, string>>; gas: Partial<Record<string, string>> }
> = {
  '10115': { electricity: {}, gas: {} }, // Berlin – defaults
  '80331': { electricity: { grid: '7.45', concession: '1.99' }, gas: { grid: '1.62', concession: '0.03' } },
  '20095': { electricity: { grid: '8.90', concession: '1.59' }, gas: { grid: '1.95', concession: '0.03' } },
  '50667': { electricity: { grid: '7.80', concession: '1.32' }, gas: { grid: '1.70', concession: '0.03' } },
  '70173': { electricity: { grid: '8.35', concession: '1.76' }, gas: { grid: '1.88', concession: '0.03' } },
};

function applyZipOverrides(
  fees: FeeComponent[],
  overrides: Partial<Record<string, string>> | undefined,
): FeeComponent[] {
  if (!overrides) return fees;
  return fees.map((fee) => (overrides[fee.key] ? { ...fee, ctPerKwh: overrides[fee.key]! } : fee));
}

export function GetAGDemo() {
  const [energyType, setEnergyType] = useState<EnergyType>('electricity');
  const [zipCode, setZipCode] = useState('10115');
  const [electricityFees, setElectricityFees] = useState<FeeComponent[]>(ELECTRICITY_FEES);
  const [gasFees, setGasFees] = useState<FeeComponent[]>(GAS_FEES);
  const [electricityBasePrice, setElectricityBasePrice] = useState('96.00');
  const [gasBasePrice, setGasBasePrice] = useState('144.00');
  const [electricityConsumption, setElectricityConsumption] = useState(3500);
  const [gasConsumption, setGasConsumption] = useState(15000);
  const [taxRate] = useState(19);

  const fees = energyType === 'electricity' ? electricityFees : gasFees;
  const setFees = energyType === 'electricity' ? setElectricityFees : setGasFees;
  const basePrice = energyType === 'electricity' ? electricityBasePrice : gasBasePrice;
  const setBasePrice = energyType === 'electricity' ? setElectricityBasePrice : setGasBasePrice;
  const consumption = energyType === 'electricity' ? electricityConsumption : gasConsumption;
  const setConsumption = energyType === 'electricity' ? setElectricityConsumption : setGasConsumption;

  const handleZipChange = (newZip: string) => {
    setZipCode(newZip);
    const variations = ZIP_VARIATIONS[newZip];
    if (variations) {
      setElectricityFees(applyZipOverrides(ELECTRICITY_FEES, variations.electricity));
      setGasFees(applyZipOverrides(GAS_FEES, variations.gas));
    } else {
      setElectricityFees(ELECTRICITY_FEES);
      setGasFees(GAS_FEES);
    }
  };

  const updateFee = (key: string, value: string) => {
    setFees((prev) => prev.map((f) => (f.key === key ? { ...f, ctPerKwh: value } : f)));
  };

  // Convert ct/kWh to EUR for the pricing library: ct/kWh / 100 = EUR/kWh
  const ctToEurDecimal = (ct: string) => (parseFloat(ct) / 100).toFixed(6);

  const result = useMemo(() => {
    const items: ReturnType<typeof buildPriceItemDto>[] = [];

    // Base price – fixed annual fee
    items.push(
      buildPriceItemDto({
        unitAmountDecimal: basePrice,
        quantity: 1,
        type: 'recurring',
        billingPeriod: 'yearly',
        taxRate,
        isTaxInclusive: false,
        description: 'Base Price',
      }),
    );

    // Each fee component becomes an individual per_unit price item
    for (const fee of fees) {
      const ctVal = parseFloat(fee.ctPerKwh);
      if (ctVal === 0) continue;
      items.push(
        buildPriceItemDto({
          unitAmountDecimal: ctToEurDecimal(fee.ctPerKwh),
          quantity: consumption,
          type: 'recurring',
          billingPeriod: 'yearly',
          taxRate,
          isTaxInclusive: false,
          description: fee.label,
        }),
      );
    }

    return computeAggregatedAndPriceTotals(items);
  }, [basePrice, fees, consumption, taxRate]);

  // Manual cost calculations for display
  const baseCost = parseFloat(basePrice);
  const feeCosts = fees.map((fee) => ({
    ...fee,
    eurCost: (parseFloat(fee.ctPerKwh) / 100) * consumption,
  }));
  const totalFeeCost = feeCosts.reduce((sum, f) => sum + f.eurCost, 0);
  const totalNet = baseCost + totalFeeCost;
  const totalCtPerKwh = fees.reduce((sum, f) => sum + parseFloat(f.ctPerKwh), 0);
  const totalGross = totalNet * (1 + taxRate / 100);
  const monthlyGross = totalGross / 12;

  const consMin = energyType === 'electricity' ? 1000 : 3000;
  const consMax = energyType === 'electricity' ? 10000 : 40000;
  const consStep = energyType === 'electricity' ? 100 : 500;

  const gradientClass = energyType === 'electricity' ? 'gradient-electricity' : 'gradient-gas';
  const icon = energyType === 'electricity' ? '\u26A1' : '\uD83D\uDD25';
  const tariffTitle = energyType === 'electricity' ? 'Electricity Tariff' : 'Gas Tariff';

  const knownZips = Object.keys(ZIP_VARIATIONS);
  const isKnownZip = knownZips.includes(zipCode);

  return (
    <div>
      <h1 className="section-title">GetAG Energy Pricing</h1>
      <p className="section-desc">
        GetAG is a German energy data provider that supplies regulated fee components – grid fees, levies, and taxes –
        based on delivery address. Each fee is modeled as a standard{' '}
        <code className="text-primary-600 font-mono text-sm">per_unit</code> price item, and the pricing library (
        <code className="text-primary-600 font-mono text-sm">computeAggregatedAndPriceTotals</code>) computes the
        totals. GetAG provides the data; @epilot/pricing does the math.
      </p>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 mb-6">
        <strong>Note:</strong> The fee values shown here are simulated data to illustrate a possible example. Actual
        GetAG fees vary by delivery address, grid operator, and regulatory period.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column – Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Zip code */}
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery Address</p>
            <div>
              <label className="text-xs text-gray-600 font-medium">Zip Code (PLZ)</label>
              <input
                type="text"
                maxLength={5}
                value={zipCode}
                onChange={(e) => handleZipChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className="input-field mt-1"
                placeholder="e.g. 10115"
              />
            </div>
            {isKnownZip && <p className="text-xs text-green-600 mt-2">Fee data loaded for zip code {zipCode}</p>}
            {zipCode.length === 5 && !isKnownZip && (
              <p className="text-xs text-amber-600 mt-2">
                Using default fee values (no specific data for this zip code in the demo)
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {knownZips.map((z) => (
                <button
                  key={z}
                  onClick={() => handleZipChange(z)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    zipCode === z
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Energy type tabs */}
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Energy Type</p>
            <div className="flex gap-2">
              {(['electricity', 'gas'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEnergyType(t)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                    energyType === t
                      ? `${t === 'electricity' ? 'gradient-electricity' : 'gradient-gas'} text-white shadow-md`
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t === 'electricity' ? '\u26A1 Electricity' : '\uD83D\uDD25 Gas'}
                </button>
              ))}
            </div>
          </div>

          {/* Fee table */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fee Components</p>
              <span className="text-xs text-gray-400 font-mono">{totalCtPerKwh.toFixed(3)} ct/kWh total</span>
            </div>
            <div className="space-y-2">
              {fees.map((fee) => (
                <div key={fee.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-2.5 h-2.5 rounded-full ${fee.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{fee.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{fee.description}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={fee.ctPerKwh}
                      onChange={(e) => updateFee(fee.key, e.target.value)}
                      className="w-20 text-right text-xs font-mono px-2 py-1 rounded-md border border-gray-200 bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                    />
                    <span className="text-[10px] text-gray-400 w-8">ct/kWh</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consumption slider */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Annual Consumption</label>
              <span className="text-sm font-extrabold text-primary-600">{consumption.toLocaleString()} kWh</span>
            </div>
            <input
              type="range"
              min={consMin}
              max={consMax}
              step={consStep}
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1">
              <span>{consMin.toLocaleString()} kWh</span>
              <span>{consMax.toLocaleString()} kWh</span>
            </div>
          </div>

          {/* Base price */}
          <div className="card">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Base Price</p>
              <div>
                <label className="text-xs text-blue-600 font-medium">Annual fixed fee (EUR/year)</label>
                <input
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column – Tariff card + results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main tariff card */}
          <TariffCard
            gradient={gradientClass}
            icon={<span>{icon}</span>}
            title={tariffTitle}
            subtitle={`${consumption.toLocaleString()} kWh/year \u00b7 PLZ ${zipCode || '...'}`}
            badge={energyType === 'electricity' ? 'STROM' : 'GAS'}
            price={fmtEur(monthlyGross)}
            priceUnit="/month"
            priceLabel="Estimated monthly cost (gross)"
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Annual total (gross)</span>
                <span className="font-extrabold text-gray-900 text-lg">{fmtEur(totalGross)}</span>
              </div>
            }
          >
            <div className="space-y-0">
              {/* Stacked bar */}
              <div className="h-3 flex rounded-full overflow-hidden mb-4">
                <div
                  className="bg-blue-300 transition-all duration-300"
                  style={{ width: `${totalNet > 0 ? (baseCost / totalNet) * 100 : 0}%` }}
                  title="Base Price"
                />
                {feeCosts.map((fee) => (
                  <div
                    key={fee.key}
                    className={`${fee.color} transition-all duration-300`}
                    style={{ width: `${totalNet > 0 ? (fee.eurCost / totalNet) * 100 : 0}%` }}
                    title={`${fee.label}: ${fmtEur(fee.eurCost)}`}
                  />
                ))}
              </div>

              {/* Base price line */}
              <div className="cost-line">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-300" />
                  <div>
                    <span className="cost-line-label">Base Price</span>
                    <p className="text-[10px] text-gray-400">{fmtEur(parseFloat(basePrice))}/year (fixed)</p>
                  </div>
                </div>
                <span className="cost-line-value">{fmtEur(baseCost)}</span>
              </div>

              {/* Fee component lines */}
              {feeCosts.map((fee) => (
                <div key={fee.key} className="cost-line">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${fee.color}`} />
                    <div>
                      <span className="cost-line-label">{fee.label}</span>
                      <p className="text-[10px] text-gray-400">
                        {parseFloat(fee.ctPerKwh).toFixed(3)} ct/kWh x {consumption.toLocaleString()} kWh
                      </p>
                    </div>
                  </div>
                  <span className="cost-line-value">{fmtEur(fee.eurCost)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-600">Net Total (annual)</span>
                <span className="text-lg font-extrabold text-gray-900">{fmtEur(totalNet)}</span>
              </div>
            </div>
          </TariffCard>

          {/* Per-kWh summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center p-5">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Base Price</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{fmtEur(parseFloat(basePrice))}</p>
              <p className="text-xs text-gray-400">per year</p>
            </div>
            <div className="card text-center p-5">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Total Unit Rate</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalCtPerKwh.toFixed(3)}</p>
              <p className="text-xs text-gray-400">ct/kWh (all fees combined)</p>
            </div>
            <div className="card text-center p-5">
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Unit Rate (EUR)</p>
              <p className="text-2xl font-extrabold text-green-600 mt-1">{(totalCtPerKwh / 100).toFixed(6)}</p>
              <p className="text-xs text-gray-400">EUR/kWh (for pricing library)</p>
            </div>
          </div>

          {/* Computed results */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">
              Computed via @epilot/pricing
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ResultCard label="Annual Net" value={fmtCents(result.amount_subtotal)} />
              <ResultCard label={`Tax (${taxRate}%)`} value={fmtCents(result.amount_tax)} color="amber" highlight />
              <ResultCard label="Annual Gross" value={fmtCents(result.amount_total)} highlight color="green" />
              <ResultCard
                label="Monthly Gross"
                value={fmtCents(Math.round((result.amount_total ?? 0) / 12))}
                color="blue"
                highlight
              />
            </div>
          </div>

          {/* How it works */}
          <div className="card">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">How It Works</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2 text-lg">
                  1
                </div>
                <p className="text-sm font-semibold text-blue-700">GetAG provides fees</p>
                <p className="text-xs text-blue-500 mt-1">Regulated fee values based on zip code and energy type</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-lg">
                  2
                </div>
                <p className="text-sm font-semibold text-amber-700">Map to price items</p>
                <p className="text-xs text-amber-500 mt-1">
                  Each fee becomes a per_unit price item with ct/kWh converted to EUR
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2 text-lg">
                  3
                </div>
                <p className="text-sm font-semibold text-green-700">Compute totals</p>
                <p className="text-xs text-green-500 mt-1">
                  @epilot/pricing computes aggregated totals from all line items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code block */}
      <div className="mt-8">
        <CodeBlock
          title="getag-pricing-example.ts"
          code={`import { computeAggregatedAndPriceTotals } from '@epilot/pricing';

// GetAG provides regulated fee values per zip code.
// Each fee component is a standard per_unit price item.
// Inputs are in ct/kWh — convert to EUR for the library (divide by 100).
const items = [
  {
    quantity: 1,
    _price: {
      unit_amount: ${Math.round(parseFloat(basePrice) * 100)},
      unit_amount_decimal: '${parseFloat(basePrice).toFixed(2)}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: 'Base Price',
    },
  },
${fees
  .filter((f) => parseFloat(f.ctPerKwh) > 0)
  .map(
    (fee) => `  {
    quantity: ${consumption},  // kWh annual consumption
    _price: {
      unit_amount: ${Math.round((parseFloat(fee.ctPerKwh) / 100) * 10000)},
      unit_amount_decimal: '${ctToEurDecimal(fee.ctPerKwh)}',
      unit_amount_currency: 'EUR',
      pricing_model: 'per_unit',
      is_tax_inclusive: false,
      type: 'recurring',
      billing_period: 'yearly',
      tax: [{ rate: ${taxRate}, type: 'VAT' }],
      description: '${fee.label}',  // ${fee.ctPerKwh} ct/kWh
    },
  }`,
  )
  .join(',\n')},
];

const result = computeAggregatedAndPriceTotals(items);
// result.amount_subtotal = ${fmtCents(result.amount_subtotal)} (annual net)
// result.amount_tax     = ${fmtCents(result.amount_tax)}
// result.amount_total   = ${fmtCents(result.amount_total)} (annual gross)`}
        />
      </div>
    </div>
  );
}
