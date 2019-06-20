const htmlparser = require("htmlparser2");
const crypto = require("crypto");

const MD5_ID_LENGTH = 12;

module.exports = (html, callback) => {
  const textHash = {};
  /* To Reviewer: for convenient, I choose htmlparser2 to parse HTML.
  All text in HTML and alt, title attribute will be extracted.
  This may extract some nesting tag, but Google's document says: 'Cloud Translation API does not translate any HTML tags in the input, only text that appears between the tags.'
  And I've done some experiments, so it seems ok.
  */
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

/* To Reviewer: I use text itself to generate md5 and slice 12 chars as the ID.
About the magic number '12', I just guess.
I'm looking forward to get your advice!~
*/
const hashFunction = str => {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .slice(0, MD5_ID_LENGTH);
};
