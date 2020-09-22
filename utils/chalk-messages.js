const chalk = require('chalk')
const highlight = chalk.white.bgYellow.bold
const working = chalk.blue.bgGrey.bold
const success = chalk.white.bgGreen.bold
const connected = chalk.white.bgBlue.bold
const warning = chalk.white.bgYellow.bold
const fail = chalk.white.bgRed.bold

module.exports = {
   highlight,
   working,
   success,
   connected,
   warning,
   fail,
}