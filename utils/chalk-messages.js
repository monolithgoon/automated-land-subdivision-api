const chalk = require('chalk')

const highlight = chalk.blue.bgYellowBright.bold
// const result = chalk.whiteBright.bgBlackBright.bold
const working = chalk.blue.bgGrey.bold
const interaction = chalk.blue.bgWhiteBright.bold
const running = chalk.blue.bgCyanBright.bold
// const called = chalk.blue.bgGreenBright.bold
const success = chalk.white.bgGreen.bold
const connected = chalk.white.bgBlue.bold
const fail = chalk.white.bgRed.bold
const warning  = chalk.whiteBright.bgYellow.bold

module.exports = {
   highlight,
   // result,
   working,
   interaction,
   success,
   connected,
   warning,
   fail,
   running,
   // called,
}