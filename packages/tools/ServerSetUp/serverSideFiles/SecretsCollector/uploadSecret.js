const fs = require('fs');
const axios = require('axios');
const { google } = require('googleapis');

const { authorize, loadToken } = require('./auth');


const fileId = process.argv[2];
const targetPath = process.env.XDG_RUNTIME_DIR;

console.log("********************* Upload *****************************");

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function putFile(auth, parms) {
  const { filePath, fileName, mimeType } = parms;
  console.log(`Parms are : ${filePath}, ${fileName}, ${mimeType}`);

  const drive = google.drive({ version: 'v3', auth });

  drive.files.create({
    resource: { name: fileName },
    media: { body: fs.createReadStream(filePath) },
    fields: 'id'
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      process.stdout.write(`${file.data.id}`);
    }
  });
}

console.log(`1 ${process.argv[2]}`);
console.log(`2 ${process.argv[3]}`);
console.log(`3 ${process.argv[4]}`);


// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  const directory = process.argv[2];
  const fileName = process.argv[3];
  const mimeType = process.argv[4];
  authorize(JSON.parse(content), putFile, {
    filePath: `${directory}/${fileName}`,
    fileName,
    mimeType,
  });
});

