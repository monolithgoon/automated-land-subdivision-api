const chalk = require('chalk')

const highlight = chalk.blue.bgYellowBright.bold
const working = chalk.blue.bgGrey.bold
const waiting = chalk.blue.bgWhiteBright.bold
const running = chalk.blue.bgCyanBright.bold
// const running = chalk.blue.bgGreenBright.bold
const success = chalk.white.bgGreen.bold
const connected = chalk.white.bgBlue.bold
const fail = chalk.white.bgRed.bold
const warning  = chalk.whiteBright.bgYellow.bold

module.exports = {
   highlight,
   working,
   waiting,
   success,
   connected,
   warning,
   fail,
   running,
}