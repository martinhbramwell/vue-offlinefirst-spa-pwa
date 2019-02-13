async function cypressInvoices() {
  // CLG('  ***  DISABLED  ***');
  let ret = '';
  try {
    const host = window.location.origin;
    CLG(`Fetching from ${host}/scrapeInv`);
    const response = await fetch(`${host}/scrapeInv`);
    const jsonResponse = await response.json(); // extract JSON from the http response
    CLG(jsonResponse);
    ret = jsonResponse;
  } catch (err) {
    CLG(`Cypress error ${err}`);
    ret = { failure: `${err}` };
  }
  return ret;
}
