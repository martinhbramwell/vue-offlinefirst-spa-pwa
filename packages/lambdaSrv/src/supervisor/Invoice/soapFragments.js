const ambiente = process.env.AMBIENTE;

const PRUEBA = 'celcer';
const PRODUCCION = 'cel';

const service = ambiente === '2' ? PRODUCCION : PRUEBA;

export const urlUpload = `https://${service}.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline`;

export const soapUploadStart = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:validarComprobante>
      <xml>`;

export const soapUploadEnd = `</xml>
    </ec:validarComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
export const soapUploadReceived = 'RECIBIDA';
export const soapUploadRegistered = 'CLAVE ACCESO REGISTRADA';

/*
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:validarComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.recepcion">
      <RespuestaRecepcionComprobante>
        <estado>RECIBIDA</estado>
        <comprobantes/>
      </RespuestaRecepcionComprobante>
    </ns2:validarComprobanteResponse>
  </soap:Body>
</soap:Envelope>
*/


export const urlQuery = `https://${service}.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline`;
export const soapQueryStart = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:autorizacionComprobante>
      <claveAccesoComprobante>`;

export const soapQueryEnd = `</claveAccesoComprobante>
    </ec:autorizacionComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;

export const hdrType = 'Content-Type:text/xml;charset=UTF-8';
export const hdrAction = 'SOAPAction';
export const headers = { hdrType, hdrAction };

export const soapQueryAuthorized = 'AUTORIZADO';
