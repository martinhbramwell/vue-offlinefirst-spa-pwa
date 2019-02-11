function validateThenSubmit() {
  /* eslint-disable no-undef */
  alertify.defaults.glossary.title = 'Logichem';
  alertify.defaults.notifier.closeButton = true;
  /* eslint-enable no-undef */

  var rows = document.getElementsByTagName('tr');
  var last = 0;
  var fails = [];
  var wins = [];
  var voids = [];
  for (var ix = rows.length - 1; ix > 0; ix -= 1) {
    const { id } = rows[ix];
    const prp = document.getElementById(`Prp_${rows[ix].id}`).attributes.name.value;
    const anu = document.getElementById(`Anu_${rows[ix].id}`).attributes.name.value;
    const hld = document.getElementById(`h${rows[ix].id}`).checked;
    const elemVoid = document.getElementById(`v${rows[ix].id}`);
    const voided = elemVoid && elemVoid.checked;
    if (voided) voids.push(id);
    CLG(`
      Last: ${last}
      Id: ${id}
      Status: ${prp}
      State: ${anu}
      Held: ${hld}
    `);
    if (prp === 'processed') {
      last = id;
      continue; // eslint-disable-line no-continue
    } else if (anu === 'void') {
      continue; // eslint-disable-line no-continue
    } else if (hld) {
      fails.push(id);
    } else {
      wins.push(id);
    }
  }

  CDR(fails);
  CDR(wins);
  if ((wins[0] > last + 1) && (fails[0] < wins[wins.length - 1])) {
    /* eslint-disable no-undef */
    alertify.defaults.glossary.ok = 'Entendido';
    alertify.alert(`
      <h4>Hay Que Procesar Las Facturas En Orden Numerico</h4>
      <div>  Se ha saltado las facturas ::</div>
      <div>${fails.filter(elem => elem < wins[wins.length - 1])}</div>
    `);
    return;
    /* eslint-enable no-undef */
  }

  if (voids.length > 0) {
  /* eslint-disable no-undef */
    alertify.defaults.glossary.ok = 'Si. Es corecto. Adelante.';
    alertify.defaults.glossary.cancel = 'No sigues. Me jalé!';
    let msg = '';
    if (voids.length > 1) {
      msg = `
        <h4>Se va a anular unas facturas de manera <i>irreversible</i>.</h4>
        <div>  Realmente desea anular las facturas ::</div>
        <div>${voids.toString()}</div>
      `;
    } else {
      msg = `
        <h4>Se va a anular una factura de manera <i>irreversible</i>.</h4>
        <div>  Realmente desea anular la factura :: ${voids[0]}</div>
      `;
    }
    alertify.confirm(
      msg,
      () => {
        CLG('WILL DO');
        submit();
      },
      () => {
        CLG('WILL QUIT');
      },
    ).set('defaultFocus', 'cancel');
    /* eslint-enable no-undef */
  } else {
    submit();
  }
}
