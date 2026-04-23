/*\
title: $:/plugins/uzvg/twks-giscus/widget.js
type: application/javascript
module-type: widget

Giscus comment system widget for TiddlyWiki.
\*/

(function () {
  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  var Widget = require("$:/core/modules/widgets/widget.js").widget;

  var GiscusWidget = function (parseTreeNode, options) {
    this.initialise(parseTreeNode, options);
  };

// Inherit from the base widget class
  GiscusWidget.prototype = new Widget();

// Render this widget into the DOM
  GiscusWidget.prototype.render = function (parent, nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();

    // Create a container div for giscus
    var domNode = this.document.createElement("div");
    domNode.className = "giscus-widget-container";

    parent.insertBefore(domNode, nextSibling);
    this.domNodes.push(domNode);

    // Only load in browser environment
    if (typeof window !== "undefined") {
      this.loadGiscus(domNode);
    }
  };

// Load the giscus script and initialize
  GiscusWidget.prototype.loadGiscus = function (container) {
    var self = this;

    // Remove any existing giscus instance in this container
    container.innerHTML = "";

    // Get widget attributes with defaults
    var repo = this.getAttribute("repo");
    var repoId = this.getAttribute("repoId");
    var category = this.getAttribute("category", "Announcements");
    var categoryId = this.getAttribute("categoryId", "DIC_kwDOOKXM8s4C7FiI");
    var mapping = this.getAttribute("mapping", "specific");
    var term = this.getAttribute("term", this.currentTiddler);
    var strict = this.getAttribute("strict", "1");
    var reactionsEnabled = this.getAttribute("reactionsEnabled", "1");
    var emitMetadata = this.getAttribute("emitMetadata", "0");
    var inputPosition = this.getAttribute("inputPosition", "top");
    var theme = this.getAttribute("theme", "preferred_color_scheme");
    var lang = this.getAttribute("lang", "en");
    var loading = this.getAttribute("loading", "lazy");

    // Create the script element
    var script = this.document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", mapping);
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", strict);
    script.setAttribute("data-reactions-enabled", reactionsEnabled);
    script.setAttribute("data-emit-metadata", emitMetadata);
    script.setAttribute("data-input-position", inputPosition);
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", lang);
    script.setAttribute("data-loading", loading);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    container.appendChild(script);
  };

// Compute the internal state of the widget
  GiscusWidget.prototype.execute = function () {
    this.currentTiddler = this.getVariable("currentTiddler");
  };

  /*
Selectively refresh the widget if a watched tiddler changes
*/
  GiscusWidget.prototype.refresh = function (changedTiddlers) {
    var changedAttributes = this.computeAttributes();

    // If any attribute changed, re-render
    if (Object.keys(changedAttributes).length > 0) {
      this.refreshSelf();
      return true;
    }
    return this.refreshChildren(changedTiddlers);
  };

  exports.giscus = GiscusWidget;
})();