/*\
title: $:/plugins/uzvg/twks-twikoo/startup.js
type: application/javascript
module-type: startup

twikoo initialisation

\*/

"use strict";

// Export name and synchronous status
exports.name = "twks-twikoo";
exports.before = ["startup"];
exports.synchronous = true;

exports.startup = function () {
  var logger = new $tw.utils.Logger("twks-twikoo");
  if ($tw.browser && !window.twikoo) {
    logger.alert(
      "The plugin 'twks-twikoo' is disabled until this wiki is saved and reloaded again",
    );
  }
};
