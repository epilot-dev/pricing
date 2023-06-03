import { EntityItem, Tax } from '../../types';

export const tax10percent: EntityItem & Tax = {
  _id: '10',
  rate: 10,
  type: 'VAT',
  _schema: 'tax',
  _org: '739224',
  _title: '',
  _created_at: '2022-06-29T20:26:19.020Z',
  _updated_at: '2022-06-29T20:26:19.020Z',
};

export const tax19percent: EntityItem & Tax = {
  _id: '19',
  _schema: 'tax',
  _org: '739224',
  _title: '',
  rate: 19,
  type: 'VAT',
  _created_at: '2022-06-29T20:26:19.020Z',
  _updated_at: '2022-06-29T20:26:19.020Z',
};

export const tax6percent: EntityItem & Tax = {
  _id: '6',
  rate: 6,
  _schema: 'tax',
  _org: '739224',
  _title: '',
  type: 'VAT',
  _created_at: '2022-06-29T20:26:19.020Z',
  _updated_at: '2022-06-29T20:26:19.020Z',
};
