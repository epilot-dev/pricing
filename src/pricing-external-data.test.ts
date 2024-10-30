
import { computeAggregatedAndPriceTotals } from './pricing';
import { pricesWithExternalData } from './__tests__/fixtures/price-external-data.samples';
import { CompositePriceItem, PriceItem } from './types';


describe('External Data - computeAggregatedAndPriceTotals', () => {
  describe('whith internal and external prices', () => {
    it('returns the correct totals and items', () => {
      // given
      const priceItems = pricesWithExternalData
      
      // when
      const result = computeAggregatedAndPriceTotals(priceItems);
      
      // then
      const computedItems = result.items;
      const simpleInternalPriceItem = computedItems?.find((item) => item._price?._id === 'efe9ff76-865c-4287-8de9-422cfc741ff9') as PriceItem
      const externalCompositePriceItem = computedItems?.find((item) => item._price?._id === 'price-12312414') as CompositePriceItem
      const totalDetailsBreakdown = result.total_details?.breakdown;
      const externalCompositePriceTotalDetailsBreakdown = externalCompositePriceItem?.total_details?.breakdown
  
      const oneTimeTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'one_time');
      const monthlyTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'recurring' && recurrence.billing_period === 'monthly');
      const oneTimeExternalCompositePriceRecurrence = externalCompositePriceTotalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'one_time');
      const monthlyExternalCompositePriceRecurrence = externalCompositePriceTotalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'recurring' && recurrence.billing_period === 'monthly');

      expect(oneTimeTotalRecurrence?.amount_total).toBe(49090);
      expect(oneTimeTotalRecurrence?.amount_total_decimal).toBe("490.9048");
      expect(monthlyTotalRecurrence?.amount_total).toBe(32000);
      expect(monthlyTotalRecurrence?.amount_total_decimal).toBe("320");
      expect(oneTimeExternalCompositePriceRecurrence?.amount_total).toBe(1000);
      expect(oneTimeExternalCompositePriceRecurrence?.amount_subtotal).toBe(840);
      expect(monthlyExternalCompositePriceRecurrence?.amount_total).toBe(16000);
      expect(monthlyExternalCompositePriceRecurrence?.amount_subtotal).toBe(15000);
      expect(simpleInternalPriceItem?.amount_total).toBe(23045);
    });
  });
});
