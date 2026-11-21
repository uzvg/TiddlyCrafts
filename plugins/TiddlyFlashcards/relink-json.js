/*\
title: $:/plugins/uzvg/TiddlyFlashcards/Relink/JSON
type: application/javascript
module-type: relinktext

Relinks tiddler titles inside JSON data tiddlers, such as the card fields
stored by TiddlyFlashcards.

\*/

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var wikitext = require("$:/plugins/flibbles/relink/js/fieldtypes/wikitext.js");

var FILTER_CONFIG = "$:/config/TiddlyFlashcards/Relink/Filter",
	FIELDS_CONFIG = "$:/config/TiddlyFlashcards/Relink/Fields",
	DEFAULT_FILTER = "[prefix[$:/Storage/TiddlyFlashcards/DataTiddlers/]]",
	DEFAULT_FIELDS = "fields/*";

exports.type = "application/json";

// The cache is cleared by TiddlyWiki whenever any tiddler changes.
function selectedTiddlers(wiki) {
	return wiki.getGlobalCache("TiddlyFlashcards/relinkJSON/selected", function() {
		var selected = Object.create(null),
			filter = wiki.getTiddlerText(FILTER_CONFIG) || DEFAULT_FILTER;
		try {
			$tw.utils.each(wiki.filterTiddlers(filter), function(title) {
				selected[title] = true;
			});
		} catch (e) {
			// A broken filter must not break renaming.
		}
		return selected;
	});
}

function fieldPatterns(wiki) {
	return wiki.getGlobalCache("TiddlyFlashcards/relinkJSON/fields", function() {
		var patterns = $tw.utils.parseStringArray(wiki.getTiddlerText(FIELDS_CONFIG) || DEFAULT_FIELDS);
		return patterns && patterns.length ? patterns : $tw.utils.parseStringArray(DEFAULT_FIELDS);
	});
}

function matches(path, pattern) {
	var parts = pattern.split("/");
	if (parts.length > path.length) {
		return false;
	}
	var offset = path.length - parts.length;
	for (var i = 0; i < parts.length; i++) {
		if (parts[i] !== "*" && parts[i] !== path[offset + i]) {
			return false;
		}
	}
	return true;
}

function shouldRelink(path, patterns) {
	for (var i = 0; i < patterns.length; i++) {
		if (patterns[i] === "*" || matches(path, patterns[i])) {
			return true;
		}
	}
	return false;
}

// A plugin tiddler also has type application/json, but its text is a bundle of
// tiddlers rather than card data. Never treat it as card data.
function isPluginBundle(data) {
	return data && typeof data === "object" && !Array.isArray(data)
		&& data.tiddlers && typeof data.tiddlers === "object"
		&& !Array.isArray(data.tiddlers);
}

function walk(value, path, fn) {
	if (typeof value === "string") {
		return fn(value, path);
	}
	if (Array.isArray(value)) {
		// Array indices are not part of the path, so fields/* covers arrays too.
		for (var i = 0; i < value.length; i++) {
			value[i] = walk(value[i], path, fn);
		}
	} else if (value && typeof value === "object") {
		for (var key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				value[key] = walk(value[key], path.concat(key), fn);
			}
		}
	}
	return value;
}

function parse(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		return undefined;
	}
}

function isSelected(options) {
	return options && options.wiki
		&& options.settings && typeof options.settings.title === "string"
		&& selectedTiddlers(options.wiki)[options.settings.title];
}

// Check the cheap title gate before parsing; plugin bundles are still JSON.
function cardData(text, options) {
	if (!isSelected(options)) {
		return undefined;
	}
	var data = parse(text);
	return data !== undefined && !isPluginBundle(data) ? data : undefined;
}

exports.report = function(text, callback, options) {
	var data = cardData(text, options);
	if (data === undefined) {
		return;
	}
	var patterns = fieldPatterns(options.wiki);
	walk(data, [], function(value, path) {
		if (shouldRelink(path, patterns)) {
			wikitext.report(value, callback, options);
		}
		return value;
	});
};

exports.relink = function(text, fromTitle, toTitle, options) {
	var data = cardData(text, options);
	if (data === undefined) {
		return undefined;
	}

	var patterns = fieldPatterns(options.wiki),
		changed = false,
		impossible = false;
	walk(data, [], function(value, path) {
		if (!shouldRelink(path, patterns)) {
			return value;
		}
		var entry = wikitext.relink(value, fromTitle, toTitle, options);
		if (entry) {
			if (entry.impossible) {
				impossible = true;
			}
			if (entry.output !== undefined) {
				changed = true;
				return entry.output;
			}
		}
		return value;
	});

	if (!changed && !impossible) {
		return undefined;
	}

	var result = {impossible: impossible};
	if (changed) {
		// Keep the existing indentation; TiddlyFlashcards saves with format:json[2]
		var indent = text.match(/\n([ \t]+)"/);
		result.output = JSON.stringify(data, null, indent ? indent[1] : undefined);
	}
	return result;
};
