async function cypressInvoices() {
  // CLG('  ***  DISABLED  ***');
  try {
    const host = window.location.origin;
    CLG(`Fetching from ${host}/scrapeInv`);
    const response = await fetch(`${host}/scrapeInv`);
    const myJson = await response.json(); // extract JSON from the http response
    CLG(myJson);
  } catch (err) {
    CLG(`Cypress error ${err}`);
  }
}
