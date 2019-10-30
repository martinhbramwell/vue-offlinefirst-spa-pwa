import { promises } from 'fs';

import pdfgen from '../../digitalDocuments/pdf';
import {
  logger as LG, mailCfg, // eslint-disable-line no-unused-vars
  getMailer as mailer,
  validateEmail as validEmail,
  fechaShort as shortDate,
  fechaLong as longDate,
} from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const sendIt = async (message) => { // eslint-disable-line no-unused-vars
  LG.info(`Mailing via ${process.env.MAILERUID} to '${mailCfg.send_to}'' now == >>`);

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

  // CLG('Result ====>');
  // CDR(r);

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

      const buff = Buffer.from(invSigned, 'base64');
      const content = buff.toString('ascii');

      const fechaLong = longDate(d.fecha);
      const fechaShort = shortDate(d.fecha);

      const mailFile = `${fechaShort}_${d.sequential}`;
      let mailDir = '';
      mailDir += `${process.env.MAIL_DIR}`;
      mailDir += `/${d.nombreCliente.replace(/ /g, '_')}`;
      mailDir += `/${fechaShort}`;

      const pdfPath = await pdfgen(inv, { mailDir, mailFile });


      const attachments = [
        {
          filename: `Factura_LogiChem_${fechaShort}.xml`,
          content,
        },
        {
          path: pdfPath,
        },
      ];

      const text = `
        ${fechaLong}

        Estimado ${d.nombreCliente}

        Sirvese encontrar anexo su factura de LogiChem S.A. #${d.codigo} en dos formatos: XML, PDF.

        Valor total : ${d.total}
        Autorizacion : ${inv.accessKey}
      `;

      const html = `
        <p>${fechaLong}</p>

        <p>Estimado <b>${d.nombreCliente}</b></p>

        <p>Sirvese encontrar anexo su factura de LogiChem S.A. #${d.codigo} en dos formatos: XML, PDF.</p>

        <p>Valor total : <b>${d.total}</b></p>
        <p>Autorizacion : <b>${inv.accessKey}</b></p>

      `;

      const PROTECTOR = 'GET FROM DATABASE';
      const to = mailCfg.send_to === PROTECTOR ? d.email : mailCfg.send_to;
      // CLG(`mailCfg.send_to = >${mailCfg.send_to}< PROTECTOR = >${PROTECTOR}<. Equal? ${mailCfg.send_to === PROTECTOR}. To = ${to}.`);

      const unique = {
        to,
        subject: `Factura de LogiChem S.A. Fecha: ${fechaShort} (#${d.codigo})`,
      };

      CLG(`Will send ... \n${JSON.stringify(unique, null, 2)}`);

      const headers = Object.assign(unique, {
        from: mailCfg.send_from,
        sender: mailCfg.send_sender,
        replyTo: mailCfg.send_replyto,
      });

      if (mailCfg.send_bcc) headers.bcc = mailCfg.send_bcc;

      const mail = Object.assign(headers, {text, html, attachments});

      // mail.text = text,
      // mail.html = html,
      // mail.attachments = attachments,


      response = await sendIt(mail);

      await promises.writeFile(`${mailDir}/factura_${mailFile}.xml`, content);
    } catch (err) {
      LG.error(err);
    }
  } else {
    response = { result: { status: `Dirección inválida: ${d.email}` }, sent: false };
  }

  // CLG(`Mailer result :: ${response}`);
  // CDR(response);

  const invoice = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
  invoice.emailed = response;
  const pt = await db.put(invoice);

  CLG(`Mailer result PUT response :: ${JSON.stringify(pt, null, 2)}`);
  return response.sent;
};
