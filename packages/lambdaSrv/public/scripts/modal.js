// Get the modal
const bapuModal = document.getElementById('bapuModal');

// Get the button that opens the modal
var btnOpenBapuModal = document.getElementById("btnOpenBapuModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("closeModal")[0];

alertify.defaults.glossary.title = 'Logichem';
alertify.defaults.notifier.closeButton = true;
alertify.defaults.glossary.ok = 'Entendido';


const tStamp = D => ''.concat(
  D.getFullYear().toString(),
  (D.getMonth() + 1).toString().padStart(2, '0'),
  D.getDate().toString().padStart(2, '0'),
  D.getHours().toString().padStart(2, '0'),
  D.getMinutes().toString().padStart(2, '0')
);

let timer = null;
let progressBar = null;
// When the user clicks the button, open the modal
btnOpenBapuModal.onclick = async (event) => {
  CLG(`  *** DISPLAY IT  ***  ${event}`);
  event.stopPropagation();

  progressBar = startProgress(document.getElementById("extractPersons"));
  const spnInitialInvoice = document.getElementById("spnInitialInvoice");
  const spnCurrentInvoice = document.getElementById("spnCurrentInvoice");

  const dd = 'bapu';
  const vwAll = 'allPersons';
  const vwRefd = 'refreshedPersons';
  const prms = 'reduce=true&update=true';

  const uriAll = `${envServerURL}/${envDbName}/_design/${dd}/_view/${vwAll}?${prms}`;
  const uriRefd = `${envServerURL}/${envDbName}/_design/${dd}/_view/${vwRefd}?${prms}`;
  const startkey = `startkey=%22${tStamp(new Date())}%22`;
  const config = { auth: envAuth };

  const vwLastInv = 'latestInvoice';
  const invPrms = 'update=true&descending=true&limit=1';
  const uriLastInv = `${envServerURL}/${envDbName}/_design/${dd}/_view/${vwLastInv}?${invPrms}`;

  let refreshedPersonsCount = 1;
  let allPersonsCount = 1;
  let initialInvoice = 'esperando inicio';
  let currentInvoice = 'esperando inicio';
  let pct = 0;
  let rsltAll = null;

  const creds = await authenticate();
  // CLG(`Creds are ${creds}`);
  // CDR(creds);
  if (creds == null) return;

  // if (elemCouchUid.value.length < 1 || elemCouchPwd.value.length < 1) {
  //   alertify.alert(`
  //     <h4>Hay que ingresar nombre de usuario y clave</h4>
  //   `);
  //   return;
  // } else {
    try {
      // config.auth.username = elemCouchUid.value;
      // config.auth.password = elemCouchPwd.value;
      config.auth = creds;
      rsltAll = await axios.get(`${uriAll}`, config);
//       CDR(rsltAll);
    } catch (err) {
      CDR(err);
      // const msg = err.response.status === 401 ? 'Usuario o contraseña inválida.' : err;
      // alertify.alert(`
      //   <h3>El intento de conexión a la base de datos falló.</h3>
      //   <p>${msg}</p>
      // `);
      return;
    }
  // }

  try {

    allPersonsCount = 1000;
    // allPersonsCount = rsltAll.data.rows[0].value - 5;

    const rsltIniInv = await axios.get(`${uriLastInv}`, config);
    CDR(rsltIniInv);
    if (rsltIniInv && rsltIniInv.data && rsltIniInv.data.rows && rsltIniInv.data.rows.length > 0) {
      if (rsltIniInv.data.rows[0].value) {
        initialInvoice = `001-001-${rsltIniInv.data.rows[0].value} [de la fecha: ${rsltIniInv.data.rows[0].key}]`;
      }
    }
    spnInitialInvoice.innerHTML = initialInvoice;
    spnCurrentInvoice.innerHTML = currentInvoice;
    timer = setInterval(async () => {
      const rsltRef = await axios.get(`${uriRefd}&${startkey}`, config);
      refreshedPersonsCount = rsltRef.data.rows.length > 0 ? rsltRef.data.rows[0].value : 0;
      pct = refreshedPersonsCount / allPersonsCount;
      CLG(`URL : ${uriRefd}&${startkey} Rows : ${rsltRef.data.rows.length}  Total : ${allPersonsCount}  Current ${refreshedPersonsCount}   Progress :: ${pct}`);
      progressBar.animate(pct);

      const rsltCurrInv = await axios.get(`${uriLastInv}`, config);
      CDR(rsltCurrInv);
      if (rsltCurrInv && rsltCurrInv.data && rsltCurrInv.data.rows && rsltCurrInv.data.rows.length > 0) {
        if (rsltCurrInv.data.rows[0].value) {
          currentInvoice = `001-001-${rsltCurrInv.data.rows[0].value} [de la fecha: ${rsltCurrInv.data.rows[0].key}]`;
        }
      }
      spnCurrentInvoice.innerHTML = currentInvoice;
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
  clearInterval(timer)
  if (progressBar) progressBar.destroy();
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
    if (progressBar) progressBar.destroy();
  } catch (err) {
    CLG(`Error while destroying unwanted progress bar.`);
  }
}
