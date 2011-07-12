(function($) {
	var UI = {
		clearOrganizationLocalizations: function() {
			$("div#organization > div.content").empty();
		},
		addOrganizationLocalization: function(lang, info) {
			var randID = Math.floor(Math.random() * 10000 + 1000);
			var organizationHTML = '<fieldset><legend>Localized organization</legend>' +
					'<div>' +
					'<label for="organization-' + randID + '-lang">Language: </label>' +
					'<select name="organization-' + randID + '-lang" id="organization-' + randID + '-lang">';
			var language, checked, languageFound = false;

			for (language in SAMLmetaJS.Constants.languages) {
				if (SAMLmetaJS.Constants.languages.hasOwnProperty(language)) {
					checked = '';
					if (lang === language) {
						checked = ' selected="selected" ';
						languageFound = true;
					}
					organizationHTML += '<option value="' + language + '" ' + checked + '>' +
						SAMLmetaJS.Constants.languages[language] +
						'</option>';
				}
			}
			if (!languageFound) {
				organizationHTML += '<option value="' + lang + '" selected="selected">Unknown language (' + lang + ')</option>';
			}

			organizationHTML += '</select>' +
				'</div>' +

				'<div class="contactfield">' +
					'<label for="organization-' + randID + '-name">Name: </label>' +
					'<input type="text" name="organization-' + randID + '-name" id="organization-' + randID + '-name" value="' + (info.name || '') + '" />' +
				'</div>' +

				'<div class="contactfield">' +
					'<label for="organization-' + randID + '-displayname">Display name: </label>' +
					'<input type="text" name="organization-' + randID + '-displayname" id="organization-' + randID + '-displayname" value="' + (info.displayName || '') + '" />' +
				'</div>' +

				'<div class="contactfield">' +
					'<label for="organization-' + randID + '-URL">URL: </label>' +
					'<input type="text" name="organization-' + randID + '-URL" id="organization-' + randID + '-URL" value="' + (info.URL || '')+ '" />' +
				'</div>' +

				'<button style="display: block; clear: both" class="remove">Remove</button>' +

			'</fieldset>';

			$(organizationHTML).appendTo("div#organization > div.content").find('button.remove').click( function(e) {
				e.preventDefault();
				$(e.target).closest('fieldset').remove();
			});
		}
	};

	SAMLmetaJS.plugins.organization = {
		tabClick: function (handler) {
			handler($("a[href='#organization']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#organization">Organization</a></li>');
			pluginTabs.content.push(
				'<div id="organization">' +
					'<div class="content"></div>' +
					'<div><button class="addorganization">Add new organization</button></div>' +
				'</div>'
			);
		},

		setUp: function () {
			$("div#organization button.addorganization").click(function(e) {
				e.preventDefault();
				UI.addOrganization({});
			});
		},

		fromXML: function (entitydescriptor) {
			var lang;

			// Add existing organizations (from XML)
			UI.clearOrganizationLocalizations();
			if (entitydescriptor.organization) {
				for (lang in entitydescriptor.organization) {
					if (entitydescriptor.organization.hasOwnProperty(lang)) {
						UI.addOrganizationLocalization(lang, entitydescriptor.organization[lang]);
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#organization fieldset').each(function (index, element) {
				var lang = null, organizationLocalization = {};

				if (!$(element).find('input').eq(1).attr('value')) {
					return;
				}

				lang = $(element).find('select').val();
				organizationLocalization.name = $(element).find('input').eq(0).attr('value');
				organizationLocalization.displayName = $(element).find('input').eq(1).attr('value');
				organizationLocalization.URL = $(element).find('input').eq(2).attr('value');
				entitydescriptor.organization[lang] = organizationLocalization;
			});
		}
	};

}(jQuery));
