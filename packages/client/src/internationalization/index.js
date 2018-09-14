/* eslint-disable no-console */
import es from './es';
import en from './en';

const languages = [
  es,
  en,
];

const translations = {
};

languages.forEach((lang) => {
  // console.log(`----- >  ${lang.sub[0].id}`);
  lang.sub.forEach((dialect) => {
    translations[dialect.id] = dialect;
  });
  translations[lang.id] = lang;
});


export default translations;
