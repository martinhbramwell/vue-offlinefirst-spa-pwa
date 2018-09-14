import ProductAccessGroups from './Product/accessGroups';
import InvoiceAccessGroups from './Invoice/accessGroups';

export const accessGroups = Object.assign( // eslint-disable-line import/prefer-default-export
  {},
  ProductAccessGroups,
  InvoiceAccessGroups,
);
