function changeVisibility() {
  var all = document.getElementsByTagName('tr');
  for (let ix = 1; ix < all.length; ix += 1) {
    const { id } = all[ix];
    if (id) {
      document.getElementById(id).classList.remove('showMe');
      document.getElementById(id).classList.add('hideMe');
    }
  }

  /* eslint-disable no-bitwise */
  let hider = 0;
  hider |= document.getElementById('denegados').checked && 1;
  hider |= document.getElementById('autorizados').checked && 2;
  hider |= document.getElementById('rechazados').checked && 4;
  hider |= document.getElementById('aceptados').checked && 8;
  hider |= document.getElementById('firmados').checked && 16;
  hider |= document.getElementById('anulados').checked && 32;
  /* eslint-enable no-bitwise */

  var invoices = document.getElementsByClassName('invoiceRow');
  for (let ix = 0; ix < invoices.length; ix += 1) {
    // if (hider ===0 || hider & invoices[ix].attributes.name.value) {
    if (hider & invoices[ix].attributes.name.value) {
      invoices[ix].classList.remove('hideMe');
      invoices[ix].classList.add('showMe');
    }
    if (hider === 0 && invoices[ix].attributes.name.value === "0") {
      invoices[ix].classList.remove('hideMe');
      invoices[ix].classList.add('showMe');
    }
  }
}
