import { computeAggregatedAndPriceTotals } from './pricing';
import { pricesWithExternalData } from './__tests__/fixtures/price-external-data.samples';
import { CompositePriceItem, PriceItem } from './types';

describe('External Data - computeAggregatedAndPriceTotals', () => {
  describe('with internal and external prices', () => {
    it('returns the correct totals and items', () => {
      // when
      const result = computeAggregatedAndPriceTotals(pricesWithExternalData);
      
      // then
      const computedItems = result.items;
      const simpleInternalOneTimePriceItem = computedItems?.find((item) => item._price?._id === 'efe9ff76-865c-4287-8de9-422cfc741ff9') as PriceItem
      const externalCompositePriceItem = computedItems?.find((item) => item._price?._id === 'price-12312414') as CompositePriceItem
      const simpleExternalOneTimePriceItem = computedItems?.find((item) => item._price?._id === 'price-73f857a4-0fbc-4aa6-983f-87c0d6d410a6') as PriceItem
      const totalDetailsBreakdown = result.total_details?.breakdown;
      const externalCompositePriceTotalDetailsBreakdown = externalCompositePriceItem?.total_details?.breakdown
  
      const oneTimeTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'one_time');
      const monthlyTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'recurring' && recurrence.billing_period === 'monthly');
      const oneTimeExternalCompositePriceRecurrence = externalCompositePriceTotalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'one_time');
      const monthlyExternalCompositePriceRecurrence = externalCompositePriceTotalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'recurring' && recurrence.billing_period === 'monthly');

      expect(oneTimeTotalRecurrence?.amount_total).toBe(51590);
      expect(oneTimeTotalRecurrence?.amount_total_decimal).toBe("515.9048");
      expect(monthlyTotalRecurrence?.amount_total).toBe(32000);
      expect(monthlyTotalRecurrence?.amount_total_decimal).toBe("320");
      expect(oneTimeExternalCompositePriceRecurrence?.amount_total).toBe(1000);
      expect(oneTimeExternalCompositePriceRecurrence?.amount_subtotal).toBe(840);
      expect(monthlyExternalCompositePriceRecurrence?.amount_total).toBe(16000);
      expect(monthlyExternalCompositePriceRecurrence?.amount_subtotal).toBe(15000);
      expect(simpleInternalOneTimePriceItem?.amount_total).toBe(23045);
      expect(simpleInternalOneTimePriceItem?.amount_total_decimal).toBe("230.4524");
      expect(simpleExternalOneTimePriceItem?.amount_total).toBe(2500);
      expect(simpleExternalOneTimePriceItem?.amount_total_decimal).toBe("25");
    });
  });
});
