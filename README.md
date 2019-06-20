# i18n_builder


## Prepare
Make sure [Node.js](https://nodejs.org/en/) has been currectlly installed([nvm](https://github.com/nvm-sh/nvm) will be helpful).

Then:
```bash
$ npm install
```
or use [yarn](https://yarnpkg.com/en/)
```bash
$ yarn install
```

## How to use
```
$ node index.js build -t 'target_language' -i 'input' -o 'output'
# -t, --target: 'target_language, default: jp'
# -i, --input: 'input source html file, required'
# -o, --output: 'output translated file, default:output_jp.json'
```
### Example:
```
$ node index.js build -t jp -i ./sample.html -o output.json
```
