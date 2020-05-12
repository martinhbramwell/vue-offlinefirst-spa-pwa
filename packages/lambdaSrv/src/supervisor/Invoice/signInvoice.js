import forge from 'node-forge';
import moment from 'moment';

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

// const qTst = () => {
//   const vals = ['bf', '86', '0f', '86', 'cc', 'bd', 'ee', '6f'];
//   const ary = vals.map(a => String.fromCharCode(parseInt(a, 16)));
//   const str = ary.join('');
//   let base64 = Buffer.from(str, 'binary');
//   base64 = base64.toString('base64');

//   console.log(base64); // eslint-disable-line no-console
// }

const makeRandomCode = () => Math.floor(Math.random() * 999000) + 990;

const bigint2base64 = (bigint) => {
  const bInt = bigint
    .toString(16)
    .match(/\w{2}/g)
    .map(a => String.fromCharCode(parseInt(a, 16)))
    .join('');

  const base64 = Buffer.from(bInt, 'binary')
    .toString('base64')
    .match(/.{1,76}/g)
    .join('\n');
  return base64;
};


const hexToBase64 = (str) => {
  const clean = `00${str}`
    .slice(0 - str.length - (str.length % 2))
    .replace(/\r|\n/g, '')
    .replace(/([\da-fA-F]{2}) ?/g, '0x$1 ')
    .replace(/ +$/, '')
    .split(' ');

  const val = String.fromCharCode.apply(null, clean);
  const ret = Buffer.from(val).toString('base64');

  return ret;
};

const sha1Base64 = (txt, codificacion = '') => {
  const md = forge.md.sha1.create();
  md.update(txt, codificacion);
  return Buffer.from(md.digest().toHex(), 'hex').toString('base64');
};

const extractVerificationCertificate = (p12) => {
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  let result = null;
  certBags[forge.oids.certBag].forEach((certBag) => {
    if (certBag.attributes.friendlyName) {
      if (certBag.attributes.friendlyName[0].includes('Verification Certificate')) {
        result = certBag.cert;
      }
    }
  });
  return result;
};

