const {Translate} = require('@google-cloud/translate');

// const LIMIT_CHAR_PER_REQUEST = 30000;
// const LIMIT_CHAR_PER_100_SECONDS = 100000;
const LIMIT_CHAR_PER_REQUEST = 15;
const LIMIT_CHAR_PER_100_SECONDS = 50;

const translateOnRateLimit = (target, output) => {
  return async (sourceHash) => {
    let onTranslatingCharCount = 0;
    const resultHash = {};
    const textQueue = [];
    for (let id in sourceHash) {
      textQueue.push({
        id: id,
        content: sourceHash[id]
      })
    }

    while (textQueue.length > 0) {
      const text = textQueue.shift();
      console.log(`try handle text: ${text.content}, length: ${text.content.length}`);

      if (onTranslatingCharCount + text.content.length >= LIMIT_CHAR_PER_100_SECONDS) {
        textQueue.unshift(text);
        console.log('wait...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('let us try again');
        continue;
      }
      // resultHash[text.id] = await googleTranslateApi(text.content, target);
      onTranslatingCharCount += text.content.length;
      console.log(`will request: ${text.content}`);
      resultHash[text.id] = await mockTranslateApi(text.content, target);
      console.log(`done request: ${text.content}`);
      onTranslatingCharCount -= text.content.length;
    }

    console.log(resultHash);
  };
};

const googleTranslateApi = async (text, target) => {
  const translate = new Translate();
  let [translations] = await translate.translate(text, target);
  return Array.isArray(translations) ? translations.join() : translations;
}

const mockTranslateApi= async (text, target) => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  return `Translate to ${target}: ${text.toUpperCase()}`;
}

module.exports = translateOnRateLimit;