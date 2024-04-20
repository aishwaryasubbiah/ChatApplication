const moment = require('moment');

function formatMessage(username, textmsg) {
   return {
    username,
    textmsg,
    time: moment().format('h:mm a')
   };
}

module.exports = formatMessage;