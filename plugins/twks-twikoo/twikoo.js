/*\
title: $:/plugins/uzvg/twks-twikoo/twikoo.js
type: application/javascript
module-type: widget

Twikoo comment system widget for TiddlyWiki
\*/

(function () {
  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  var Widget = require("$:/core/modules/widgets/widget.js").widget;

  var TwikooWidget = function (parseTreeNode, options) {
    this.initialise(parseTreeNode, options);
  };

  TwikooWidget.prototype = new Widget();

  TwikooWidget.prototype.render = function (parent, nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();

    // Create the comment container
    var commentId = this.getAttribute("commentId");
    var containerElement = document.createElement("div");
    containerElement.id = commentId;

    // Insert the element into the DOM
    parent.insertBefore(containerElement, nextSibling);
    this.domNodes.push(containerElement);

    // Get twikoo widget parameters
    var envId = this.getAttribute("envId", "");
    var region = this.getAttribute("region", "ap-shanghai");
    var path = this.getAttribute("path", this.currentTiddler);
    var lang = this.getAttribute("lang", "zh-CN");

    if (window.twikooLoader) {
      window.twikooLoader.ready(function (twikoo) {
        // 防止重复初始化
        if (containerElement._twikooLoaded) return;
        containerElement._twikooLoaded = true;

        try {
          twikoo.init({
            // Use the element directly to avoid invalid CSS selectors
            el: containerElement,
            envId: envId,
            region: region,
            path: path,
            lang: lang,
          });
          console.log("twikoo inited")
        } catch (e) {
          console.error("Twikoo init error:", e);
        }
      });
    } else {
      containerElement.appendChild(
        document.createTextNode("Twikoo loader not found"),
      );
    }
  };

  TwikooWidget.prototype.execute = function () {
    this.currentTiddler = this.getVariable("currentTiddler");
  };

  TwikooWidget.prototype.refresh = function (changedTiddlers) {
    var changedAttributes = this.computeAttributes();

    // 任意属性变化 → 重渲染
    var attributes = ["commentId", "envId", "region", "path", "lang"];
    if (
      attributes.find(function (attr) {
        return $tw.utils.hop(changedAttributes, attr);
      })
    ) {
      this.refreshSelf();
      return true;
    }

    return false;
  };
  exports.twikoo = TwikooWidget;
})();
