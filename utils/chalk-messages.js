const chalk = require('chalk')

const highlight = chalk.blue.bgYellowBright.bold
const consoleYlow = chalk.yellow.bgBlack.bold
const consoleY = chalk.yellowBright.bgBlack.bold
const consoleB = chalk.blueBright.bgBlack.bold
const consoleG = chalk.green.bgBlack.bold
const consoleGy = chalk.grey.bgBlack.bold
const result = chalk.yellowBright.bgCyan.bold
const working = chalk.blueBright.bgGrey.bold
const interaction = chalk.blue.bgWhiteBright.bold
const running = chalk.blue.bgGreenBright.bold
const success = chalk.yellowBright.bgBlue.bold
const connected = chalk.white.bgBlue.bold
const fail = chalk.white.bgRed.bold
const warning  = chalk.whiteBright.bgYellow.bold
const warningBright  = chalk.yellowBright.bgYellow.bold
const warningStrong  = chalk.redBright.bgYellow.bold

module.exports = {
   highlight,
   consoleYlow,
   consoleY,
   consoleB,
   consoleG,
   consoleGy,
   result,
   working,
   interaction,
   running,
   running,
   success,
   connected,
   fail,
   warning,
   warningBright,
   warningStrong,
}