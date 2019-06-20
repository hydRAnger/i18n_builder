const program = require("commander");
var pkg = require("./package.json");

const extract = require("./extract");
const translate = require("./translate");
const fs = require("fs");

program
  .version(pkg.version)
  .description("i18n builder")
  .command("build")
  .option("-i --input <input>", "source file")
  .option("-t --target <target>", "target language", "jp")
  .option("-o --output [output]", "output file", "./output_jp.json")
  .action(options => {
    if (!options.input) {
      console.error("Please set input file: -i <path>");
      return;
    }
    fs.readFile(options.input, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // generate instance of translator based on target language and output path.
        const translator = translate(options.target, options.output);
        extract(data, translator);
      }
    });
  });

program.parse(process.argv);
