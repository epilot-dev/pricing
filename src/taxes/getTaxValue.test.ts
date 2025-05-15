import type { Tax } from '@epilot/pricing-client';
import * as taxes from '../__tests__/fixtures/tax.samples';
import { getTaxValue } from './getTaxValue';

describe('getTaxValue', () => {
  it('should return the tax value correctly', () => {
    expect(getTaxValue(taxes.tax19percent)).toEqual(0.19);
    expect(getTaxValue(taxes.taxRateless)).toEqual(0);
    expect(getTaxValue({ rate: 19.5 } as unknown as Tax)).toEqual(0.195);
  });

  it('should be permissive if tax object has rate as numeric string', () => {
    expect(getTaxValue({ rate: '19' } as unknown as Tax)).toEqual(0.19);
    expect(getTaxValue({ rate: ' 19' } as unknown as Tax)).toEqual(0.19);
    expect(getTaxValue({ rate: '19 ' } as unknown as Tax)).toEqual(0.19);
    expect(getTaxValue({ rate: ' 19 ' } as unknown as Tax)).toEqual(0.19);
    expect(getTaxValue({ rate: '19.0' } as unknown as Tax)).toEqual(0.19);
    expect(getTaxValue({ rate: ' 19.5 ' } as unknown as Tax)).toEqual(0.195);
  });

  it('should return 0 if not passed valid tax', () => {
    expect(getTaxValue(undefined)).toEqual(0);
    expect(getTaxValue(null as unknown as Tax)).toEqual(0);
    expect(getTaxValue(NaN as unknown as Tax)).toEqual(0);
    expect(getTaxValue({} as unknown as Tax)).toEqual(0);
    expect(getTaxValue([] as unknown as Tax)).toEqual(0);
    expect(getTaxValue({ rate: 'hello' } as unknown as Tax)).toEqual(0);
    expect(getTaxValue({ rate: '19,5' } as unknown as Tax)).toEqual(0);
    expect(getTaxValue({ rate: undefined } as unknown as Tax)).toEqual(0);
    expect(getTaxValue({ rate: null } as unknown as Tax)).toEqual(0);
    expect(getTaxValue({ rate: NaN } as unknown as Tax)).toEqual(0);
  });
});
