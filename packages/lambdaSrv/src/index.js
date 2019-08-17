import app from './app';
import { logDir, logger as LG } from './utils'; // eslint-disable-line no-unused-vars

const { PORT = 3001, AMBIENTE } = process.env;
/* eslint-disable no-console */
app.listen(PORT, () => console.log(`
 * * *   Listening on port: ${PORT}.   Test/Production mode: ${AMBIENTE}.   * * *
`));
