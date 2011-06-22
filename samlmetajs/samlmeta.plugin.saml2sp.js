(function($) {
	var SAMLmetaJS = $.fn.SAMLmetaJS;

	$("div#saml2sp button.addendpoint").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addEndpoint({});
	});

	SAMLmetaJS.plugins.saml2sp = {
		tabClick: function (handler) {
			handler($("a[href='#saml2sp']"));
		},

		addTab: function (pluginTabs) {

		},

		fromXML: function (entitydescriptor) {
			var i, endpoint;

			// Add existing endpoints (from XML)
			SAMLmetaJS.UI.clearEndpoints();
			if (entitydescriptor.saml2sp) {
				for (endpoint in entitydescriptor.saml2sp) {
					if (entitydescriptor.saml2sp.hasOwnProperty(endpoint)) {
						for (i = 0; i < entitydescriptor.saml2sp[endpoint].length; i++) {
							SAMLmetaJS.UI.addEndpoint(entitydescriptor.saml2sp[endpoint][i], endpoint);
						}
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#saml2sp fieldset').each(function (index, element) {
				var newEndpoint = {};
				var endpointType;

				if (!$(element).find('input').eq(0).attr('value')) {
					return;
				}

				endpointType = $(element).find('select.datafield-type').val();
				newEndpoint.Binding = $(element).find('select.datafield-binding').attr('value');
				newEndpoint.Location = $(element).find('input.datafield-location').attr('value');
				newEndpoint.ResponseLocation = $(element).find('input.datafield-responselocation').attr('value');
				newEndpoint.index = $(element).find('input.datafield-index').attr('value');
				entitydescriptor.saml2sp[endpointType].push(newEndpoint);
			});
		}
	};

}(jQuery));
