import parser from 'fast-xml-parser';
// import { DOMParser } from 'xmldom';

import { logger as LG } from '.';

const CLG = console.log; // eslint-disable-line no-console, no-unused-vars
const CDR = console.dir; // eslint-disable-line no-console, no-unused-vars

const ENV = 'soap:Envelope';
const BODY = 'soap:Body';
const RESP = 'ns2:autorizacionComprobanteResponse';

const rtrn = { authorizationStatus: 'Invalid Xml' };

const extractAuthStatus = (xmlData) => {
  // CLG('extractAuthStatus');
  let body = null;
  let response = null;
  let auth = null;
  let status = null;
  try {
    const jsonObj = parser.parse(xmlData);

    if (jsonObj[ENV]) {
      body = jsonObj[ENV][BODY];
      response = body[RESP].RespuestaAutorizacionComprobante;
      auth = response.autorizaciones.autorizacion;
      status = auth.estado;
      rtrn.authorizationStatus = status;
      if (status === 'AUTORIZADO') {
        rtrn.authorized = auth.fechaAutorizacion;
        delete rtrn.failed;
      } else {
        rtrn.failed = auth.mensajes.mensaje;
        delete rtrn.authorized;
      }
      // const msg = response.autorizaciones.autorizacion.mensajes.mensaje;
      // CDR(msg);
    }
  } catch (err) {
    LG.error(`Error while reading XML reply ${err}`);
  }
  return rtrn;
};


export default extractAuthStatus;
