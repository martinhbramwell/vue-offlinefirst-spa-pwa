import { promises } from 'fs';

import {
  logger as LG, mailCfg,
  getMailer as mailer,
  validateEmail as validEmail,
} from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const sendIt = async (message) => { // eslint-disable-line no-unused-vars
  LG.info(`Mailing :: ${process.env.MAILERUID}`);

  CLG('Sending now ===========> ');

  const r = {};
  r.result = await mailer.sendMail(message);
  delete r.result.envelopeTime;
  delete r.result.messageTime;
  delete r.result.messageSize;
  delete r.result.envelope;

  r.sent = false;
  if (r.result.rejected.length < 1) {
    r.sent = true;
    r.search = `rfc822msgid:${r.result.messageId.replace('<', '').replace('>', '')}`;
  }

  CLG('Result ====>');
  CDR(r);

  return r;
};

export default async (args) => {
  const { doc: inv, db } = args;
  const { data: d } = inv;
  LG.verbose(`
    Invoice to send :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  // CDR(inv);

  let response = {};
  if (validEmail(d.email)) {
    try {
      const invSigned = await db.getAttachment(inv._id, 'invoiceSigned'); // eslint-disable-line no-underscore-dangle
      // const invB64 = (Buffer.from(invSigned, 'utf-8')).toString('base64');
      const buff = Buffer.from(invSigned, 'base64');
      const content = buff.toString('ascii');

      const fechaLong = (new Date(d.fecha)).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const fechaShort = (new Date(d.fecha)).toLocaleDateString('fr-CA').split('/').join('-');

      const attachments = [ // eslint-disable-line no-unused-vars
        {
          filename: `Factura_LogiChem_${fechaShort}.xml`,
          content,
        },
      ];

      const text = `
        (Leo : This is a sample email sent from my development version of the gestor de facturas.
        Opinions on appearance, layout grammar, spelling?
        Please note that currently I can only show data taken from text of the actual invoice, so
        tricks like "Sra. Catalina Izurieta" vs "Sres. Cerveceria SABAIBEER S.A." will have to wait.
        I still need to generate the PDF version which is fiddly and long to do.)

        ${fechaLong}

        Estimado ${d.nombreCliente}

        Sirvese encontrar anexo su factura de LogiChem S.A. #${d.codigo} en dos formatos: XML, PDF.

        Valor total : ${d.total}
        Autorizacion : ${inv.accessKey}
      `;

      const html = `
        <p><i>(Leo : This is a sample email sent from my development version of the gestor de facturas.</i></p>
        <p><i>Opinions on appearance, layout grammar, spelling?</i></p>
        <p><i>Please note that currently I can only show data taken from text of the actual invoice, so
        tricks like "Sra. Catalina Izurieta" vs "Sres. Cerveceria SABAIBEER S.A." will have to wait.</i></p>
        <p><i>I still need to generate the PDF version which is fiddly and long to do.)</i></p>

        <hr />

        <p>${fechaLong}</p>

        <p>Estimado <b>${d.nombreCliente}</b></p>

        <p>Sirvese encontrar anexo su factura de LogiChem S.A. #${d.codigo} en dos formatos: XML, PDF.</p>

        <p>Valor total : <b>${d.total}</b></p>
        <p>Autorizacion : <b>${inv.accessKey}</b></p>

      `;

      const mail = {
        from: mailCfg.auth.user,
        // to: [ 'yourself.yourorg@gmail.com', 'martinhbramwell@gmail.com' ],
        to: [d.email],
        subject: `Factura de LogiChem S.A. Fecha: ${fechaShort} (#${d.codigo})`,
        text,
        html,
        attachments,
      };
      // CLG('######################################################');
      // CDR(mail);
      response = await sendIt(mail);

      await promises.writeFile(`${process.env.MAIL_DIR}/factura_${fechaShort}_${d.sequential}.xml`, content);
    } catch (err) {
      LG.error(err);
    }
  } else {
    response = { result: { status: `Dirección inválida: ${d.email}` }, sent: false };
  }

  CLG(`Mailer result :: ${response}`);
  CDR(response);

  const invoice = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
  invoice.emailed = response;
  const pt = await db.put(invoice);

  CLG(`Mailer result PUT response :: ${JSON.stringify(pt, null, 2)}`);
  return response.sent;
};
