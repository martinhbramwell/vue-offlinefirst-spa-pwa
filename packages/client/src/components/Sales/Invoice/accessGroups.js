const RESOURCE_NAME = 'Invoice';

export const INVOICES_LIST = 'invoices/list';
export const INVOICES = 'invoices';
export const INVOICE = 'invoice';

const groups = {};
groups[RESOURCE_NAME] = [INVOICES, INVOICE, INVOICES_LIST];

export default groups;
