const fs = require('fs');

const api = require('./mock_api');

const QUOTA_DURATION = 100; // 100 seconds for API quota duration
const LIMIT_CHAR_PER_REQUEST = 30000;
const LIMIT_CHAR_PER_100_SECONDS = 100000;

const translateOnRateLimit = (target, output) => {
  return async (sourceHash) => {
    console.log(sourceHash);
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

      if (text.content.length > LIMIT_CHAR_PER_REQUEST) {
        const sentences = text.content.split('.');
        sentences.reverse().forEach(sentence => {
          textQueue.unshift({
            id: text.id,
            content: sentence
          });
        });
        continue;
      }

      if (onTranslatingCharCount + text.content.length > LIMIT_CHAR_PER_100_SECONDS) {
        textQueue.unshift(text);
        await new Promise(resolve => setTimeout(resolve, QUOTA_DURATION * 1000));
        continue;
      }

      onTranslatingCharCount += text.content.length;
      try {
        const { id, result } = await api(text.id, text.content, target);
        resultHash[id] = resultHash[id]
          ? resultHash[id] + result
          : result;
      } catch (error) {
        if (error.status === 403 && error.message === 'User Rate Limit Exceeded') {
          textQueue.unshift(text);
          await new Promise(resolve => setTimeout(resolve, QUOTA_DURATION * 1000));
          continue;
        }
      }
      onTranslatingCharCount -= text.content.length;
    }

    writeOutput(resultHash, output);
  };
};

const writeOutput = (resultHash, output) => {
  fs.writeFile(output, JSON.stringify(resultHash).toString(), (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Done.');
      console.log(resultHash);
    }
  });
};

module.exports = translateOnRateLimit;