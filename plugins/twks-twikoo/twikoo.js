/*\
title: $:/plugins/uzvg/twks-twikoo/widget.js
type: application/javascript
module-type: widget

Twikoo widget

\*/

"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var TwikooWidget = function (parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
};

TwikooWidget.prototype = new Widget();

/*
支持的属性（注意：不包含 el）
*/
var attributes = ["envId", "region", "path", "lang"];

/*
Render
*/
TwikooWidget.prototype.render = function (parent, nextSibling) {
  var self = this;

  this.parentDomNode = parent;
  this.computeAttributes();

  // ✅ 唯一容器（也是挂载点）
  var container = this.document.createElement("div");
  container.className = "twks-twikoo";

  parent.insertBefore(container, nextSibling);
  this.domNodes.push(container);

  // SSR 直接退出
  if (this.document.isTiddlyWikiFakeDom) {
    return;
  }

  // 收集参数
  var options = {};
  attributes.forEach(function (attr) {
    var value = self.getAttribute(attr);
    if (value) {
      options[attr] = value;
    }
  });

  // ✅ 强制使用 container 作为挂载点
  options.el = container;

  // ❗默认 path（非常建议）
  if (!options.path) {
    options.path = this.getVariable("currentTiddler");
  }

  // 使用 loader
  if (window.twikooLoader) {
    console.log("TwikooWidget render");
    window.twikooLoader.ready(function (twikoo) {
      // 防重复初始化
      if (container._twikooLoaded) return;
      container._twikooLoaded = true;
      console.log("Twikoo ready");

      console.log("container:", container);
      console.log("isInDOM:", document.body.contains(container));
      try {
        twikoo.init(options);
      } catch (e) {
        console.error("Twikoo init error:", e);
      }
    });
  } else {
    container.appendChild(
      this.document.createTextNode("Twikoo loader not found"),
    );
  }
};

/*
refresh
*/
TwikooWidget.prototype.refresh = function (changedTiddlers) {
  var changedAttributes = this.computeAttributes();

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
