const {Translate} = require('@google-cloud/translate');

module.exports = async (id, text, target) => {
  // const result = await googleTranslateApi(text, target);
  const result = await mockTranslateApi(text, target);

  return {id, result};
}

const googleTranslateApi = async (text, target) => {
  const translate = new Translate();
  let [translations] = await translate.translate(text, target);
  return Array.isArray(translations) ? translations.join() : translations;
}

const mockTranslateApi = async (text, target) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return `${text.toUpperCase()}`;
}