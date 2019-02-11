function changeVisibility() {
  var all = document.getElementsByTagName('tr');
  for (let ix = 1; ix < all.length; ix += 1) {
    document.getElementById(all[ix].id).classList.remove('showMe');
    document.getElementById(all[ix].id).classList.add('hideMe');
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

  var shown = document.getElementsByName(hider);
  for (let ix = 0; ix < shown.length; ix += 1) {
    document.getElementById(shown[ix].id).classList.remove('hideMe');
    document.getElementById(shown[ix].id).classList.add('showMe');
  }
}
