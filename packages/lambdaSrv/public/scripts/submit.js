function submit() {
  var held = document.getElementsByName('Hold');
  var anulled = document.getElementsByName('Void');
  var acc = {};
  for (var ix = 0; ix < held.length; ix += 1) {
    acc[held[ix].id] = { H: held[ix].checked, V: anulled[ix].checked };
  }
  var data = document.getElementsByName('data');
  data[0].value = JSON.stringify(acc);

  document.gestionDeFacturas.submit();
  CLG('Sent');
}
