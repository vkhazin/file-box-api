'use strict';
exports.create = function (config) {
  var logLevel = 2; //Info
  if (config.log && config.log.level) {
    logLevel = config.log.level;
  }

  return (function () {
    return {
      trace: function (msg) {
        if (logLevel >= 3) {
          console.trace(msg);
        }
      },
      info: function (msg) {
        if (logLevel >= 2) {
          console.info(msg);
        }
      },
      log: function (msg) {
        if (logLevel >= 1) {
          console.log(msg);
        }
      },
      error: function (msg) {
        if (logLevel >= 0) {
          console.error(msg)
        }
      }
    };
  }());
};