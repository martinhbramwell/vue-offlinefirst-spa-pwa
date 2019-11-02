const fs = require('fs');
const { google } = require('googleapis');

const { authorize, loadToken, credentials } = require('./auth');

const fileId = process.argv[2];
const fileName = process.argv[3];
const targetPath = process.argv[4];

// process.stdout.write(`Parameters --  fileId:'${fileId}' fileName:'${fileName}' targetPath:'${targetPath}'\n`);


/**
 * Gets a single file from GDrive and writes it to ${XDG_RUNTIME_DIR}
 * File specified by the command line parameters
 *  - 1st. fileId
 *  - 2nd. fileName
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function getFile(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const options = {encoding:'utf-8', flag:'w'};

  drive.files.get({
    fileId: fileId,
    // mimeType: 'application/gzip',
    alt: 'media'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const filePath = `${targetPath}/${fileName}`;
    fs.writeFileSync(filePath, res.data, options);
    process.stdout.write(`${fileName}`);
    // process.stdout.write(`Secrets collector wrote -- \n    '${filePath}'`);
  });
}

// Load client secrets from a local file.
fs.readFile(credentials, (err, content) => {
  // process.stdout.write(`With content -- '${content}'\n`);
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), getFile);
});
