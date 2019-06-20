const htmlparser = require("htmlparser2");
const crypto = require("crypto");

const MD5_ID_LENGTH = 12;

module.exports = (html, callback) => {
  const textHash = {};
  const parser = new htmlparser.Parser(
    {
      ontext: rawText => {
        const text = rawText.trim();
        if (text && text !== "\n") {
          textHash[hashFunction(text)] = text;
        }
      },
      onattribute: (name, value) => {
        if (["alt", "title"].indexOf(name) !== -1) {
          textHash[hashFunction(value)] = value;
        }
      }
    },
    { decodeEntities: false }
  );
  parser.write(html);
  parser.end();

  callback && callback(textHash);
};

const hashFunction = str => {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .slice(0, MD5_ID_LENGTH);
};
