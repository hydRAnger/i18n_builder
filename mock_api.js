const {Translate} = require('@google-cloud/translate');

module.exports = async (id, text, target) => {
  // const result = await googleTranslateApi(text, target);
  const result = await mockTranslateApi(text, target);

  return {id, result};
}

// To Reviewer: The real Google Translate API will be used
const googleTranslateApi = async (text, target) => {
  const translate = new Translate();
  let [translations] = await translate.translate(text, target);
  return Array.isArray(translations) ? translations.join() : translations;
}

// To Reviewer: the fake API use for this mock, I just make the chars uppercase.
const mockTranslateApi = async (text, target) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return `${text.toUpperCase()}`;
}