import app from './app';
import { logDir, logger as LG } from './utils'; // eslint-disable-line no-unused-vars

const { PORT = 3001 } = process.env;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // eslint-disable-line no-console
