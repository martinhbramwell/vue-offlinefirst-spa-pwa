/* eslint-disable no-unused-vars */
// import fontkit from 'fontkit';

import { databaseLocal as db } from './database';
import pdfgen from './digitalDocuments/pdf';
import fontdims from './digitalDocuments/pdf/fontdims';
import srixml from './utils/srixml';

import { fechaShort as shortDate } from './utils'; // eslint-disable-line no-unused-vars


/* eslint-disable no-unused-vars */
const CLG = console.log; // eslint-disable-line no-console
const CDR = console.dir; // eslint-disable-line no-console

const tstPDFGEN = 'pdfgen';
const tstSRIXML = 'srixml';
const tstFNTDIM = 'fontdims';
// const test = null;
const test = tstPDFGEN;
// const test = tstSRIXML;
// const test = tstFNTDIM;

const qtst = async () => {
  try {
    let invoice = null;
    let xmlBad = null;
    let xmlGood = null;
    let font = null;
    let msg = null;
    let pdfPath = null;
    let fechaShort = null;
    let clienteTrimmed = null;
    let mailDir = '';
    let mailFile = null;
    switch (test) {
      case tstPDFGEN:
        CLG('**** Testing PDF invoice generator ****');
        invoice = await db.get('Invoice_1_0000000000005203');

        // fechaShort = shortDate(invoice.data.fecha);
        // clienteTrimmed = invoice.data.nombreCliente.replace(/ /g, '_');
        mailDir += `${process.env.MAIL_DIR}`;
        mailDir += `/${invoice.data.nombreCliente.replace(/ /g, '_')}`;
        mailDir += `/${shortDate(invoice.data.fecha)}`;

        mailFile = `${fechaShort}_${invoice.data.sequential}`;

        pdfPath = await pdfgen(invoice, { mailDir, mailFile });
        CLG('pdfPath');
        CDR(pdfPath);
        CLG('-----------------------');
        break;
      case tstFNTDIM:
        CLG('**** Testing font dimensions analyzer ****');

        font = './public/fonts/SourceSansPro-Regular.ttf';

        msg = 'iW';
        CLG(`Width of ${msg} : ${fontdims(font, msg)}`);
        msg = 'iiiii';
        CLG(`Width of ${msg} : ${fontdims(font, msg)}`);
        msg = 'WWWWWWWWWW';
        CLG(`Width of ${msg} : ${fontdims(font, msg)}`);
        // fontdims(font, 'iiiii');
        // fontdims(font, 'iiiiiiiiii');
        // fontdims(font, 'WWWWW');
        // fontdims(font, 'WWWWWWWWWW');
        break;
      case tstSRIXML:
        /* eslint-disable max-len */
        CLG('**** Testing SRI XML parser ****');

        xmlBad = `
          <?xml version="1.0"?>
          <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
              <ns2:autorizacionComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.autorizacion">
              <RespuestaAutorizacionComprobante>
                  <claveAccesoConsultada>0307201901179217775800110010020000000281234567811</claveAccesoConsultada>
                  <numeroComprobantes>1</numeroComprobantes>
                  <autorizaciones>
                      <autorizacion>
                          <estado>NO AUTORIZADO</estado>
                          <fechaAutorizacion>2019-07-15T11:04:34-05:00</fechaAutorizacion>
                          <ambiente>PRUEBAS</ambiente>
                          <comprobante>&lt;?xml version="1.0" encoding="UTF-8"?&gt;\n&lt;factura id="comprobante" version="1.0.0"&gt;\n    &lt;infoTributaria&gt;\n        &lt;ambiente&gt;1&lt;/ambiente&gt;\n        &lt;tipoEmision&gt;1&lt;/tipoEmision&gt;\n        &lt;razonSocial&gt;LOGICHEM SOLUTIONS SOCIEDAD ANONIMA&lt;/razonSocial&gt;\n        &lt;nombreComercial&gt;LOGICHEM SOLUTIONS&lt;/nombreComercial&gt;\n        &lt;ruc&gt;1792177758001&lt;/ruc&gt;\n        &lt;claveAcceso&gt;0307201901179217775800110010020000000281234567811&lt;/claveAcceso&gt;\n        &lt;codDoc&gt;01&lt;/codDoc&gt;\n        &lt;estab&gt;001&lt;/estab&gt;\n        &lt;ptoEmi&gt;002&lt;/ptoEmi&gt;\n        &lt;secuencial&gt;000000028&lt;/secuencial&gt;\n        &lt;dirMatriz&gt;PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMINA&lt;/dirMatriz&gt;\n    &lt;/infoTributaria&gt;\n    &lt;infoFactura&gt;\n        &lt;fechaEmision&gt;03/07/2019&lt;/fechaEmision&gt;\n        &lt;dirEstablecimiento&gt;PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMINA&lt;/dirEstablecimiento&gt;\n        &lt;obligadoContabilidad&gt;SI&lt;/obligadoContabilidad&gt;\n        &lt;tipoIdentificacionComprador&gt;04&lt;/tipoIdentificacionComprador&gt;\n        &lt;razonSocialComprador&gt;GODDARD CATERING GROUP QUITO S.A&lt;/razonSocialComprador&gt;\n        &lt;identificacionComprador&gt;1790011860001&lt;/identificacionComprador&gt;\n        &lt;direccionComprador&gt;Aeropuerto Mariscal Sucre - Tababela, Edificio Catering N1&lt;/direccionComprador&gt;\n        &lt;totalSinImpuestos&gt;255.00&lt;/totalSinImpuestos&gt;\n        &lt;totalDescuento&gt;45&lt;/totalDescuento&gt;\n        &lt;totalConImpuestos&gt;\n            &lt;totalImpuesto&gt;\n                &lt;codigo&gt;2&lt;/codigo&gt;\n                &lt;codigoPorcentaje&gt;2&lt;/codigoPorcentaje&gt;\n                &lt;baseImponible&gt;255.00&lt;/baseImponible&gt;\n                &lt;tarifa&gt;12&lt;/tarifa&gt;\n                &lt;valor&gt;30.6&lt;/valor&gt;\n            &lt;/totalImpuesto&gt;\n        &lt;/totalConImpuestos&gt;\n        &lt;propina&gt;0.00&lt;/propina&gt;\n        &lt;importeTotal&gt;285.60&lt;/importeTotal&gt;\n        &lt;moneda&gt;DOLAR&lt;/moneda&gt;\n        &lt;pagos&gt;\n            &lt;pago&gt;\n                &lt;formaPago&gt;01&lt;/formaPago&gt;\n                &lt;total&gt;285.60&lt;/total&gt;\n            &lt;/pago&gt;\n        &lt;/pagos&gt;\n    &lt;/infoFactura&gt;\n    &lt;detalles&gt;\n        &lt;detalle&gt;\n            &lt;codigoPrincipal&gt;0&lt;/codigoPrincipal&gt;\n            &lt;descripcion&gt;MATRIXCLEAN 1 CANECA (5 GALS.)&lt;/descripcion&gt;\n            &lt;cantidad&gt;2&lt;/cantidad&gt;\n            &lt;precioUnitario&gt;127.50&lt;/precioUnitario&gt;\n            &lt;descuento&gt;0.00&lt;/descuento&gt;\n            &lt;precioTotalSinImpuesto&gt;255.00&lt;/precioTotalSinImpuesto&gt;\n            &lt;impuestos&gt;\n                &lt;impuesto&gt;\n                    &lt;codigo&gt;2&lt;/codigo&gt;\n                    &lt;codigoPorcentaje&gt;2&lt;/codigoPorcentaje&gt;\n                    &lt;tarifa&gt;12&lt;/tarifa&gt;\n                    &lt;baseImponible&gt;255.00&lt;/baseImponible&gt;\n                    &lt;valor&gt;30.60&lt;/valor&gt;\n                &lt;/impuesto&gt;\n            &lt;/impuestos&gt;\n        &lt;/detalle&gt;\n    &lt;/detalles&gt;\n    &lt;infoAdicional&gt;\n        &lt;campoAdicional nombre="Direcci&#xFFFD;n"&gt;Aeropuerto Mariscal Sucre - Tababela, Edificio Catering N1&lt;/campoAdicional&gt;\n        &lt;campoAdicional nombre="Tel&#xFFFD;fono"&gt;3945820&lt;/campoAdicional&gt;\n        &lt;campoAdicional nombre="Email"&gt;XXXXX@gmail.com&lt;/campoAdicional&gt;\n    &lt;/infoAdicional&gt;\n&lt;ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Signature395599"&gt;\n&lt;ds:SignedInfo Id="Signature-SignedInfo329106"&gt;\n&lt;ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"&gt;&lt;/ds:CanonicalizationMethod&gt;\n&lt;ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"&gt;&lt;/ds:SignatureMethod&gt;\n&lt;ds:Reference Id="SignedPropertiesID774708" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature395599-SignedProperties728714"&gt;\n&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;\n&lt;ds:DigestValue&gt;Q6KSrhBJHAXN2IuIDAN5STPXB4M=&lt;/ds:DigestValue&gt;\n&lt;/ds:Reference&gt;\n&lt;ds:Reference URI="#Certificate580002"&gt;\n&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;\n&lt;ds:DigestValue&gt;7skauPZATRqQW9Z3ueR6nzqaZaA=&lt;/ds:DigestValue&gt;\n&lt;/ds:Reference&gt;\n&lt;ds:Reference Id="Reference-ID-223268" URI="#comprobante"&gt;\n&lt;ds:Transforms&gt;\n&lt;ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"&gt;&lt;/ds:Transform&gt;\n&lt;/ds:Transforms&gt;\n&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;\n&lt;ds:DigestValue&gt;8PotuVw3aIRS+WbxjFYxDNAdNmQ=&lt;/ds:DigestValue&gt;\n&lt;/ds:Reference&gt;\n&lt;/ds:SignedInfo&gt;\n&lt;ds:SignatureValue Id="SignatureValue616000"&gt;\nrbDUoxbCpazxmqPabuTO81DXVMdLPEgDWbQRXuAtYwn+OR3ZJvRgVIj2G1aiOFv6ini1dyigijdd\n55LVRWTaEZWVvnE0U66kq2PMZRNDxSWHhGE6z+65hAodjci2SCI7KWYttSOqJZL999jHEy9dLOQ/\nQGrzZdWfDWqjcZ7hZtQRhxOvF/1LNIqjlROQirwLHIa3jJoiCTzhBRTU4J+JbW82C/GOxkIWKv1w\n6AIeE6zbxjj0pQKg/gS0coKlaTwNgBrBmP5sM73IDQqQgbABmMMX+P/7xJ3G/2Ypw5XsjCV77dz3\n2JqT3wImHEAHRXVac/OxQgRfXcf68aqKgmeLUw==\n&lt;/ds:SignatureValue&gt;\n&lt;ds:KeyInfo Id="Certificate580002"&gt;\n&lt;ds:X509Data&gt;\n&lt;ds:X509Certificate&gt;\nMIIKCzCCB/OgAwIBAgIEWH+yvTANBgkqhkiG9w0BAQsFADCBoTELMAkGA1UEBhMCRUMxIjAgBgNV\nBAoTGUJBTkNPIENFTlRSQUwgREVMIEVDVUFET1IxNzA1BgNVBAsTLkVOVElEQUQgREUgQ0VSVElG\nSUNBQ0lPTiBERSBJTkZPUk1BQ0lPTi1FQ0lCQ0UxDjAMBgNVBAcTBVFVSVRPMSUwIwYDVQQDExxB\nQyBCQU5DTyBDRU5UUkFMIERFTCBFQ1VBRE9SMB4XDTE4MDEwOTE2MDE1NVoXDTIwMDEwOTE2MzE1\nNVowgbIxCzAJBgNVBAYTAkVDMSIwIAYDVQQKExlCQU5DTyBDRU5UUkFMIERFTCBFQ1VBRE9SMTcw\nNQYDVQQLEy5FTlRJREFEIERFIENFUlRJRklDQUNJT04gREUgSU5GT1JNQUNJT04tRUNJQkNFMQ4w\nDAYDVQQHEwVRVUlUTzE2MBEGA1UEBRMKMDAwMDI0ODcwODAhBgNVBAMTGkRBTklFTCBMRU9OQVJE\nIFdJTEQgU1RBUEVMMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv4YPhsy97m9WQ95t\nKtRqYQej/OGyjo2ca8hrfMRx0KG3rpUhHvc0Hh9FvKdH8U4ho1uEWESXRH0gC5/qHPXlktbVdijW\nWAFuKWGu5bOjjHOoBKv3Q3A5iuZjqTgMY/1/X7d81INR/iHZ1bQsjOUD5vaznT7sau+A1+k2j6CX\nHEgsqRDrmEy+ZvHcr6i3dZVLhXX9Q3nTE8hpwo1m5goNIiBIFHxiO7cfCZhtnVHmqgy7bmgj1Bqm\n0BPpAycV2UvOYM3YmiHqTDKug8xXVCbQ0/B+JSRWYxy3DQko/XRJeH9p9mtcVEHSGRAe8Vt1smfj\nCijnP2u0LxZDHKIG6VZdQQIDAQABo4IFNjCCBTIwCwYDVR0PBAQDAgeAMGcGA1UdIARgMF4wXAYL\nKwYBBAGCqDsCAgEwTTBLBggrBgEFBQcCARY/aHR0cDovL3d3dy5lY2kuYmNlLmVjL3BvbGl0aWNh\nLWNlcnRpZmljYWRvL3BlcnNvbmEtanVyaWRpY2EucGRmMIGRBggrBgEFBQcBAQSBhDCBgTA+Bggr\nBgEFBQcwAYYyaHR0cDovL29jc3AuZWNpLmJjZS5lYy9lamJjYS9wdWJsaWN3ZWIvc3RhdHVzL29j\nc3AwPwYIKwYBBQUHMAGGM2h0dHA6Ly9vY3NwMS5lY2kuYmNlLmVjL2VqYmNhL3B1YmxpY3dlYi9z\ndGF0dXMvb2NzcDAzBgorBgEEAYKoOwMKBCUTI0xPR0lDSEVNIFNPTFVUSU9OUyBTT0NJRURBRCBB\nTk9OSU1BMB0GCisGAQQBgqg7AwsEDxMNMTc5MjE3Nzc1ODAwMTAaBgorBgEEAYKoOwMBBAwTCjE3\nMDk0NzAxNzEwHgYKKwYBBAGCqDsDAgQQEw5EQU5JRUwgTEVPTkFSRDAUBgorBgEEAYKoOwMDBAYT\nBFdJTEQwFgYKKwYBBAGCqDsDBAQIEwZTVEFQRUwwLgYKKwYBBAGCqDsDBQQgEx5QUkVTSURFTlRF\nIFJFUFJFU0VOVEFOVEUgTEVHQUwwNAYKKwYBBAGCqDsDBwQmEyRLTSAxMSAxMiBDVU1CQVlBIEFW\nIElOVEVST0NFQU5JQ0EgU04wGQYKKwYBBAGCqDsDCAQLEwkwMjYwMjI3NDIwFQYKKwYBBAGCqDsD\nCQQHEwVRdWl0bzAXBgorBgEEAYKoOwMMBAkTB0VDVUFET1IwIAYKKwYBBAGCqDsDMwQSExBTT0ZU\nV0FSRS1BUkNISVZPMB8GA1UdEQQYMBaBFGxvZ2ljaGVtZWNAZ21haWwuY29tMIIB3wYDVR0fBIIB\n1jCCAdIwggHOoIIByqCCAcaGgdVsZGFwOi8vYmNlcWxkYXBzdWJwMS5iY2UuZWMvY249Q1JMNDk4\nLGNuPUFDJTIwQkFOQ08lMjBDRU5UUkFMJTIwREVMJTIwRUNVQURPUixsPVFVSVRPLG91PUVOVElE\nQUQlMjBERSUyMENFUlRJRklDQUNJT04lMjBERSUyMElORk9STUFDSU9OLUVDSUJDRSxvPUJBTkNP\nJTIwQ0VOVFJBTCUyMERFTCUyMEVDVUFET1IsYz1FQz9jZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0\nP2Jhc2WGNGh0dHA6Ly93d3cuZWNpLmJjZS5lYy9DUkwvZWNpX2JjZV9lY19jcmxmaWxlY29tYi5j\ncmykgbUwgbIxCzAJBgNVBAYTAkVDMSIwIAYDVQQKExlCQU5DTyBDRU5UUkFMIERFTCBFQ1VBRE9S\nMTcwNQYDVQQLEy5FTlRJREFEIERFIENFUlRJRklDQUNJT04gREUgSU5GT1JNQUNJT04tRUNJQkNF\nMQ4wDAYDVQQHEwVRVUlUTzElMCMGA1UEAxMcQUMgQkFOQ08gQ0VOVFJBTCBERUwgRUNVQURPUjEP\nMA0GA1UEAxMGQ1JMNDk4MCsGA1UdEAQkMCKADzIwMTgwMTA5MTYwMTU1WoEPMjAyMDAxMDkxNjMx\nNTVaMB8GA1UdIwQYMBaAFBj58PvmMhyZZjkqyouyaX1JJ7/OMB0GA1UdDgQWBBQrEHrmRobrNWs7\nJ8aPmAH5mwYglDAJBgNVHRMEAjAAMBkGCSqGSIb2fQdBAAQMMAobBFY4LjEDAgSwMA0GCSqGSIb3\nDQEBCwUAA4ICAQBLwF5yq0jsLJCOklR7ujOguSSmuNLGSlEq4TH50FDEyLvmq5n0CfyMzITiHy0R\nnsLd20UFFOynp5kCZK9sxiEDfSR1SRV9XxPuELdKS7rMu9N+rGs3Kddu/TcS7VBzXayhNNQgs59U\njiovRoFiaihicTSGTEagLhmYZRbU1OjW6H8Xc6H0nX4VsEI46WtL4wSH2AQrFZiLiRDetqe7fUwP\nHOdJNdmVQrArPHKq1fPVD+TiUYNQJ9FzRk7QJFreB59WAEct5hmnPK5R8qvwr0eajXOEYHfQ79Ud\nRREMsnBKwwanC+RO4IJ8/LulDsy43IZvfRRn7rJnWc5hY1rspaShkPhcvUpdF6PKIt7g0MS5fDoy\nC0MhDCjz3kXpN47+db8ZOGoScnmxGMj417elLyU4NMl9slWcxr5qtqTQ0iDesadVjxKiXM9d52Mj\nH0QWtd+5ieUnNGpUZNkIUw3djJowVBurO+6VzObTcAkr0wyQxGMXbo3g0EX2fJWKM5y4e1EF+DvT\n1O2suonDrG6DFPdP7nDeSMqyOrAHBSy/3h7RtEilvEqoUsv1lvrFT3DIVo3u9FyIrkfb4LEQAS2X\nR6UemJ26n9CSGlw7ynTbxz9FY+1MiX4I4fCVyNJB+DEvkNsgmIsXDpFzM8cQDw9BZefd6f+eusEg\niB8nhzJM1lCJ2A==\n&lt;/ds:X509Certificate&gt;\n&lt;/ds:X509Data&gt;\n&lt;ds:KeyValue&gt;\n&lt;ds:RSAKeyValue&gt;\n&lt;ds:Modulus&gt;\nv4YPhsy97m9WQ95tKtRqYQej/OGyjo2ca8hrfMRx0KG3rpUhHvc0Hh9FvKdH8U4ho1uEWESXRH0g\nC5/qHPXlktbVdijWWAFuKWGu5bOjjHOoBKv3Q3A5iuZjqTgMY/1/X7d81INR/iHZ1bQsjOUD5vaz\nnT7sau+A1+k2j6CXHEgsqRDrmEy+ZvHcr6i3dZVLhXX9Q3nTE8hpwo1m5goNIiBIFHxiO7cfCZht\nnVHmqgy7bmgj1Bqm0BPpAycV2UvOYM3YmiHqTDKug8xXVCbQ0/B+JSRWYxy3DQko/XRJeH9p9mtc\nVEHSGRAe8Vt1smfjCijnP2u0LxZDHKIG6VZdQQ==\n&lt;/ds:Modulus&gt;\n&lt;ds:Exponent&gt;AQAB&lt;/ds:Exponent&gt;\n&lt;/ds:RSAKeyValue&gt;\n&lt;/ds:KeyValue&gt;\n&lt;/ds:KeyInfo&gt;\n&lt;ds:Object Id="Signature395599-Object332511"&gt;&lt;etsi:QualifyingProperties Target="#Signature395599"&gt;&lt;etsi:SignedProperties Id="Signature395599-SignedProperties728714"&gt;&lt;etsi:SignedSignatureProperties&gt;&lt;etsi:SigningTime&gt;2019-07-15 16:04:05+00:00&lt;/etsi:SigningTime&gt;&lt;etsi:SigningCertificate&gt;&lt;etsi:Cert&gt;&lt;etsi:CertDigest&gt;&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;&lt;ds:DigestValue&gt;5HvcXriTMN+6w2dmBqUpq51Cj8M=&lt;/ds:DigestValue&gt;&lt;/etsi:CertDigest&gt;&lt;etsi:IssuerSerial&gt;&lt;ds:X509IssuerName&gt;CN=AC BANCO CENTRAL DEL ECUADOR,L=QUITO,OU=ENTIDAD DE CERTIFICACION DE INFORMACION-ECIBCE,O=BANCO CENTRAL DEL ECUADOR,C=EC&lt;/ds:X509IssuerName&gt;&lt;ds:X509SerialNumber&gt;1484763837&lt;/ds:X509SerialNumber&gt;&lt;/etsi:IssuerSerial&gt;&lt;/etsi:Cert&gt;&lt;/etsi:SigningCertificate&gt;&lt;/etsi:SignedSignatureProperties&gt;&lt;etsi:SignedDataObjectProperties&gt;&lt;etsi:DataObjectFormat ObjectReference="#Reference-ID-223268"&gt;&lt;etsi:Description&gt;contenido comprobante&lt;/etsi:Description&gt;&lt;etsi:MimeType&gt;text/xml&lt;/etsi:MimeType&gt;&lt;/etsi:DataObjectFormat&gt;&lt;/etsi:SignedDataObjectProperties&gt;&lt;/etsi:SignedProperties&gt;&lt;/etsi:QualifyingProperties&gt;&lt;/ds:Object&gt;&lt;/ds:Signature&gt;&lt;/factura&gt;</comprobante>
                          <mensajes>
                              <mensaje>
                                  <identificador>52</identificador>
                                  <mensaje>ERROR EN DIFERENCIAS</mensaje>
                                  <informacionAdicional>\n\n--- Inventario de errores ---\n\n- Factura:\n\tEl valor del total de descuento 45.0 debe ser igual el calculado (total descuento + total descuento adicional) 0.0 + 0.0</informacionAdicional>
                                  <tipo>ERROR</tipo>
                              </mensaje>
                          </mensajes>
                      </autorizacion>
                  </autorizaciones>
              </RespuestaAutorizacionComprobante>
          </ns2:autorizacionComprobanteResponse>
          </soap:Body>
          </soap:Envelope>
        `;
        xmlGood = `
          <?xml version="1.0"?>
          <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
              <ns2:autorizacionComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.autorizacion">
              <RespuestaAutorizacionComprobante>
                  <claveAccesoConsultada>0407201901179217775800110010020000000301234567815</claveAccesoConsultada>
                  <numeroComprobantes>1</numeroComprobantes>
                  <autorizaciones>
                      <autorizacion>
                          <estado>AUTORIZADO</estado>
                          <numeroAutorizacion>0407201901179217775800110010020000000301234567815</numeroAutorizacion>
                          <fechaAutorizacion>2019-07-15T14:25:09-05:00</fechaAutorizacion>
                          <ambiente>PRUEBAS</ambiente>
                          <comprobante>&lt;?xml version="1.0" encoding="UTF-8"?&gt;\n&lt;factura id="comprobante" version="1.0.0"&gt;\n    &lt;infoTributaria&gt;\n        &lt;ambiente&gt;1&lt;/ambiente&gt;\n        &lt;tipoEmision&gt;1&lt;/tipoEmision&gt;\n        &lt;razonSocial&gt;LOGICHEM SOLUTIONS SOCIEDAD ANONIMA&lt;/razonSocial&gt;\n        &lt;nombreComercial&gt;LOGICHEM SOLUTIONS&lt;/nombreComercial&gt;\n        &lt;ruc&gt;1792177758001&lt;/ruc&gt;\n        &lt;claveAcceso&gt;0407201901179217775800110010020000000301234567815&lt;/claveAcceso&gt;\n        &lt;codDoc&gt;01&lt;/codDoc&gt;\n        &lt;estab&gt;001&lt;/estab&gt;\n        &lt;ptoEmi&gt;002&lt;/ptoEmi&gt;\n        &lt;secuencial&gt;000000030&lt;/secuencial&gt;\n        &lt;dirMatriz&gt;PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMINA&lt;/dirMatriz&gt;\n    &lt;/infoTributaria&gt;\n    &lt;infoFactura&gt;\n        &lt;fechaEmision&gt;04/07/2019&lt;/fechaEmision&gt;\n        &lt;dirEstablecimiento&gt;PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMINA&lt;/dirEstablecimiento&gt;\n        &lt;obligadoContabilidad&gt;SI&lt;/obligadoContabilidad&gt;\n        &lt;tipoIdentificacionComprador&gt;05&lt;/tipoIdentificacionComprador&gt;\n        &lt;razonSocialComprador&gt;LEONARDO PONS BORJA&lt;/razonSocialComprador&gt;\n        &lt;identificacionComprador&gt;1712161361&lt;/identificacionComprador&gt;\n        &lt;direccionComprador&gt;Urb Vista Grande Lote 34&lt;/direccionComprador&gt;\n        &lt;totalSinImpuestos&gt;12.50&lt;/totalSinImpuestos&gt;\n        &lt;totalDescuento&gt;0&lt;/totalDescuento&gt;\n        &lt;totalConImpuestos&gt;\n            &lt;totalImpuesto&gt;\n                &lt;codigo&gt;2&lt;/codigo&gt;\n                &lt;codigoPorcentaje&gt;2&lt;/codigoPorcentaje&gt;\n                &lt;baseImponible&gt;12.50&lt;/baseImponible&gt;\n                &lt;tarifa&gt;12&lt;/tarifa&gt;\n                &lt;valor&gt;1.5&lt;/valor&gt;\n            &lt;/totalImpuesto&gt;\n        &lt;/totalConImpuestos&gt;\n        &lt;propina&gt;0.00&lt;/propina&gt;\n        &lt;importeTotal&gt;14.00&lt;/importeTotal&gt;\n        &lt;moneda&gt;DOLAR&lt;/moneda&gt;\n        &lt;pagos&gt;\n            &lt;pago&gt;\n                &lt;formaPago&gt;01&lt;/formaPago&gt;\n                &lt;total&gt;14.00&lt;/total&gt;\n            &lt;/pago&gt;\n        &lt;/pagos&gt;\n    &lt;/infoFactura&gt;\n    &lt;detalles&gt;\n        &lt;detalle&gt;\n            &lt;codigoPrincipal&gt;0&lt;/codigoPrincipal&gt;\n            &lt;descripcion&gt;AGUA IRIDIUMBLUE&lt;/descripcion&gt;\n            &lt;cantidad&gt;2&lt;/cantidad&gt;\n            &lt;precioUnitario&gt;6.25&lt;/precioUnitario&gt;\n            &lt;descuento&gt;0.00&lt;/descuento&gt;\n            &lt;precioTotalSinImpuesto&gt;12.50&lt;/precioTotalSinImpuesto&gt;\n            &lt;impuestos&gt;\n                &lt;impuesto&gt;\n                    &lt;codigo&gt;2&lt;/codigo&gt;\n                    &lt;codigoPorcentaje&gt;2&lt;/codigoPorcentaje&gt;\n                    &lt;tarifa&gt;12&lt;/tarifa&gt;\n                    &lt;baseImponible&gt;12.50&lt;/baseImponible&gt;\n                    &lt;valor&gt;1.50&lt;/valor&gt;\n                &lt;/impuesto&gt;\n            &lt;/impuestos&gt;\n        &lt;/detalle&gt;\n    &lt;/detalles&gt;\n    &lt;infoAdicional&gt;\n        &lt;campoAdicional nombre="Direcci&#xFFFD;n"&gt;Urb Vista Grande Lote 34&lt;/campoAdicional&gt;\n        &lt;campoAdicional nombre="Tel&#xFFFD;fono"&gt;2050078&lt;/campoAdicional&gt;\n        &lt;campoAdicional nombre="Email"&gt;mhb.warehouseman@gmail.com&lt;/campoAdicional&gt;\n    &lt;/infoAdicional&gt;\n&lt;ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Signature759450"&gt;\n&lt;ds:SignedInfo Id="Signature-SignedInfo889543"&gt;\n&lt;ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"&gt;&lt;/ds:CanonicalizationMethod&gt;\n&lt;ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"&gt;&lt;/ds:SignatureMethod&gt;\n&lt;ds:Reference Id="SignedPropertiesID374950" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature759450-SignedProperties362490"&gt;\n&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;\n&lt;ds:DigestValue&gt;ClqCphvDn90XNS6bt98u+NRSm8Q=&lt;/ds:DigestValue&gt;\n&lt;/ds:Reference&gt;\n&lt;ds:Reference URI="#Certificate997191"&gt;\n&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;\n&lt;ds:DigestValue&gt;rkMIQgBdH+pWU+wB4Aj7M90gOK0=&lt;/ds:DigestValue&gt;\n&lt;/ds:Reference&gt;\n&lt;ds:Reference Id="Reference-ID-647686" URI="#comprobante"&gt;\n&lt;ds:Transforms&gt;\n&lt;ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"&gt;&lt;/ds:Transform&gt;\n&lt;/ds:Transforms&gt;\n&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;\n&lt;ds:DigestValue&gt;iQ/7FVWFAIUyQSzam8JuHm5F/m8=&lt;/ds:DigestValue&gt;\n&lt;/ds:Reference&gt;\n&lt;/ds:SignedInfo&gt;\n&lt;ds:SignatureValue Id="SignatureValue335953"&gt;\nBNDbVnb4zvFE+0BAsaNHVOTFEMcgLFJTOqUxBGpYjXDQJYneVd9YLtQG/+pEX3ipnaw6AVaul/lc\nnctim76XA/tuAajY/TX2sqpyZa8UrdIwZPDvOVgOAyCjJ4fABJ4VkE/fYn8iZNXETCIkqYcAssXc\nx49l2otpVh4KrwG7HmgktlL1q7D5WNaFozcGQUEkpDQ7Po3J6YBiGIPUSUPfOI6iDRQw7FkzcmuZ\nfTnCUDZBlKYk22rxoDOVwA8pfi9tLybB1klK4DBNlbfP0i8ZeLvV+76Se9AXaBZF4PVPs08f4+Ff\ndSp6xPsu7opQW3GCnyhfRKbOVJ5Yzk9pAav4EQ==\n&lt;/ds:SignatureValue&gt;\n&lt;ds:KeyInfo Id="Certificate997191"&gt;\n&lt;ds:X509Data&gt;\n&lt;ds:X509Certificate&gt;\nMIIKCzCCB/OgAwIBAgIEWH+yvTANBgkqhkiG9w0BAQsFADCBoTELMAkGA1UEBhMCRUMxIjAgBgNV\nBAoTGUJBTkNPIENFTlRSQUwgREVMIEVDVUFET1IxNzA1BgNVBAsTLkVOVElEQUQgREUgQ0VSVElG\nSUNBQ0lPTiBERSBJTkZPUk1BQ0lPTi1FQ0lCQ0UxDjAMBgNVBAcTBVFVSVRPMSUwIwYDVQQDExxB\nQyBCQU5DTyBDRU5UUkFMIERFTCBFQ1VBRE9SMB4XDTE4MDEwOTE2MDE1NVoXDTIwMDEwOTE2MzE1\nNVowgbIxCzAJBgNVBAYTAkVDMSIwIAYDVQQKExlCQU5DTyBDRU5UUkFMIERFTCBFQ1VBRE9SMTcw\nNQYDVQQLEy5FTlRJREFEIERFIENFUlRJRklDQUNJT04gREUgSU5GT1JNQUNJT04tRUNJQkNFMQ4w\nDAYDVQQHEwVRVUlUTzE2MBEGA1UEBRMKMDAwMDI0ODcwODAhBgNVBAMTGkRBTklFTCBMRU9OQVJE\nIFdJTEQgU1RBUEVMMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv4YPhsy97m9WQ95t\nKtRqYQej/OGyjo2ca8hrfMRx0KG3rpUhHvc0Hh9FvKdH8U4ho1uEWESXRH0gC5/qHPXlktbVdijW\nWAFuKWGu5bOjjHOoBKv3Q3A5iuZjqTgMY/1/X7d81INR/iHZ1bQsjOUD5vaznT7sau+A1+k2j6CX\nHEgsqRDrmEy+ZvHcr6i3dZVLhXX9Q3nTE8hpwo1m5goNIiBIFHxiO7cfCZhtnVHmqgy7bmgj1Bqm\n0BPpAycV2UvOYM3YmiHqTDKug8xXVCbQ0/B+JSRWYxy3DQko/XRJeH9p9mtcVEHSGRAe8Vt1smfj\nCijnP2u0LxZDHKIG6VZdQQIDAQABo4IFNjCCBTIwCwYDVR0PBAQDAgeAMGcGA1UdIARgMF4wXAYL\nKwYBBAGCqDsCAgEwTTBLBggrBgEFBQcCARY/aHR0cDovL3d3dy5lY2kuYmNlLmVjL3BvbGl0aWNh\nLWNlcnRpZmljYWRvL3BlcnNvbmEtanVyaWRpY2EucGRmMIGRBggrBgEFBQcBAQSBhDCBgTA+Bggr\nBgEFBQcwAYYyaHR0cDovL29jc3AuZWNpLmJjZS5lYy9lamJjYS9wdWJsaWN3ZWIvc3RhdHVzL29j\nc3AwPwYIKwYBBQUHMAGGM2h0dHA6Ly9vY3NwMS5lY2kuYmNlLmVjL2VqYmNhL3B1YmxpY3dlYi9z\ndGF0dXMvb2NzcDAzBgorBgEEAYKoOwMKBCUTI0xPR0lDSEVNIFNPTFVUSU9OUyBTT0NJRURBRCBB\nTk9OSU1BMB0GCisGAQQBgqg7AwsEDxMNMTc5MjE3Nzc1ODAwMTAaBgorBgEEAYKoOwMBBAwTCjE3\nMDk0NzAxNzEwHgYKKwYBBAGCqDsDAgQQEw5EQU5JRUwgTEVPTkFSRDAUBgorBgEEAYKoOwMDBAYT\nBFdJTEQwFgYKKwYBBAGCqDsDBAQIEwZTVEFQRUwwLgYKKwYBBAGCqDsDBQQgEx5QUkVTSURFTlRF\nIFJFUFJFU0VOVEFOVEUgTEVHQUwwNAYKKwYBBAGCqDsDBwQmEyRLTSAxMSAxMiBDVU1CQVlBIEFW\nIElOVEVST0NFQU5JQ0EgU04wGQYKKwYBBAGCqDsDCAQLEwkwMjYwMjI3NDIwFQYKKwYBBAGCqDsD\nCQQHEwVRdWl0bzAXBgorBgEEAYKoOwMMBAkTB0VDVUFET1IwIAYKKwYBBAGCqDsDMwQSExBTT0ZU\nV0FSRS1BUkNISVZPMB8GA1UdEQQYMBaBFGxvZ2ljaGVtZWNAZ21haWwuY29tMIIB3wYDVR0fBIIB\n1jCCAdIwggHOoIIByqCCAcaGgdVsZGFwOi8vYmNlcWxkYXBzdWJwMS5iY2UuZWMvY249Q1JMNDk4\nLGNuPUFDJTIwQkFOQ08lMjBDRU5UUkFMJTIwREVMJTIwRUNVQURPUixsPVFVSVRPLG91PUVOVElE\nQUQlMjBERSUyMENFUlRJRklDQUNJT04lMjBERSUyMElORk9STUFDSU9OLUVDSUJDRSxvPUJBTkNP\nJTIwQ0VOVFJBTCUyMERFTCUyMEVDVUFET1IsYz1FQz9jZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0\nP2Jhc2WGNGh0dHA6Ly93d3cuZWNpLmJjZS5lYy9DUkwvZWNpX2JjZV9lY19jcmxmaWxlY29tYi5j\ncmykgbUwgbIxCzAJBgNVBAYTAkVDMSIwIAYDVQQKExlCQU5DTyBDRU5UUkFMIERFTCBFQ1VBRE9S\nMTcwNQYDVQQLEy5FTlRJREFEIERFIENFUlRJRklDQUNJT04gREUgSU5GT1JNQUNJT04tRUNJQkNF\nMQ4wDAYDVQQHEwVRVUlUTzElMCMGA1UEAxMcQUMgQkFOQ08gQ0VOVFJBTCBERUwgRUNVQURPUjEP\nMA0GA1UEAxMGQ1JMNDk4MCsGA1UdEAQkMCKADzIwMTgwMTA5MTYwMTU1WoEPMjAyMDAxMDkxNjMx\nNTVaMB8GA1UdIwQYMBaAFBj58PvmMhyZZjkqyouyaX1JJ7/OMB0GA1UdDgQWBBQrEHrmRobrNWs7\nJ8aPmAH5mwYglDAJBgNVHRMEAjAAMBkGCSqGSIb2fQdBAAQMMAobBFY4LjEDAgSwMA0GCSqGSIb3\nDQEBCwUAA4ICAQBLwF5yq0jsLJCOklR7ujOguSSmuNLGSlEq4TH50FDEyLvmq5n0CfyMzITiHy0R\nnsLd20UFFOynp5kCZK9sxiEDfSR1SRV9XxPuELdKS7rMu9N+rGs3Kddu/TcS7VBzXayhNNQgs59U\njiovRoFiaihicTSGTEagLhmYZRbU1OjW6H8Xc6H0nX4VsEI46WtL4wSH2AQrFZiLiRDetqe7fUwP\nHOdJNdmVQrArPHKq1fPVD+TiUYNQJ9FzRk7QJFreB59WAEct5hmnPK5R8qvwr0eajXOEYHfQ79Ud\nRREMsnBKwwanC+RO4IJ8/LulDsy43IZvfRRn7rJnWc5hY1rspaShkPhcvUpdF6PKIt7g0MS5fDoy\nC0MhDCjz3kXpN47+db8ZOGoScnmxGMj417elLyU4NMl9slWcxr5qtqTQ0iDesadVjxKiXM9d52Mj\nH0QWtd+5ieUnNGpUZNkIUw3djJowVBurO+6VzObTcAkr0wyQxGMXbo3g0EX2fJWKM5y4e1EF+DvT\n1O2suonDrG6DFPdP7nDeSMqyOrAHBSy/3h7RtEilvEqoUsv1lvrFT3DIVo3u9FyIrkfb4LEQAS2X\nR6UemJ26n9CSGlw7ynTbxz9FY+1MiX4I4fCVyNJB+DEvkNsgmIsXDpFzM8cQDw9BZefd6f+eusEg\niB8nhzJM1lCJ2A==\n&lt;/ds:X509Certificate&gt;\n&lt;/ds:X509Data&gt;\n&lt;ds:KeyValue&gt;\n&lt;ds:RSAKeyValue&gt;\n&lt;ds:Modulus&gt;\nv4YPhsy97m9WQ95tKtRqYQej/OGyjo2ca8hrfMRx0KG3rpUhHvc0Hh9FvKdH8U4ho1uEWESXRH0g\nC5/qHPXlktbVdijWWAFuKWGu5bOjjHOoBKv3Q3A5iuZjqTgMY/1/X7d81INR/iHZ1bQsjOUD5vaz\nnT7sau+A1+k2j6CXHEgsqRDrmEy+ZvHcr6i3dZVLhXX9Q3nTE8hpwo1m5goNIiBIFHxiO7cfCZht\nnVHmqgy7bmgj1Bqm0BPpAycV2UvOYM3YmiHqTDKug8xXVCbQ0/B+JSRWYxy3DQko/XRJeH9p9mtc\nVEHSGRAe8Vt1smfjCijnP2u0LxZDHKIG6VZdQQ==\n&lt;/ds:Modulus&gt;\n&lt;ds:Exponent&gt;AQAB&lt;/ds:Exponent&gt;\n&lt;/ds:RSAKeyValue&gt;\n&lt;/ds:KeyValue&gt;\n&lt;/ds:KeyInfo&gt;\n&lt;ds:Object Id="Signature759450-Object439466"&gt;&lt;etsi:QualifyingProperties Target="#Signature759450"&gt;&lt;etsi:SignedProperties Id="Signature759450-SignedProperties362490"&gt;&lt;etsi:SignedSignatureProperties&gt;&lt;etsi:SigningTime&gt;2019-07-15 19:24:43+00:00&lt;/etsi:SigningTime&gt;&lt;etsi:SigningCertificate&gt;&lt;etsi:Cert&gt;&lt;etsi:CertDigest&gt;&lt;ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"&gt;&lt;/ds:DigestMethod&gt;&lt;ds:DigestValue&gt;5HvcXriTMN+6w2dmBqUpq51Cj8M=&lt;/ds:DigestValue&gt;&lt;/etsi:CertDigest&gt;&lt;etsi:IssuerSerial&gt;&lt;ds:X509IssuerName&gt;CN=AC BANCO CENTRAL DEL ECUADOR,L=QUITO,OU=ENTIDAD DE CERTIFICACION DE INFORMACION-ECIBCE,O=BANCO CENTRAL DEL ECUADOR,C=EC&lt;/ds:X509IssuerName&gt;&lt;ds:X509SerialNumber&gt;1484763837&lt;/ds:X509SerialNumber&gt;&lt;/etsi:IssuerSerial&gt;&lt;/etsi:Cert&gt;&lt;/etsi:SigningCertificate&gt;&lt;/etsi:SignedSignatureProperties&gt;&lt;etsi:SignedDataObjectProperties&gt;&lt;etsi:DataObjectFormat ObjectReference="#Reference-ID-647686"&gt;&lt;etsi:Description&gt;contenido comprobante&lt;/etsi:Description&gt;&lt;etsi:MimeType&gt;text/xml&lt;/etsi:MimeType&gt;&lt;/etsi:DataObjectFormat&gt;&lt;/etsi:SignedDataObjectProperties&gt;&lt;/etsi:SignedProperties&gt;&lt;/etsi:QualifyingProperties&gt;&lt;/ds:Object&gt;&lt;/ds:Signature&gt;&lt;/factura&gt;</comprobante>
                          <mensajes/>
                      </autorizacion>
                  </autorizaciones>
              </RespuestaAutorizacionComprobante>
          </ns2:autorizacionComprobanteResponse>
          </soap:Body>
          </soap:Envelope>
        `;

        /* eslint-enable max-len */
        CLG('XML parse result');
        CDR(srixml(xmlBad));
        // CDR(srixml(xmlGood));
        break;
      default:
    }
  } catch (err) {
    CLG(err);
  }
};
/* eslint-enable no-unused-vars */

export default qtst;
