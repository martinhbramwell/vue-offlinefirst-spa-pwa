const fs = require('fs');
const axios = require('axios');
const { google } = require('googleapis');

const { authorize, loadToken, credentials } = require('./auth');


const fileId = process.argv[2];
const targetPath = process.env.XDG_RUNTIME_DIR;

const DRIVE_URL = 'https://drive.google.com/open';

if (process.argv.length < 6) {
  console.log(`Error: Too few arguments.

    Usage :

export SECRETS_FILE_PATH=".ssh/secrets";
export GOOGLE_CREDS_FILE="credentials.json";
export FILEDIR="/tmp";
export FILENAME="";
export MIME="text/plain";
export PARENT="19lh-dZyrbEpyVJP0semQ9fVNlSxrUjUo";

node uploadSecret \${FILEDIR} \${FILENAME} "\${MIME}" "\${PARENT}";

      FILEDIR = where the file is kept
      FILENAME = the file's name
      MIME = typically 'text/plain' *
      PARENT = google drive parent folder ID eg: '19lh-dZyrbEpyVJP0semQ9fVNlSxrUjUo'

* https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    `);
  // const directory = process.argv[2];
  // const fileName = process.argv[3];
  // const mimeType = process.argv[4];
  // const parent = process.argv[5];

  return;
};

console.log("********************* Uploading *****************************");

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function putFile(auth, parms) {
  const { filePath, fileName, mimeType, parent } = parms;
  console.log(`Parms are : ${filePath}, ${fileName}, ${mimeType}, ${parent}`);

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [parent]
  };

  drive.files.create({
    resource: fileMetadata,
    media: { body: fs.createReadStream(filePath) },
    fields: 'id'
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      const report = `File: ${DRIVE_URL}?id=${file.data.id}\nFolder: ${DRIVE_URL}?id=${parent}`;
      process.stdout.write(report);
    }
  });
}

// console.log(`1 Source dir :: ${process.argv[2]}`);
// console.log(`2 File name :: ${process.argv[3]}`);
// console.log(`3 Mime type :: ${process.argv[4]}`);
// console.log(`4 Dest folder  :: ${process.argv[5]}`);

// Load client secrets from a local file.
fs.readFile(credentials, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  const directory = process.argv[2];
  const fileName = process.argv[3];
  const mimeType = process.argv[4];
  const parent = process.argv[5];
  authorize(JSON.parse(content), putFile, {
    filePath: `${directory}/${fileName}`,
    fileName, mimeType, parent,
  });
});

