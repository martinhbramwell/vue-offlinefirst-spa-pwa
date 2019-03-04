const fs = require('fs');
const axios = require('axios');
const { google } = require('googleapis');

const { authorize, loadToken } = require('./auth');


const fileId = process.argv[2];
const targetPath = process.env.XDG_RUNTIME_DIR;

// process.argv.forEach(function (val, index, array) {
  // console.log(`Template path ${targetPath}`);
// });


// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), getFile);
});

/*
  https://drive.google.com/uc?export=download&id=
*/

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getFile(auth) {
  const drive = google.drive({ version: 'v3', auth });
  // const fileId = '1_pcCuWFS37TUodkl3nRiu34LVIqaez7PM6SxNgzpzBA';
  // const fileId = '1zH7Kx74kesEgVh8AtXU7BOBdGGVHWzKh';

  // const dest = fs.createWriteStream('/tmp/credentials.json');
  const options = {encoding:'utf-8', flag:'w'};

  // drive.files.export({
  //   fileId: fileId,
  //   mimeType: 'text/plain'
  drive.files.get({
    fileId: fileId
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);

    // console.log('~~~~~~');
    // console.dir(res.data);
    // console.log('~~~~~~');
    // console.dir(loadToken());
    // console.log('======');

    const instance = axios.create({
      baseURL: 'https://drive.google.com',
      headers: {'Authorization': `Bearer ${loadToken()}`}
    });
    instance.get(`/uc?export=download&id=${fileId}`)
      .then(response => {
        // console.dir(response.data);
        const filePath = `${targetPath}/${res.data.name}`;
        fs.writeFileSync(filePath, response.data, options);
        process.stdout.write(`${res.data.name}`);
        // console.log('~~~~~~');
    }).catch((err) => {
        console.log('###################');
        console.log(err.response.data);
        console.log('###################');
    });

  });

  // drive.files.export({
  //   fileId: fileId,
  //   mimeType: 'text/plain'
  // // }, (err, res) => {
  // //   if (err) return console.log('The API returned an error: ' + err);
  // //   console.dir(res.data);
  // //   // const files = res.data.files;
  // //   // if (files.length) {
  // //   //   console.log('Files:');
  // //   //   files.map((file) => {
  // //   //     console.log(`${file.name} (${file.id})`);
  // //   //   });
  // //   // } else {
  // //   //   console.log('No files were found!');
  // //   // }
  // })
  //     .on('end', function (res) {
  //       console.dir(res.data);
  //       console.log('Done');
  //     })
  //     .on('error', function (err) {
  //       console.log('Error during download', err);
  //     })
  //     .pipe(dest);
}



/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 100,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files were found!');
    }
  });
}
