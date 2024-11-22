import { computeAggregatedAndPriceTotals } from './pricing';
import { pricesWithExternalData, pricesWithExternalDataSingleSimple, pricesWithExternalDataSingleComposite } from './__tests__/fixtures/price-external-data.samples';
import { CompositePriceItem, PriceItem } from './types';

describe('Immutable data - computeAggregatedAndPriceTotals', () => {
  describe('with external pricing details', () => {
    it('returns the correct totals and items for simple price', () => {
      // when
      const result = computeAggregatedAndPriceTotals(pricesWithExternalDataSingleSimple);

      const totalDetailsBreakdown = result.total_details?.breakdown;
      const oneTimeTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'one_time');

      expect(oneTimeTotalRecurrence?.amount_total).toBe(2500);
      expect(oneTimeTotalRecurrence?.amount_total_decimal).toBe("25");
    });
    it('returns the correct totals and items for composite price', () => {
      // when
      const result = computeAggregatedAndPriceTotals(pricesWithExternalDataSingleComposite);
      const totalDetailsBreakdown = result.total_details?.breakdown;

      const oneTimeTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'one_time');
      const monthlyTotalRecurrence = totalDetailsBreakdown?.recurrences?.find((recurrence) => recurrence.type === 'recurring' && recurrence.billing_period === 'monthly');

      expect(oneTimeTotalRecurrence?.amount_total).toBe(1000);
      expect(oneTimeTotalRecurrence?.amount_total_decimal).toBe("10");
      expect(monthlyTotalRecurrence?.amount_total).toBe(16000);
      expect(monthlyTotalRecurrence?.amount_total_decimal).toBe("160");

    });
  });



  describe('with internal and external pricing details', () => {
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
      expect(oneTimeTotalRecurrence?.amount_tax).toBe(3400);
      expect(monthlyTotalRecurrence?.amount_total).toBe(32000);
      expect(monthlyTotalRecurrence?.amount_total_decimal).toBe("320");
      expect(monthlyTotalRecurrence?.amount_tax).toBe(2000);
      expect(oneTimeExternalCompositePriceRecurrence?.amount_total).toBe(1000);
      expect(oneTimeExternalCompositePriceRecurrence?.amount_subtotal).toBe(840);
      expect(oneTimeExternalCompositePriceRecurrence?.amount_tax).toBe(160);
      expect(monthlyExternalCompositePriceRecurrence?.amount_total).toBe(16000);
      expect(monthlyExternalCompositePriceRecurrence?.amount_subtotal).toBe(15000);
      expect(monthlyExternalCompositePriceRecurrence?.amount_tax).toBe(1000);
      expect(simpleInternalOneTimePriceItem?.amount_total).toBe(23045);
      expect(simpleInternalOneTimePriceItem?.amount_total_decimal).toBe("230.4524");
      expect(simpleInternalOneTimePriceItem?.amount_tax).toBe(1508);
      expect(simpleExternalOneTimePriceItem?.amount_total).toBe(2500);
      expect(simpleExternalOneTimePriceItem?.amount_total_decimal).toBe("25");
      expect(simpleExternalOneTimePriceItem?.amount_tax).toBe(0);
    });
  });
});
