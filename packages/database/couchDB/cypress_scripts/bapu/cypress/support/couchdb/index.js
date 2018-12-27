import { default as scrapeInvoice } from './ScrapeInvoice';
import { default as utils } from './utils';

const { couchGetOpts, couchPutOpts, couchPayload } = utils;

export default { couchGetOpts, couchPutOpts, couchPayload, scrapeInvoice };