const extractSigningKey = (p12) => {
  const pkcs8bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  let result = null;
  pkcs8bags[forge.oids.pkcs8ShroudedKeyBag].forEach((pkcs8bag) => {
    if (pkcs8bag.attributes.friendlyName) {
      if (pkcs8bag.attributes.friendlyName[0].includes('Signing Key')) {
        result = pkcs8bag.key;
      }
    }
  });
  return result;
};
function firmarComprobante(p12cert, p12pwd, comprobante) {
  const arrayUint8 = new Uint8Array(p12cert);
  const p12B64 = forge.util.binary.base64.encode(arrayUint8);
  const p12Der = forge.util.decode64(p12B64);
  const p12Asn1 = forge.asn1.fromDer(p12Der);

  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, p12pwd);

  // const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  // const { cert } = certBags[forge.oids.certBag][1];
  // const pkcs8bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  // const pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][1];
  // let { key } = pkcs8;

  // if (key == null) {
  //   key = pkcs8.asn1;
  // }

  const cert = extractVerificationCertificate(p12);
  const key = extractSigningKey(p12);

  const certificateX509pem = forge.pki.certificateToPem(cert);

  let certificateX509 = certificateX509pem;
  certificateX509 = certificateX509.substr(certificateX509.indexOf('\n'));
  certificateX509 = certificateX509.substr(0, certificateX509.indexOf('\n-----END CERTIFICATE-----'));

  certificateX509 = certificateX509.replace(/\r?\n|\r/g, '').replace(/([^\0]{76})/g, '$1\n');

  // Pasar certificado a formato DER y sacar su hash:
  const certificateX509asn1 = forge.pki.certificateToAsn1(cert);
  const certificateX509der = forge.asn1.toDer(certificateX509asn1).getBytes();
  const certificateX509derHash = sha1Base64(certificateX509der);

  // Serial Number
  const X509SerialNumber = parseInt(cert.serialNumber, 16);

  const exponent = hexToBase64(key.e.data[0].toString(16));

  // qTst();

  const modulus = bigint2base64(key.n);

  const encodingHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const comp = comprobante.replace(encodingHeader, '');


  const sha1Comprobante = sha1Base64(comp, 'utf8');
  // const sha1Comprobante = 'apHyjNkBdWlintMqVteBfyU38+8=';

  const xmlns = 'xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#"';

  // numeros involucrados en los hash:

  const SignatureNumber = makeRandomCode();
  // const SignatureNumber = 48698;

  const SignedInfoNumber = makeRandomCode();
  // const SignedInfoNumber = 995619;

  const SignedPropertiesIdNumber = makeRandomCode();
  // const SignedPropertiesIdNumber = 401487;

  const SignedPropertiesNumber = makeRandomCode();
  // const SignedPropertiesNumber = 298895;

  const CertificateNumber = makeRandomCode();
  // const CertificateNumber = 1517691;

  const ReferenceIdNumber = makeRandomCode();
  // const ReferenceIdNumber = 695264;


  // numeros fuera de los hash:

  const SignatureValueNumber = makeRandomCode();
  // const SignatureValueNumber = 409828;

  const ObjectNumber = makeRandomCode();
  // const ObjectNumber = 14211;


  let SignedProperties = '';

  SignedProperties += `<etsi:SignedProperties Id="Signature${SignatureNumber}-SignedProperties${SignedPropertiesNumber}">`;
  SignedProperties += '<etsi:SignedSignatureProperties>';
  SignedProperties += '<etsi:SigningTime>';

  // SignedProperties += '2016-12-24T13:46:43-05:00';//moment().format('YYYY-MM-DD\THH:mm:ssZ');
  SignedProperties += moment().format('YYYY-MM-DD HH:mm:ssZ');
  // SignedProperties += '2019-01-14T09:25:20-05:00';

  SignedProperties += '</etsi:SigningTime>';
  SignedProperties += '<etsi:SigningCertificate>';
  SignedProperties += '<etsi:Cert>';
  SignedProperties += '<etsi:CertDigest>';
  SignedProperties += '<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
  SignedProperties += '</ds:DigestMethod>';
  SignedProperties += '<ds:DigestValue>';

  SignedProperties += certificateX509derHash;

  SignedProperties += '</ds:DigestValue>';
  SignedProperties += '</etsi:CertDigest>';
  SignedProperties += '<etsi:IssuerSerial>';
  SignedProperties += '<ds:X509IssuerName>';
  SignedProperties += 'CN=AC BANCO CENTRAL DEL ECUADOR,L=QUITO,OU=ENTIDAD DE CERTIFICACION DE INFORMACION-ECIBCE,O=BANCO CENTRAL DEL ECUADOR,C=EC';
  SignedProperties += '</ds:X509IssuerName>';
  SignedProperties += '<ds:X509SerialNumber>';

  SignedProperties += X509SerialNumber;

  SignedProperties += '</ds:X509SerialNumber>';
  SignedProperties += '</etsi:IssuerSerial>';
  SignedProperties += '</etsi:Cert>';
  SignedProperties += '</etsi:SigningCertificate>';
  SignedProperties += '</etsi:SignedSignatureProperties>';
  SignedProperties += '<etsi:SignedDataObjectProperties>';
  SignedProperties += `<etsi:DataObjectFormat ObjectReference="#Reference-ID-${ReferenceIdNumber}">`;
  SignedProperties += '<etsi:Description>';

  SignedProperties += 'contenido comprobante';

  SignedProperties += '</etsi:Description>';
  SignedProperties += '<etsi:MimeType>';
  SignedProperties += 'text/xml';
  SignedProperties += '</etsi:MimeType>';
  SignedProperties += '</etsi:DataObjectFormat>';
  SignedProperties += '</etsi:SignedDataObjectProperties>';
  SignedProperties += '</etsi:SignedProperties>';

  const SignedPropertiesParaHash = SignedProperties.replace('<etsi:SignedProperties', `<etsi:SignedProperties ${xmlns}`);

  const sha1SignedProperties = sha1Base64(SignedPropertiesParaHash);


  let KeyInfo = '';

  KeyInfo += `<ds:KeyInfo Id="Certificate${CertificateNumber}">`;
  KeyInfo += '\n<ds:X509Data>';
  KeyInfo += '\n<ds:X509Certificate>\n';

  // CERTIFICADO X509 CODIFICADO EN Base64
  KeyInfo += certificateX509;

  KeyInfo += '\n</ds:X509Certificate>';
  KeyInfo += '\n</ds:X509Data>';
  KeyInfo += '\n<ds:KeyValue>';
  KeyInfo += '\n<ds:RSAKeyValue>';
  KeyInfo += '\n<ds:Modulus>\n';

  // MODULO DEL CERTIFICADO X509
  KeyInfo += modulus;

  KeyInfo += '\n</ds:Modulus>';
  KeyInfo += '\n<ds:Exponent>';

  // KeyInfo += 'AQAB';
  KeyInfo += exponent;

  KeyInfo += '</ds:Exponent>';
  KeyInfo += '\n</ds:RSAKeyValue>';
  KeyInfo += '\n</ds:KeyValue>';
  KeyInfo += '\n</ds:KeyInfo>';

  const KeyInfoParaHash = KeyInfo.replace('<ds:KeyInfo', `<ds:KeyInfo ${xmlns}`);

  const sha1Certificado = sha1Base64(KeyInfoParaHash);


  let SignedInfo = '';

  SignedInfo += `<ds:SignedInfo Id="Signature-SignedInfo${SignedInfoNumber}">`;
  SignedInfo += '\n<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">';
  SignedInfo += '</ds:CanonicalizationMethod>';
  SignedInfo += '\n<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1">';
  SignedInfo += '</ds:SignatureMethod>';
  SignedInfo += `\n<ds:Reference Id="SignedPropertiesID${SignedPropertiesIdNumber}" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature${SignatureNumber}-SignedProperties${SignedPropertiesNumber}">`;
  SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
  SignedInfo += '</ds:DigestMethod>';
  SignedInfo += '\n<ds:DigestValue>';

  // HASH O DIGEST DEL ELEMENTO <etsi:SignedProperties>';
  SignedInfo += sha1SignedProperties;

  SignedInfo += '</ds:DigestValue>';
  SignedInfo += '\n</ds:Reference>';
  SignedInfo += `\n<ds:Reference URI="#Certificate${CertificateNumber}">`;
  SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
  SignedInfo += '</ds:DigestMethod>';
  SignedInfo += '\n<ds:DigestValue>';

  // HASH O DIGEST DEL CERTIFICADO X509
  SignedInfo += sha1Certificado;

  SignedInfo += '</ds:DigestValue>';
  SignedInfo += '\n</ds:Reference>';
  SignedInfo += `\n<ds:Reference Id="Reference-ID-${ReferenceIdNumber}" URI="#comprobante">`;
  SignedInfo += '\n<ds:Transforms>';
  SignedInfo += '\n<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature">';
  SignedInfo += '</ds:Transform>';
  SignedInfo += '\n</ds:Transforms>';
  SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
  SignedInfo += '</ds:DigestMethod>';
  SignedInfo += '\n<ds:DigestValue>';

  // HASH O DIGEST DE TODO EL ARCHIVO XML IDENTIFICADO POR EL id="comprobante"
  SignedInfo += sha1Comprobante;

  SignedInfo += '</ds:DigestValue>';
  SignedInfo += '\n</ds:Reference>';
  SignedInfo += '\n</ds:SignedInfo>';

  const SignedInfoParaFirma = SignedInfo.replace('<ds:SignedInfo', `<ds:SignedInfo ${xmlns}`);

  const md = forge.md.sha1.create();
  md.update(SignedInfoParaFirma, 'utf8');

  const signedText = key.sign(md);
  // const signature = btoa(signedText).match(/.{1,76}/g).join("\n");
  const signature = Buffer.from(signedText, 'binary')
    .toString('base64')
    .match(/.{1,76}/g)
    .join('\n');


  let xadesBes = '';

  // INICIO DE LA FIRMA DIGITAL
  xadesBes += `<ds:Signature ${xmlns} Id="Signature${SignatureNumber}">`;
  xadesBes += `\n${SignedInfo}`;

  xadesBes += `\n<ds:SignatureValue Id="SignatureValue${SignatureValueNumber}">\n`;

  // VALOR DE LA FIRMA (ENCRIPTADO CON LA LLAVE PRIVADA DEL CERTIFICADO DIGITAL)
  xadesBes += signature;

  xadesBes += '\n</ds:SignatureValue>';

  xadesBes += `\n${KeyInfo}`;

  xadesBes += `\n<ds:Object Id="Signature${SignatureNumber}-Object${ObjectNumber}">`;
  xadesBes += `<etsi:QualifyingProperties Target="#Signature${SignatureNumber}">`;

  // ELEMENTO <etsi:SignedProperties>';
  xadesBes += SignedProperties;

  xadesBes += '</etsi:QualifyingProperties>';
  xadesBes += '</ds:Object>';
  xadesBes += '</ds:Signature>';

  // FIN DE LA FIRMA DIGITAL
  return comprobante.replace(/(<[^<]+)$/, `${xadesBes}$1`);
}

