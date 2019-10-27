import { default as processYear } from './ProcessYear';
import { default as processPage } from './ProcessPage';
import { default as scrapeClient } from './ScrapeClient';

import { default as utils } from './utils';

const { couchGetOpts, couchPutOpts, couchPayload } = utils;

export default {
  couchGetOpts,
  couchPutOpts,
  couchPayload,
  processYear,
  processPage,
  scrapeClient
};
