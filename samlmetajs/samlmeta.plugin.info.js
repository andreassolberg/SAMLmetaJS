(function($) {
	var refreshLogo = function ($logodiv) {
		var $inputs = $logodiv.find('input'),
			attrs = {
				src: $inputs.eq(0).val(),
				width: $inputs.eq(1).val(),
				height: $inputs.eq(2).val()
			};
		$logodiv.find('img').attr(attrs).parent('a').attr('href', attrs.src);
	},
		addLanguageSelect = function (randID, lang, suffix) {
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
		"clearInfologo": function() {
			$("div#info div#infologo").empty();
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
		"addInfologo": function(lang, logo) {
			var randID = 'infologo' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infologodiv"><div>';
			infoHTML += addLanguageSelect(randID, lang, 'logo');
			infoHTML += '<input type="url" name="logo-' + randID + '-location-name" id="logo-' + randID + '-location" value="' + (logo.location ||'') + '" />' +
				'<button class="removelogo">Remove</button>' +
				'</div>' +

				'<div>' +
				'<figure class="logopreview">' +
				'<figcaption>Logo preview <button class="refresh">Refresh</button></figcaption>' +
				'<a href="' + (logo.location || '#') + '">' +
				'<img src="' + (logo.location || '') + '" width="' + (logo.width || '') + '" height="' + (logo.height || '') + '" alt="Logo preview" />' +
				'</a>' +

				'</figure>' +
				'<label for="logo-' + randID + '-width">Width: </label>' +
				'<input type="number" min="0" name="logo-' + randID + '-width-name" id="logo-' + randID + '-width" value="' + (logo.width ||'') + '" />' +
				'</div>' +

				'<div>' +
				'<label for="logo-' + randID + '-height">Height: </label>' +
				'<input type="number" min="0" name="logo-' + randID + '-height-name" id="logo-' + randID + '-height" value="' + (logo.height ||'') + '" />' +
				'</div>' +

				'</div>';

			$(infoHTML).appendTo("div#info div#infologo")
				.find('button.removelogo').click(function (e) {
					e.preventDefault();
					$(e.target).closest('div.infologodiv').remove();
				}).end()
				.find('button.refresh').click(function (e) {
					refreshLogo($(this).parents('div.infologodiv'));
					e.preventDefault();
				}).end()
				.find('input').change(function (e) {
					refreshLogo($(this).parents('div.infologodiv'));
				}).end()
				.find('img').load(function (e) {
					var $div = $(this).parents('div.infologodiv'),
						$width = $div.find('input').eq(1),
						$height = $div.find('input').eq(2);

					if (!$width.val()) {
						$width.val(this.width);
					}
					if (!$height.val()) {
						$height.val(this.height);
					}
				});
		}
	};

	SAMLmetaJS.plugins.info = {
		tabClick: function (handler) {
			handler($("a[href='#info']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#info">Information</a></li>');
			pluginTabs.content.push([
				'<div id="info">',

				'<fieldset class="entityid"><legend>Entity ID</legend>',
				'<div id="div-entityid">',
				'<input style="width: 600px" type="text" name="entityid" id="entityid" value="" />',
				'<p style="margin: 0px">The format MUST be an URI.</p>',
				'</div>',
				'</fieldset>',

				'<fieldset class="name"><legend>Name of Service</legend>',
				'<div id="infoname"></div>',
				'<div>',
				'<button class="addname">Add name in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="description"><legend>Description of Service</legend>',
				'<div id="infodescr"></div>',
				'<div>',
				'<button class="adddescr">Add description in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="logo"><legend>Logo of Service</legend>',
				'<div id="infologo"></div>',
				'<div>',
				'<button class="addlogo">Add logo in one more language</button>',
				'</div>',
				'</fieldset>',

				'</div>'
			].join(''));
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
			$("div#info button.addlogo").click(function(e) {
				e.preventDefault();
				UI.addInfologo('en', '');
			});
		},

		fromXML: function (entitydescriptor) {
			var l;

			// Add name and description
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

			UI.clearInfologo();
			if (entitydescriptor.hasLogo()) {
				for (l in entitydescriptor.saml2sp.mdui.logo) {
					if (entitydescriptor.saml2sp.mdui.logo.hasOwnProperty(l)) {
						UI.addInfologo(l, entitydescriptor.saml2sp.mdui.logo[l]);
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
			$('div#infologo > div').each(function (index, element) {
				var $inputs = $(element).find('input'),
					location = $inputs.eq(0).val(),
					width = $inputs.eq(1).val(),
					height = $inputs.eq(2).val(),
					lang = $(element).find('div > select').val();
				if (!location || !width || !height) {
					return;
				}
				entitydescriptor.addLogo(lang, location, width, height);
			});
		}
	};

}(jQuery));
