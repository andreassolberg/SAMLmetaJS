(function($) {
	var addLanguageSelect = function (randID, lang, suffix) {
		var languageFound = false, result = [], language, checked;
		result.push('<select name="' + randID + '-lang-' + suffix + '" id="' + randID + '-lang">');
		for (language in SAMLmetaJS.Constants.languages) {
			if (SAMLmetaJS.Constants.languages.hasOwnProperty(language)) {
				checked = '';
				if (lang === language) {
					checked = ' selected="selected" ';
					languageFound = true;
				}
				result.push('<option value="' + language + '" ' + checked + '>');
				result.push(SAMLmetaJS.Constants.languages[language]);
				result.push('</option>');
			}
		}

		if (!languageFound) {
			result.push('<option value="' + lang + '" selected="selected">Unknown language (' + lang + ')</option>');
		}

		result.push('</select>');
		return result.join('');
	};

	var UI = {
		"clearInfoname": function() {
			$("div#info div#infoname").empty();
		},
		"clearInfodescr": function() {
			$("div#info div#infodescr").empty();
		},
		"clearInfokeywords": function () {
			$("div#info div#infokeywords").empty();
		},
		"addInfoname": function(lang, name) {
			var randID = 'infoname' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infonamediv">';
			infoHTML += addLanguageSelect(randID, lang, 'name');
			infoHTML += '<input type="text" name="' + randID + '-name-name" id="' + randID + '-name" value="' + (name || '') + '" />' +
				'<button style="" class="removename">Remove</button>' +
				'</div>';

			$(infoHTML).appendTo("div#info div#infoname").find('button.removename').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.infonamediv').remove();
			});
		},
		"addInfodescr": function(lang, descr) {
			var randID = 'infodescr' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infodescrdiv"><div>';
			infoHTML += addLanguageSelect(randID, lang, 'descr');
			infoHTML += '<button style="" class="removedescr">Remove</button>' +
				'</div><div>' +
				'<textarea name="' + randID + '-name-name" id="' + randID + '-name">' + (descr || '') + '</textarea>' +
				'</div></div>';

			$(infoHTML).appendTo("div#info div#infodescr").find('button.removedescr').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.infodescrdiv').remove();
			});
		},
		"addInfokeywords": function (lang, keywords) {
			var randID = 'infokeywords' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infokeywordsdiv">';
			infoHTML += addLanguageSelect(randID, lang, 'keywords');
			infoHTML += '<input type="text" name="' + randID + '-name-name" id="' + randID + '-name" value="' + (keywords || '') + '" />' +
				'<button style="" class="removekeywords">Remove</button>' +
				'</div>';

			$(infoHTML).appendTo("div#info div#infokeywords").find('button.removekeywords').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.infokeywordsdiv').remove();
			});
		}
	};

	SAMLmetaJS.plugins.info = {
		tabClick: function (handler) {
			handler($("a[href='#info']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#info">Information</a></li>');
			pluginTabs.content.push(
				'<div id="info">' +
					'<fieldset class="entityid"><legend>Entity ID</legend>' +
						'<div id="div-entityid">' +
							'<input style="width: 600px" type="text" name="entityid" id="entityid" value="" />' +
							'<p style="margin: 0px">The format MUST be an URI.</p>' +
						'</div>' +
					'</fieldset>' +

					'<fieldset class="name"><legend>Name of Service</legend>' +
						'<div id="infoname"></div>' +
						'<div>' +
							'<button class="addname">Add name in one more languages</button>' +
						'</div>' +
					'</fieldset>' +

					'<fieldset class="description"><legend>Description of Service</legend>' +
						'<div id="infodescr"></div>' +
						'<div>' +
							'<button class="adddescr">Add description in one more languages</button>' +
						'</div>' +
					'</fieldset>' +

					'<fieldset class="keywords"><legend>Keywords (space separated)</legend>' +
						'<div id="infokeywords"></div>' +
						'<div>' +
							'<button class="addkeywords">Add keywords in one more languages</button>' +
						'</div>' +
					'</fieldset>' +

				'</div>'
			);
		},

		setUp: function () {
			$("div#info button.addname").click(function(e) {
				e.preventDefault();
				UI.addInfoname('en', '');
			});
			$("div#info button.adddescr").click(function(e) {
				e.preventDefault();
				UI.addInfodescr('en', '');
			});
			$("div#info button.addkeywords").click(function(e) {
				e.preventDefault();
				UI.addInfokeywords('en', '');
			});
		},

		fromXML: function (entitydescriptor) {
			var l;

			// Add name, description and keywords
			UI.clearInfoname();
			if (entitydescriptor.name) {
				for (l in entitydescriptor.name) {
					if (entitydescriptor.name.hasOwnProperty(l)) {
						UI.addInfoname(l, entitydescriptor.name[l]);
					}
				}
			}

			UI.clearInfodescr();
			if (entitydescriptor.descr) {
				for (l in entitydescriptor.descr) {
					if (entitydescriptor.descr.hasOwnProperty(l)) {
						UI.addInfodescr(l, entitydescriptor.descr[l]);
					}
				}
			}

			UI.clearInfokeywords();
			if (entitydescriptor.saml2sp
				&& entitydescriptor.saml2sp.mdui
				&& entitydescriptor.saml2sp.mdui.keywords) {
				for (l in entitydescriptor.saml2sp.mdui.keywords) {
					if (entitydescriptor.saml2sp.mdui.keywords.hasOwnProperty(l)) {
						UI.addInfokeywords(l, entitydescriptor.saml2sp.mdui.keywords[l]);
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#infoname > div').each(function (index, element) {
				var value = $(element).children('input').attr('value');
				if (!value) {
					return;
				}
				if (!entitydescriptor.name) entitydescriptor.name = {};
				entitydescriptor.name[$(element).children('select').val()] = value;
			});
			$('div#infodescr > div').each(function (index, element) {
				var value = $(element).find('div > textarea').val();
				if (!value) {
					return;
				}
				if (!entitydescriptor.descr) entitydescriptor.descr = {};
				entitydescriptor.descr[$(element).find('div > select').val()] = value;
			});
			$('div#infokeywords > div').each(function (index, element) {
				var value = $(element).children('input').attr('value');
				if (!value) {
					return;
				}
				if (!entitydescriptor.saml2sp) {
					entitydescriptor.saml2sp = {};
				}
				if (!entitydescriptor.saml2sp.mdui) {
					entitydescriptor.saml2sp.mdui = {};
				}
				if (!entitydescriptor.saml2sp.mdui.keywords) {
					entitydescriptor.saml2sp.mdui.keywords = {};
				}
				entitydescriptor.saml2sp.mdui.keywords[$(element).children('select').val()] = value;
			});
		}
	};

}(jQuery));
