async function authenticate() {
  // CLG('  ***  DISABLED  ***');
  // let ret = '';
  let creds = null;
  try {
    var cookie = getCookie('creds');
    if (cookie == null) {
      CLG('Authorization expired');
      const couchUid = document.getElementById("couchUid");
      const couchPwd = document.getElementById("couchPwd");
      if (couchUid.value.length < 1 || couchPwd.value.length < 1) {
        alertify.alert(`
          <h4>Hay que ingresar nombre de usuario y clave</h4>
        `);
        return false;
      }

      creds = { username: couchUid.value, password: couchPwd.value };
      const config = { auth: creds };

      try {
        const uriAll = `${envServerURL}/${envDbName}/`;
        CLG(`URL: '${uriAll}' '${JSON.stringify(config)}'`);
        rsltAll = await axios.get(`${uriAll}`, config);
        CDR(rsltAll);
        setCookie('creds', JSON.stringify(creds), 60)
      } catch (err) {
        // CDR(err);
        const msg = err.response.status === 401 ? 'Usuario o contraseña inválida.' : err;
        alertify.alert(`
          <h3>El intento de conexión a la base de datos falló.</h3>
          <p>${msg}</p>
        `);
        return false;
      }

    } else {
      setCookie('creds', cookie, 0.1)
      creds = JSON.parse(cookie);
      CLG(`Got cookie: '${creds.username}: ${creds.password}'`);
    }
    couchUid.value = null;
    couchPwd.value = null;
    // const host = window.location.origin;
    // CLG(`Fetching from ${host}/authenticate with ${body.u} ${body.p}`);
    // const response = await axios.post(`${host}/authenticate`, body);
    // CDR(response);
    // const jsonResponse = await response.json(); // extract JSON from the http response
    // CLG(jsonResponse);
    // ret = jsonResponse;
  } catch (err) {
    CLG(`Cypress error ${err}`);
    return null;
    // ret = { failure: `${err}` };
  }
  return creds;
}
