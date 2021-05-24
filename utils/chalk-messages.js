const chalk = require('chalk')

const highlight = chalk.blue.bgYellowBright.bold
const console = chalk.yellowBright.bgBlack.bold
const result = chalk.yellowBright.bgCyan.bold
// const result = chalk.blueBright.bgCyanBright.bold
const working = chalk.blueBright.bgGrey.bold
const interaction = chalk.blue.bgWhiteBright.bold
const running = chalk.blue.bgCyanBright.bold
// const called = chalk.blue.bgGreenBright.bold
const success = chalk.white.bgGreen.bold
const connected = chalk.white.bgBlue.bold
// const connected = chalk.whiteBright.bgBlueBright.bold
const fail = chalk.white.bgRed.bold
const warning  = chalk.whiteBright.bgYellow.bold
const warningBright  = chalk.yellowBright.bgYellow.bold
const warningStrong  = chalk.redBright.bgYellow.bold

module.exports = {
   highlight,
   console,
   result,
   working,
   interaction,
   running,
   // called,
   success,
   connected,
   fail,
   warning,
   warningBright,
   warningStrong,
}