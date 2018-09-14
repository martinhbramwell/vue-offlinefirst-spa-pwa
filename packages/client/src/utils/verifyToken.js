import jwt from 'jsonwebtoken';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const verify = (token) => {
  const tkn = jwt.decode(token);
  LG(tkn);
  return tkn;
};

export default verify;
