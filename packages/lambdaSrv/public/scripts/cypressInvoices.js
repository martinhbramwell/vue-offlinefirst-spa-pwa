async function cypressInvoices() {
  // CLG('  ***  DISABLED  ***');
  let ret = '';
  try {
    const host = window.location.origin;
    CLG(`Fetching from ${host}/scrapeInv`);
    const response = await fetch(`${host}/scrapeInv`);
    // const txt = await response.clone().text(); // extract TEXT from the http response
    // CLG(txt);
    const jsonResponse = await response.json(); // extract JSON from the http response
    CLG(jsonResponse);
    ret = jsonResponse;
  } catch (err) {
    CLG(`Cypress error ${err}`);
    ret = { failure: `${err}` };
  }
  return ret;
}
