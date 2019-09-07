/* eslint-disable max-len, no-unused-vars,prefer-const */
import parser from 'fast-xml-parser';

import { logger as LG } from '.';

const CLG = console.log; // eslint-disable-line no-console, no-unused-vars
const CDR = console.dir; // eslint-disable-line no-console, no-unused-vars

const env = 'soap:Envelope';
const body = 'soap:Body';
const valida = 'ns2:validarComprobanteResponse';

let response = {};

let flag = 'rejected';
let reason = '';
let msg = {};
const extractUploadStatus = (xml) => {
  const jsonObj = parser.parse(xml);
  // const jsonObj = parser.parse(xmlProcesamiento);
  try {
    response = jsonObj[env][body][valida].RespuestaRecepcionComprobante;
    // CDR(response);
    switch ({ ...response }.estado) {
      case 'RECIBIDA':
        flag = 'accepted';
        reason = '';
        break;
      case 'DEVUELTA':
        flag = 'returned';
        try {
          msg = { ...response.comprobantes.comprobante.mensajes }.mensaje;
          reason = {
            code: msg.identificador,
            name: msg.mensaje,
            type: msg.tipo || 'null',
            info: msg.informacionAdicional || 'none',
          };
        } catch (err) {
          CLG(err);
        }
        break;
      default:
        throw new Error(`Unknown SRI status type '${{ ...response }.estado}'`);
    }
  } catch (e) {
    CDR(e);
  }

  return { flag, reason, attachment: response };
};

export default extractUploadStatus;