const sign = async (args) => {
  const { doc: inv, db, cert, pwd } = args; // eslint-disable-line object-curly-newline

  LG.verbose(`
    Invoice to sign :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  // if ((inv.data.idib > 4257) && (inv.data.idib < 4260)) return;

  let fresh = null;
  let invoice = null;
  try {
    const blobOrBuffer = await db.getAttachment(inv._id, 'invoiceXml'); // eslint-disable-line no-underscore-dangle
    invoice = Buffer.from(blobOrBuffer, 'utf-8')
      .toString()
      .replace(' standalone="yes"', '');

    LG.verbose(`
      Got XML invoice for signing :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);
    const invSigned = firmarComprobante(cert, pwd, invoice);

    const attachment = (Buffer.from(invSigned, 'utf-8')).toString('base64');

    fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
    LG.info(`Will save signed invoice as attachment.  Id :: ${fresh._id}. Rev :: ${fresh._rev}`); // eslint-disable-line no-underscore-dangle
    const result = await db.putAttachment(fresh._id, 'invoiceSigned', fresh._rev, attachment, 'text/plain'); // eslint-disable-line no-underscore-dangle
    LG.info(`Saved signed invoice as attachment ${JSON.stringify(result, null, 2)}`);
  } catch (err) {
    LG.error(`Error saving signed invoice  Id :: ${inv._id}/${fresh._id}. Rev :: ${fresh._rev} :: ${err}`); // eslint-disable-line no-underscore-dangle
  }
};

export default sign;
