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

exports.type = "application/json";

function walkStrings(value, fn) {
	if (typeof value === "string") {
		return fn(value);
	}
	if (Array.isArray(value)) {
		for (var i = 0; i < value.length; i++) {
			var item = walkStrings(value[i], fn);
			if (item !== value[i]) {
				value[i] = item;
			}
		}
	} else if (value && typeof value === "object") {
		for (var key in value) {
			var field = walkStrings(value[key], fn);
			if (field !== value[key]) {
				value[key] = field;
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

exports.report = function(text, callback, options) {
	var data = parse(text);
	if (data === undefined) {
		return;
	}
	walkStrings(data, function(value) {
		wikitext.report(value, callback, options);
	});
};

exports.relink = function(text, fromTitle, toTitle, options) {
	var data = parse(text);
	if (data === undefined) {
		return undefined;
	}

	var changed = false,
		impossible = false;
	walkStrings(data, function(value) {
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
