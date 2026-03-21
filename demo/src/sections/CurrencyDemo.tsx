import { useState, useMemo } from 'react';
import { formatAmount, formatAmountFromString, getCurrencySymbol, toIntegerAmount } from '@epilot/pricing';
import { ResultCard } from '../components/ResultCard';
import { CodeBlock } from '../components/CodeBlock';

const currencies = [
  { code: 'EUR', name: 'Euro', locale: 'de-DE' },
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'SEK', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'PLN', name: 'Polish Zloty', locale: 'pl-PL' },
  { code: 'CZK', name: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'DKK', name: 'Danish Krone', locale: 'da-DK' },
];

export function CurrencyDemo() {
  const [amount, setAmount] = useState('1234.56');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [locale, setLocale] = useState('de-DE');

  // formatAmount demo (integer cents)
  const intAmount = useMemo(() => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }, [amount]);

  const formattedAmount = useMemo(() => {
    try {
      return formatAmount({ amount: intAmount, currency: selectedCurrency as any, locale });
    } catch {
      return `${selectedCurrency} ${parseFloat(amount).toFixed(2)}`;
    }
  }, [intAmount, selectedCurrency, locale]);

  // formatAmountFromString demo
  const formattedFromString = useMemo(() => {
    try {
      return formatAmountFromString({ decimalAmount: amount, currency: selectedCurrency as any, locale });
    } catch {
      return `${selectedCurrency} ${amount}`;
    }
  }, [amount, selectedCurrency, locale]);

  // Symbol
  const symbol = useMemo(() => {
    try {
      return getCurrencySymbol(selectedCurrency as any, locale);
    } catch {
      return selectedCurrency;
    }
  }, [selectedCurrency, locale]);

  // toIntegerAmount demo
  const integerAmount = useMemo(() => {
    try {
      return toIntegerAmount(amount);
    } catch {
      return Math.round(parseFloat(amount) * 100);
    }
  }, [amount]);

  // All currencies comparison
  const allFormats = useMemo(() => {
    return currencies.map((c) => {
      try {
        const formatted = formatAmount({ amount: intAmount, currency: c.code as any, locale: c.locale });
        const sym = getCurrencySymbol(c.code as any, c.locale);
        return { ...c, formatted, symbol: sym };
      } catch {
        return { ...c, formatted: `${c.code} ${parseFloat(amount).toFixed(2)}`, symbol: c.code };
      }
    });
  }, [intAmount, amount]);

  return (
    <div>
      <h1 className="section-title">Currency & Formatting</h1>
      <p className="section-desc">
        Multi-currency support with locale-aware formatting. Uses Dinero.js for precise decimal arithmetic
        and provides utilities for converting between string/integer representations.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Configure</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">Amount (decimal)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    setSelectedCurrency(e.target.value);
                    const match = currencies.find((c) => c.code === e.target.value);
                    if (match) setLocale(match.locale);
                  }}
                  className="select-field mt-1"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Locale</label>
                <input
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="input-field mt-1"
                  placeholder="e.g., en-US"
                />
              </div>
            </div>
          </div>

          {/* Function Results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Function Results</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">formatAmount({'{'} amount: {intAmount}, currency: '{selectedCurrency}', locale: '{locale}' {'}'})</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formattedAmount}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">formatAmountFromString({'{'} decimalAmount: '{amount}', currency: '{selectedCurrency}', locale: '{locale}' {'}'})</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formattedFromString}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">getCurrencySymbol('{selectedCurrency}', '{locale}')</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{symbol}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">toIntegerAmount('{amount}')</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{integerAmount} <span className="text-sm text-gray-400">(cents)</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* All currencies */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Same Amount in All Currencies</h3>
            <p className="text-xs text-gray-500 mb-3">{intAmount} cents formatted per locale</p>
            <div className="space-y-2">
              {allFormats.map((c) => (
                <div
                  key={c.code}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    c.code === selectedCurrency
                      ? 'bg-primary-50 border border-primary-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      {c.symbol}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.code} ({c.locale})</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{c.formatted}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="mt-6">
        <CodeBlock
          title="Usage"
          code={`import {
  formatAmount,
  formatAmountFromString,
  getCurrencySymbol,
  toIntegerAmount,
} from '@epilot/pricing';

// Format from integer (cents) amount
formatAmount({ amount: ${intAmount}, currency: '${selectedCurrency}', locale: '${locale}' });
// => '${formattedAmount}'

// Format from decimal string
formatAmountFromString({ decimalAmount: '${amount}', currency: '${selectedCurrency}', locale: '${locale}' });
// => '${formattedFromString}'

// Get currency symbol
getCurrencySymbol('${selectedCurrency}', '${locale}');
// => '${symbol}'

// Convert decimal string to integer (cents)
toIntegerAmount('${amount}');
// => ${integerAmount}`}
        />
      </div>
    </div>
  );
}
