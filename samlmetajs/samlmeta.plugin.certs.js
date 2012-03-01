(function($) {
	var UI = {
		clearCertificates: function () {
			$("div#certificates > div.content").empty();
		},
		addCertificate: function (use, cert, algorithm, keySize, OAEPparams) {
			var infoHTML, key, checked;
			var randID = 'certificate' + Math.floor(Math.random() * 10000 + 1000);

			infoHTML = [
				'<fieldset><legend>Certificate</legend>',
				'<div class="inlineField">',
				'<label for="' + randID + '-use-name">Use:</label>',
				'<select class="certuse" name="' + randID + '-use-name" id="' + randID + '-use">'
			];

			for (key in SAMLmetaJS.Constants.certusage) {
				if (SAMLmetaJS.Constants.certusage.hasOwnProperty(key)) {
					checked = '';
					if (key === use) {
						checked = ' selected="selected" ';
					}
					infoHTML.push('<option value="' + key + '" ' + checked + '>');
					infoHTML.push(SAMLmetaJS.Constants.certusage[key]);
					infoHTML.push('</option>');
				}
			}

			infoHTML.push('</select>');
			infoHTML.push('</div>');
			infoHTML.push('<div class="inlineField">');
			infoHTML.push('<label for="' + randID + '-algorithm">Algorithm:</label>');
			infoHTML.push('<select class="algorithm" name="' + randID + '-algorithm-name" id="' + randID + '-algorithm">');
			infoHTML.push('<option value=""></option>');
			for (key in SAMLmetaJS.Constants.algorithms) {
				if (SAMLmetaJS.Constants.algorithms.hasOwnProperty(key)) {
					checked = '';
					if (key === algorithm) {
						checked = ' selected="selected" ';
					}
					infoHTML.push('<option value="' + key + '" ' + checked + '>');
					infoHTML.push(SAMLmetaJS.Constants.algorithms[key]);
					infoHTML.push('</option>');
				}
			}

			infoHTML.push('</select>');
			infoHTML.push('</div>');

			infoHTML.push('<div class="inlineField newRow">');
			infoHTML.push('<label for="' + randID + '-keySize">Key size:</label>');
			infoHTML.push('<input type="text" class="keySize" name="' + randID + '-keySize-name" id="' + randID + '-keySize" value="' + (keySize || '') + '" />');
			infoHTML.push('</div>');

			infoHTML.push('<div class="inlineField">');
			infoHTML.push('<label for="' + randID + '-OAEPparams">OAEP parameters:</label>');
			infoHTML.push('<input type="text" class="OAEPparams longInput" name="' + randID + '-OAEPparams-name" id="' + randID + '-OAEPparams" value="' + (OAEPparams || '') + '" />');
			infoHTML.push('</div>');

			infoHTML.push('<textarea class="certdata newRow" style="" name="' + randID + '-data" id="' + randID + '-data-name">' + (cert || '') + '</textarea>');

			infoHTML.push('<button style="display: block" class="removecert">Remove</button>');
			infoHTML.push('</fieldset>');

			$(infoHTML.join(''))
				.appendTo("div#certificates > div.content")
				.find('button.removecert')
				.click(function(e) {
					e.preventDefault();
					$(e.target).closest('fieldset').remove();
				});
		}
	};

	SAMLmetaJS.plugins.certs = {
		tabClick: function (handler) {
			handler($("a[href='#certs']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#certs">Certificates</a></li>');
			pluginTabs.content.push([
				'<div id="certs">',

				'<div id="certificates">',
				'<div class="content"></div>',
				'<div><button class="addcertificate">Add new certificate</button></div>',
				'</div>',

				'</div>'
			].join(''));
		},

		setUp: function () {
			$("div#certificates button.addcertificate").click(function(e) {
				e.preventDefault();
				UI.addCertificate('both', '', '', '', '', '');
			});
		},

		fromXML: function (entitydescriptor) {
			var i;

			UI.clearCertificates();
			if (entitydescriptor.hasCertificate()) {
				for(i = 0; i < entitydescriptor.saml2sp.certs.length; i++) {
				        UI.addCertificate(
						entitydescriptor.saml2sp.certs[i].use,
						entitydescriptor.saml2sp.certs[i].cert,
						entitydescriptor.saml2sp.certs[i].algorithm,
						entitydescriptor.saml2sp.certs[i].keySize,
						entitydescriptor.saml2sp.certs[i].OAEPparams
					);
				}
			}
		},

		toXML: function (entitydescriptor) {
			delete entitydescriptor.certs;
			$('div#certificates fieldset').each(function (index, element) {
				var use = $(element).find('select.certuse').val();
				var cert = $(element).find('textarea.certdata').val();
				var algorithm = $(element).find('select.algorithm').val();
				var keySize = $(element).find('input.keySize').val();
				var OAEPparams = $(element).find('input.OAEPparams').val();

				if (!use || !cert) {
					return;
				}
				entitydescriptor.addCertificate(use, cert, algorithm, keySize, OAEPparams);
			});
		}
	};

}(jQuery));
