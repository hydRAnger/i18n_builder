const fs = require('fs');

const api = require('./mock_api');

const QUOTA_DURATION = 100; // 100 seconds for API quota duration
const LIMIT_CHAR_PER_REQUEST = 30000;
const LIMIT_CHAR_PER_100_SECONDS = 100000;

module.exports = (target, output) => {
  return async (sourceHash) => {
    let onTranslatingCharCount = 0; // count chars that were translating
    const resultHash = {};
    const textQueue = [];

    console.log(sourceHash);
    for (let id in sourceHash) {
      textQueue.push({
        id: id,
        content: sourceHash[id]
      })
    }

    while (textQueue.length > 0) {
      const text = textQueue.shift();
      /* To Reviewer: if length of text is exceed the limit of request body size, it will be split and handle part by part.
      (I think this situation is rare, maybe for some long article?)
      
      About how to split the text, if we sliced by length or space, I'm worried that will change the meaning when translate it.
      So I try to split it by sentence, but it's inefficient because that will generate too many fragments.
      I think I can optimize it
      From:
      'aaa. bbb. ccc. ddd.' => ['aaa', 'bbb', 'ccc', 'ddd']
      To:
      'aaa. bbb. ccc. ddd.' => ['aaa. bbb.', 'ccc. ddd']
      I mean try to split it near the middle.

      I'm looking forward to get your advice!~
      */
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

      // To Reviewer: check if it's already exceed the quota, we'll try again later.
      if (onTranslatingCharCount + text.content.length > LIMIT_CHAR_PER_100_SECONDS) {
        textQueue.unshift(text);
        await new Promise(resolve => setTimeout(resolve, QUOTA_DURATION * 1000));
        continue;
      }

      onTranslatingCharCount += text.content.length;
      try {
        const { id, result } = await api(text.id, text.content, target);
        resultHash[id] = resultHash[id]
          ? resultHash[id] + `.${result}`
          : result;
      } catch (error) {
        // To Reviewer: check if it's already exceed the quota, we'll try again later.
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
  // To Reivew: I write output to a JSON file, but we can change it later.
  fs.writeFile(output, JSON.stringify(resultHash).toString(), (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Done.');
      console.log(resultHash);
    }
  });
};