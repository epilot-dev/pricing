import { getPriceTiersForQuantity } from './getPriceTiersForQuantity';

describe('getPriceTiersForQuantity', () => {
  const tiers = [
    {
      unit_amount: 1000,
      unit_amount_decimal: '10.00',
      up_to: 10,
    },
    {
      unit_amount: 800,
      unit_amount_decimal: '8.00',
      up_to: 20,
    },
    {
      unit_amount: 600,
      unit_amount_decimal: '6.00',
    },
  ];

  it('should return the correct result when quantity is 1', () => {
    const result = getPriceTiersForQuantity(tiers, 1);

    expect(result).toEqual([tiers[0]]);
  });

  it('should return the correct result when quantity is 10', () => {
    const result = getPriceTiersForQuantity(tiers, 10);
    expect(result).toEqual([tiers[0]]);
  });

  it('should return the correct result when quantity is 15', () => {
    const result = getPriceTiersForQuantity(tiers, 15);
    expect(result).toEqual([tiers[0], tiers[1]]);
  });

  it('should return the correct result when quantity is 25', () => {
    const result = getPriceTiersForQuantity(tiers, 25);
    expect(result).toEqual([tiers[0], tiers[1], tiers[2]]);
  });

  it('should return the correct result when quantity is 100', () => {
    const result = getPriceTiersForQuantity(tiers, 100);
    expect(result).toEqual([tiers[0], tiers[1], tiers[2]]);
  });
});
