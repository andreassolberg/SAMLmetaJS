(function($) {
	var SAMLmetaJS = $.fn.SAMLmetaJS;

	$("div#certs button.addcert").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addCert('both', '');
	});

	SAMLmetaJS.plugins.certs = {
		tabClick: function (handler) {
			handler($("a[href='#certs']"));
		},

		addTab: function (pluginTabs) {

		},

		fromXML: function (entitydescriptor) {
			var l;

			SAMLmetaJS.UI.clearCerts();
			if (entitydescriptor.certs) {
				for (l in entitydescriptor.certs) {
					if (entitydescriptor.certs.hasOwnProperty(l)) {
						SAMLmetaJS.UI.addCert(entitydescriptor.certs[l].use, entitydescriptor.certs[l].cert);
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			delete entitydescriptor.certs;
			$('div#certs fieldset').each(function (index, element) {

				var use = $(element).find('select.certuse').val();
				var cert = $(element).find('textarea.certdata').val();

				if (!use || !cert) {
					return;
				}

				if (!entitydescriptor.certs) {
					entitydescriptor.certs = [];
				}
				entitydescriptor.certs.push({'use': use, 'cert': cert});
			});
		}
	};

}(jQuery));
