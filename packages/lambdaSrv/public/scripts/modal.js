// Get the modal
const bapuModal = document.getElementById('bapuModal');

// Get the button that opens the modal
var btnOpenBapuModal = document.getElementById("btnOpenBapuModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("closeModal")[0];

const remove_duplicates_es6 = (arr) => {
    let s = new Set(arr);
    let it = s.values();
    return Array.from(it);
}

const tStamp = D => ''.concat(
  D.getFullYear().toString(),
  (D.getMonth() + 1).toString().padStart(2, '0'),
  D.getDate().toString().padStart(2, '0'),
  D.getHours().toString().padStart(2, '0'),
  D.getMinutes().toString().padStart(2, '0')
);

let timer = null;
// When the user clicks the button, open the modal
btnOpenBapuModal.onclick = async (event) => {
  CLG(`  *** DISPLAY IT  ***  ${event}`);
  event.stopPropagation();

  const divExtractedPersons = document.getElementById("extractedPersons");
  const divExtractedInvoices = document.getElementById("extractedInvoices");
  // const spnInitialInvoice = document.getElementById("spnInitialInvoice");
  // const spnCurrentInvoice = document.getElementById("spnCurrentInvoice");

  const dd = 'bapu';
  const vwAll = 'allPersons';
  // const vwRefd = 'refreshedPersons';
  const prms = 'reduce=true&update=true';

  const uriScraperControl = `${envServerURL}/${envDbName}/00_ScraperControl`;
  const uriAll = `${envServerURL}/${envDbName}/_design/${dd}/_view/${vwAll}?${prms}`;
  // const uriRefd = `${envServerURL}/${envDbName}/_design/${dd}/_view/${vwRefd}?${prms}`;
  // const startkey = `startkey=%22${tStamp(new Date())}%22`;
  const config = { auth: envAuth };

  // const vwLastInv = 'latestInvoice';
  // const invPrms = 'update=true&descending=true&limit=1';
  // const uriLastInv = `${envServerURL}/${envDbName}/_design/${dd}/_view/${vwLastInv}?${invPrms}`;

  // let refreshedPersonsCount = 1;
  // let allPersonsCount = 1;
  // let initialInvoice = 'esperando inicio';
  // let currentInvoice = 'esperando inicio';
  // let pct = 0;
  // let rsltAll = null;

  const creds = await authenticate();
  if (creds == null) return;
    try {
      config.auth = creds;
      rsltAll = await axios.get(`${uriAll}`, config);
    } catch (err) {
      CDR(err);
      return;
    }

  try {

    // allPersonsCount = 1000;
    // // allPersonsCount = rsltAll.data.rows[0].value - 5;

    // const rsltIniInv = await axios.get(`${uriLastInv}`, config);
    // CDR(rsltIniInv);
    // if (rsltIniInv && rsltIniInv.data && rsltIniInv.data.rows && rsltIniInv.data.rows.length > 0) {
    //   if (rsltIniInv.data.rows[0].value) {
    //     initialInvoice = `001-001-${rsltIniInv.data.rows[0].value} [de la fecha: ${rsltIniInv.data.rows[0].key}]`;
    //   }
    // }

    const personsList_In = '<div style="text-align:center">Clientes</div><hr/><ol>';
    const personsList_Out = '</ol>';
    divExtractedPersons.innerHTML = `${personsList_In}<li></li>${personsList_Out}`;

    const invoicesList_In = '<div style="text-align:center">Facturas</div><hr/><ol>';
    const invoicesList_Out = '</ol>';
    divExtractedInvoices.innerHTML = `${invoicesList_In}<li></li>${invoicesList_Out}`;

    timer = setInterval(async () => {
      const { data } = await axios.get(`${uriScraperControl}`, config);
      // const controlRecord = JSON.stringify(data, null, 2);
      // CDR(controlRecord);
      CLG(`\nClientes :: \n${JSON.stringify(data.clientes, null, 2)}\nFacturas :: \n${JSON.stringify(data.facturas, null, 2)}`);
      // CDR(data.clientes);
      // CDR(data.facturas);

      let personsList = personsList_In;
      let clientes = remove_duplicates_es6(data.clientes);
      clientes.forEach((cliente) => {
        personsList += `<li>${cliente}</li>`;
      });
      personsList += personsList_Out;
      divExtractedPersons.innerHTML = personsList;
      // CLG(`${personsList}`);

      let invoicesList = invoicesList_In;
      data.facturas.forEach((invoice) => {
        invoicesList += `<li>${invoice}</li>`;
      });
      invoicesList += invoicesList_Out;
      divExtractedInvoices.innerHTML = invoicesList;
      // CLG(`${invoicesList}`);
    }, 5000);
  } catch (error) {
    console.error(error);
  }

  cypressInvoices();

  bapuModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function(event) {
  event.stopPropagation();
  clearInterval(timer)
  bapuModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  event.stopPropagation();
  clearInterval(timer);
  try {
    if (event.target == bapuModal) {
      bapuModal.style.display = "none";
    }
  } catch (err) {
    CLG(`Error while destroying unwanted progress bar.`);
  }
}
