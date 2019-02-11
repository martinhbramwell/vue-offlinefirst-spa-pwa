// Get the modal
const bapuModal = document.getElementById('bapuModal');

// Get the button that opens the modal
var btnOpenBapuModal = document.getElementById("btnOpenBapuModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("closeModal")[0];

const tStamp = D => ''.concat(
  D.getFullYear().toString(),
  (D.getMonth() + 1).toString().padStart(2, '0'),
  D.getDate().toString().padStart(2, '0'),
  D.getHours().toString().padStart(2, '0'),
  D.getMinutes().toString().padStart(2, '0')
);

let progressBar = null;
// When the user clicks the button, open the modal
btnOpenBapuModal.onclick = async (event) => {
  CLG(`  *** DISPLAY IT  ***  ${event}`);
  event.stopPropagation();

  progressBar = startProgress(document.getElementById("extractPersons"));
  const spnInitialInvoice = document.getElementById("spnInitialInvoice");
  const spnCurrentInvoice = document.getElementById("spnCurrentInvoice");

  const srv = 'http://192.168.122.13:5984';
  const db = 'bapu_tmp';
  const dd = 'bapu';
  const vwAll = 'allPersons';
  const vwRefd = 'refreshedPersons';
  const prms = 'reduce=true&update=true';

  const uriAll = `${srv}/${db}/_design/${dd}/_view/${vwAll}?${prms}`;
  const uriRefd = `${srv}/${db}/_design/${dd}/_view/${vwRefd}?${prms}`;
  const startkey = `startkey="${tStamp(new Date())}"`;
  const config = { auth: { username: 'admin', password: '34erDFCV' } };

  const vwLastInv = 'latestInvoice';
  const invPrms = 'update=true&descending=true&limit=1';
  const uriLastInv = `${srv}/${db}/_design/${dd}/_view/${vwLastInv}?${invPrms}`;

  let refreshedPersonsCount = 1;
  let allPersonsCount = 1;
  let initialInvoice = 'esperando inicio';
  let currentInvoice = 'esperando inicio';
  let pct = 0;
  try {
    const rsltAll = await axios.get(`${uriAll}`, config);
    CDR(rsltAll);
    allPersonsCount = rsltAll.data.rows[0].value - 5;

    const rsltIniInv = await axios.get(`${uriLastInv}`, config);
    CDR(rsltIniInv);
    if (rsltIniInv && rsltIniInv.data && rsltIniInv.data.rows && rsltIniInv.data.rows.length > 0) {
      if (rsltIniInv.data.rows[0].value) {
        initialInvoice = `001-001-${rsltIniInv.data.rows[0].value} [de la fecha: ${rsltIniInv.data.rows[0].key}]`;
      }
    }
    spnInitialInvoice.innerHTML = initialInvoice;
    spnCurrentInvoice.innerHTML = currentInvoice;
    let timer = setInterval(async () => {
      // CLG(`@@@@@@@@@@@@@@@@@@@@@@@  ${uriRefd}&${startkey}`);
      const rsltRef = await axios.get(`${uriRefd}&${startkey}`, config);
      refreshedPersonsCount = rsltRef.data.rows.length > 0 ? rsltRef.data.rows[0].value : 0;
      // CLG(`@@@@@@@@@@@@@@@@@@@@@@@ ${refreshedPersonsCount} ${allPersonsCount}`);
      pct = refreshedPersonsCount / allPersonsCount;
      CLG(`Rows : ${rsltRef.data.rows.length}  Total : ${allPersonsCount}  Current ${refreshedPersonsCount}   Progress :: ${pct}`);
      progressBar.animate(pct);

      const rsltCurrInv = await axios.get(`${uriLastInv}`, config);
      CDR(rsltCurrInv);
      if (rsltCurrInv && rsltCurrInv.data && rsltCurrInv.data.rows && rsltCurrInv.data.rows.length > 0) {
        if (rsltCurrInv.data.rows[0].value) {
          currentInvoice = `001-001-${rsltCurrInv.data.rows[0].value} [de la fecha: ${rsltCurrInv.data.rows[0].key}]`;
        }
      }
      spnCurrentInvoice.innerHTML = currentInvoice;

      if (pct > 1) clearInterval(timer);
    }, 10000);
  } catch (error) {
    console.error(error);
  }

  cypressInvoices();

  bapuModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function(event) {
  event.stopPropagation();
  if (progressBar) progressBar.destroy();
  bapuModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  event.stopPropagation();
  if (progressBar) progressBar.destroy();
  if (event.target == bapuModal) {
    bapuModal.style.display = "none";
  }
}
