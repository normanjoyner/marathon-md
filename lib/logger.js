var winston = require("winston");
var logger = new(winston.Logger);

logger.add(winston.transports.Console, {
    colorize: true
});

module.exports = {
    log: function(level, message){
        logger.log(level, message);
    }
}
