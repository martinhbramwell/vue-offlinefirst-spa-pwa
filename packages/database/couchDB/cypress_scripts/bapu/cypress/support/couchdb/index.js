import { default as scrapeInvoice } from './ScrapeInvoice';
import { default as utils } from './utils';

const { couchPutOpts, couchPayload } = utils;

export default { couchPutOpts, couchPayload, scrapeInvoice };
