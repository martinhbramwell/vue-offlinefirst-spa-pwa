const fs = require('fs');
const axios = require('axios');
const { google } = require('googleapis');

const { authorize, loadToken } = require('./auth');


const fileId = process.argv[2];
const fileName = process.argv[3];
const targetPath = process.env.XDG_RUNTIME_DIR;


// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), getFile);
});

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getFile(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const options = {encoding:'utf-8', flag:'w'};

  drive.files.get({
    fileId: fileId,
    alt: 'media'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    process.stdout.write(fileName);
    const filePath = `${targetPath}/${fileName}`;
    fs.writeFileSync(filePath, res.data, options);
    // process.stdout.write(res.data);
  });

  // const refresh = axios.create({
  //   baseURL: 'https://www.googleapis.com'
  // });

  // refresh.post('/oauth2/v4/token', {
  //   client_id: '732623326397-ltpdkb5jok2tbn44lk74vq69f3nqfqsa.apps.googleusercontent.com',
  //   client_secret: 'o-xwcn45CLH93-vG4EWo31sU',
  //   refresh_token: '1/pBp5NBapwfaJ2HSLeb-2WDKkRtKRuHut9-pKzG6EeFo',
  //   grant_type: 'refresh_token'
  // }).then(response => {
  //     console.log('~~~~~~  Refreshment ~~~~~~');
  //     console.dir(response.data);
  // }).catch((err) => {
  //     console.log('######## Secrets Collector Error ###########');
  //     console.log(err.response.data);
  //     console.log(loadToken());
  //     console.log('########           - o 0 o -     ###########');
  // });

  // const instance = axios.create({
  //   baseURL: 'https://www.googleapis.com/drive/v3/files',
  //   headers: {'Authorization': `Bearer ${loadToken()}`}
  // });

  // instance.get(`/${fileId}?alt=media`)
  //   .then(response => {
  //     console.log('~~~~~~');
  //     console.dir(response.data);
  //     // const filePath = `${targetPath}/${res.data.name}`;
  //     // fs.writeFileSync(filePath, response.data, options);
  //     // process.stdout.write(`${res.data.name}`);
  //     // process.stdout.write(response.data);
  //     // console.log('~~~~~~');
  // }).catch((err) => {
  //     console.log('######## Secrets Collector Error ###########');
  //     console.log(err.response.data);
  //     console.log(loadToken());
  //     console.log('########           - o 0 o -     ###########');
  // });

  // drive.files.get({
  //   fileId: fileId,
  //   alt: 'media'
  // }, (err, res) => {
  //   if (err) return console.log('The API returned an error: ' + err);
  //   // const spec = {
  //   //   content: res.data
  //   // }
  //   process.stdout.write(fileName);
  //   process.stdout.write(res.data);

  //   // console.log('~~~~~~');
  //   // console.dir(res);
  //   // console.log('###############################################');


  // //   // console.dir(res.data);
  // //   // console.log('~~~~~~');
  // //   // console.dir(loadToken());
  // //   // console.log('======');

  // //   // const instance = axios.create({
  // //   //   baseURL: 'https://drive.google.com',
  // //   //   headers: {'Authorization': `Bearer ${loadToken()}`}
  // //   // });

  // //   // instance.get(`/uc?export=download&id=${fileId}`)
  // //   //   .then(response => {
  // //   //     console.log('~~~~~~');
  // //   //     console.dir(response);
  // //   //     const filePath = `${targetPath}/${res.data.name}`;
  // //   //     fs.writeFileSync(filePath, response.data, options);
  // //   //     process.stdout.write(`${res.data.name}`);
  // //   //     // console.log('~~~~~~');
  // //   // }).catch((err) => {
  // //   //     console.log('######## Secrets Collector Error ###########');
  // //   //     console.log(err.response.data);
  // //   //     console.log(loadToken());
  // //   //     console.log('########           - o 0 o -     ###########');
  // //   // });

  // });

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
