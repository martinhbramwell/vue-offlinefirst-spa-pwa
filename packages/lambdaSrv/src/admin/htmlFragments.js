const frags = {
  documentHead: `
<head>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/alertify.min.js"></script>
  <script src="../scripts/progressbar.min.js"></script>
  <script src="../scripts/cookies.js"></script>
  <script src="../scripts/authenticate.js"></script>
  <script src="../scripts/refresh.js"></script>
  <script src="../scripts/changeVisibility.js"></script>
  <script src="../scripts/cypressInvoices.js"></script>
  <script src="../scripts/submit.js"></script>
  <script src="../scripts/validateThenSubmit.js"></script>
  <script src="../scripts/firmar.js"></script>
  <script src="../scripts/enviar.js"></script>
  <script src="../scripts/verificar.js"></script>
  <script src="../scripts/parms.js"></script>


  <link rel="stylesheet" href="../styles/style.css"/>
  <link rel="stylesheet" href="../styles/modal.css"/>
  <link rel="stylesheet" href="../styles/progress.css"/>
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/css/alertify.min.css"/>
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.11.2/build/css/themes/default.min.css"/>
  <link rel="icon" type="image/png" href="../images/favicon.ico" />
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
  <script>
    const CLG = console.log;
    const CLE = console.err;
    const CDR = console.dir;
  </script>
</head>
 `,

  tableColumnHeader: `
<tr>
  <th>Secuencial</th>
  <th>Sec BAPU</th>
  <th><i class="fas fa-hand-paper"/></th>
  <th><i class="fas fa-ban"/></th>
  <th>Prp</th>
  <th>Frm</th>
  <th>Env</th>
  <th>Aut</th>
  <th>Fecha</th>
  <th>Nombre</th>
  <th>Documento</th>
  <th>Email</th>
  <th>Telef #1</th>
  <th>Direccion</th>
</tr>
`,

  topSection: `
<div class="border d-table w-100">
  <p class="d-table-cell">
    <button class="button" type="button" onclick="refresh()">Refrescar</button>
  </p>
  <div class="d-table-cell tar">
    <p>
      Raspado de datos de BAPU :: &nbsp;
      <button id="btnOpenBapuModal" class="button" type="button">Iniciar</button>
    </p>
  </div>
</div>
`,

  authentication: `
  Usuario: <input id="couchUid" type="text" name="uid" value=""/>&nbsp;
  Clave: <input id="couchPwd" type="password" name="pwd" value="" />
`,

  hiddenFields: `
  <input type="hidden" name="action" />
  <input type="hidden" name="data" /><br><br>
`,

  taskButtons: `
  <button class="button" type="button" onclick="firmar()">Firmar Facturas</button>
  <button class="button" type="button" onclick="enviar()">Enviar Facturas</button>
  <button class="button" type="button" onclick="verificar()">Verificar Facturas</button>
`,

  filterFields: `
  &nbsp; &nbsp; <span class="spanBox">
  Anulados: <input id="anulados" onChange="changeVisibility()" type="checkbox" name="Anu">
  Firmados: <input id="firmados" onChange="changeVisibility()" type="checkbox" name="Frm">
  Aceptados: <input id="aceptados" onChange="changeVisibility()" type="checkbox" name="Acp">
  Rechazados: <input id="rechazados" onChange="changeVisibility()" type="checkbox" name="Rch">
  Autorizados: <input id="autorizados" onChange="changeVisibility()" type="checkbox" name="Aut">
  Denegados: <input id="denegados" onChange="changeVisibility()" type="checkbox" name="Aut">
  </span><br />
`,

  modalBapuScraper: `
  <!-- script>
    let elemCouchUid = document.getElementById("couchUid");
    elemCouchUid.value = getCookie('uid');

    let elemCouchPwd = document.getElementById("couchPwd");
    elemCouchPwd.value = getCookie('pwd');
  </script -->

  <script src="../scripts/progress.js"></script>
  <div id="bapuModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <span class="closeModal">&times;</span>
        <h2>Recuperación de datos de BAPU</h2>
      </div>
      <div class="modal-body">
        <p>Avance de extracción de Clientes : </p>
        <div id="extractPersons"></div>
        <br />
        <br />
        <p>Avance de extracción de Facturas: </p>
        <p>
          <table>
            <tr>
              <td class='alnright'>Última factura antes extracción :: <span id="spnInitialInvoice">001-002-10604</span></td>
            </tr>
            <tr>
              <td class='alnright'>Última factura ahora :: <span id="spnCurrentInvoice">001-002-10604</span></td>
            </tr>
          </table>
        </p>
      </div>
      <!-- div class="modal-footer">
        <h3>Modal Footer</h3>
      </div -->
    </div>
  </div>
  <script src="../scripts/modal.js"></script>
`,

  another: `
  asdf`,
};
export default frags;
