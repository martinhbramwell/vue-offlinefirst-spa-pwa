const setCookie = (cname, cvalue, exMinutes) => {
  const d = new Date();
  d.setTime(d.getTime() + (exMinutes*60*1000));
  const expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const getCookie = (cname) => {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let ix = 0; ix < ca.length; ix += 1) {
    let c = ca[ix];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return;
}
