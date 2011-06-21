if (typeof console === "undefined" || typeof console.log === "undefined") var console = { log: function() {} };

// Hack to initiatlize a DOMParser in browser that do not support this natively.
// Hack found here:
//  https://sites.google.com/a/van-steenbeek.net/archive/explorer_domparser_parsefromstring
//
if(typeof(DOMParser) === 'undefined') {
	DOMParser = function() {};
	DOMParser.prototype.parseFromString = function(str, contentType) {
		var xmldata = null;

		if (typeof(ActiveXObject) !== 'undefined') {
			xmldata = new ActiveXObject('MSXML.DomDocument');

			xmldata.async = false;
			xmldata.loadXML(str);
			return xmldata;

		} else if(typeof(XMLHttpRequest) !== 'undefined') {
			xmldata = new XMLHttpRequest();
			if(!contentType) {
				contentType = 'application/xml';
			}

			xmldata.open('GET', 'data:' + contentType + ';charset=utf-8,' + encodeURIComponent(str), false);
			if(xmldata.overrideMimeType) {
				xmldata.overrideMimeType(contentType);
			}

			xmldata.send(null);
			return xmldata.responseXML;
		}
	};
}

var SAMLmetaJS = {};
SAMLmetaJS.plugins = {};

SAMLmetaJS.pluginEngine = {
	'execute': function(hook, parameters) {
		var plugin;
		if (!SAMLmetaJS.plugins) return;
		for (plugin in SAMLmetaJS.plugins) {
			if (SAMLmetaJS.plugins[plugin][hook]) {
				console.log('Executing hook [' + hook + '] in plugin [' + plugin + ']');
				SAMLmetaJS.plugins[plugin][hook].apply(null, parameters);
			}
		}
	}
};





SAMLmetaJS.sync = function(node, options) {

	var currentTab = 'xml';

	// This section extracts the information from the Metadata XML document,
	// and updates the UI elements to reflect that.
	var fromXML = function () {
		var i, l, endpoint;

		if (currentTab !== 'xml') return;
		currentTab = 'other';

		console.log('fromXML()');


		var parser = SAMLmetaJS.xmlparser($(node).val());
		var entitydescriptor = parser.getEntityDescriptor();

		console.log(entitydescriptor);

		SAMLmetaJS.UI.setEntityID(entitydescriptor.entityid);

		// Add existing contacts (from XML)
		SAMLmetaJS.UI.clearContacts();
		if (entitydescriptor.contacts) {
			for (i = 0; i < entitydescriptor.contacts.length; i++ ) {
				SAMLmetaJS.UI.addContact(entitydescriptor.contacts[i]);
			}
		}

		// Add name and description
		SAMLmetaJS.UI.clearInfoname();
		if (entitydescriptor.name) {
			for (l in entitydescriptor.name) {
				SAMLmetaJS.UI.addInfoname(l, entitydescriptor.name[l]);
			}
		}

		SAMLmetaJS.UI.clearInfodescr();
		if (entitydescriptor.descr) {
			for (l in entitydescriptor.descr) {
				SAMLmetaJS.UI.addInfodescr(l, entitydescriptor.descr[l]);
			}
		}

		if (entitydescriptor.location) {
			SAMLmetaJS.UI.setLocation(entitydescriptor.location);
			var spl = entitydescriptor.location.split(',');
			var latLng = new google.maps.LatLng(spl[0],spl[1]);

			SAMLmetaJS.map.panTo(latLng);
			SAMLmetaJS.mapmarker.setPosition(latLng);
		}


		SAMLmetaJS.UI.clearCerts();
		if (entitydescriptor.certs) {
			for (l in entitydescriptor.certs) {
				SAMLmetaJS.UI.addCert(entitydescriptor.certs[l].use, entitydescriptor.certs[l].cert);
			}
		}



		// Add existing endpoints (from XML)
		SAMLmetaJS.UI.clearEndpoints();
		if (entitydescriptor.saml2sp) {

			for (endpoint in entitydescriptor.saml2sp) {

				if (entitydescriptor.saml2sp[endpoint].length > 0) {
					for (i = 0; i < entitydescriptor.saml2sp[endpoint].length; i++) {
						SAMLmetaJS.UI.addEndpoint(entitydescriptor.saml2sp[endpoint][i], endpoint);
					}
				}

			}
		}

		// Set attributes
		SAMLmetaJS.UI.setAttributes(entitydescriptor.attributes);


		SAMLmetaJS.pluginEngine.execute('fromXML', [entitydescriptor]);
	};


	// This section extracts the information from the Metadata UI elements,
	// and applies this to the XML metadata document.
	var toXML = function() {
		if (currentTab !== 'other') return;
		currentTab = 'xml';
		console.log('toXML()');

		var entitydescriptor = {
			'name': {},
			'descr': {},
			'contacts': [],
			'saml2sp': {
				'AssertionConsumerService': [],
				'SingleLogoutService': []
			},
			'attributes': {}
		};

		entitydescriptor.entityid = $('input#entityid').val();

		$('div#infoname > div').each(function(index, element) {
			if (!$(element).children('input').attr('value')) return;
			entitydescriptor.name[$(element).children('select').val()] = $(element).children('input').attr('value');
		});
		$('div#infodescr > div').each(function(index, element) {
			if (!$(element).find('div > textarea').val()) return;
			entitydescriptor.descr[$(element).find('div > select').val()] = $(element).find('div > textarea').val();
		});
		$('div#contact fieldset').each(function(index, element) {

			if (!$(element).find('input').eq(1).attr('value')) return;

			var newContact = {};
			newContact.contactType  = $(element).find('select').val();
			newContact.givenName  	= $(element).find('input').eq(0).attr('value');
			newContact.surName  	= $(element).find('input').eq(1).attr('value');
			newContact.emailAddress	= $(element).find('input').eq(2).attr('value');
			entitydescriptor.contacts.push(newContact);
		});
		$('div#saml2sp fieldset').each(function(index, element) {

			if (!$(element).find('input').eq(0).attr('value')) return;

			var newEndpoint = {};
			var endpointType;
			endpointType		  			= $(element).find('select.datafield-type').val();
			newEndpoint.Binding  			= $(element).find('select.datafield-binding').attr('value');
			newEndpoint.Location  			= $(element).find('input.datafield-location').attr('value');
			newEndpoint.ResponseLocation  	= $(element).find('input.datafield-responselocation').attr('value');
 			newEndpoint.index				= $(element).find('input.datafield-index').attr('value');
			entitydescriptor.saml2sp[endpointType].push(newEndpoint);
		});
		$('div#attributes div').each(function(index, element) {

			$(element).find('input:checked').each(function(index2, element2) {
				entitydescriptor.attributes[$(element2).attr('name')] = 1;
			});
		});

		if ($("input#includeLocation").attr('checked')) {
			entitydescriptor.location = $("input#geolocation").val();
		}

		delete entitydescriptor.certs;
		$('div#certs fieldset').each(function(index, element) {

			var use = $(element).find('select.certuse').val();
			var cert = $(element).find('textarea.certdata').val();

			if (!use || !cert) return;

			if (!entitydescriptor.certs) entitydescriptor.certs = [];
			entitydescriptor.certs.push({'use': use, 'cert': cert});
		});

		SAMLmetaJS.pluginEngine.execute('toXML', [entitydescriptor]);

		console.log(entitydescriptor);

		// ---
		// Now the JSON object is created, and now we will apply this to the Metadata XML document
		// in the textarea.

		var parser = SAMLmetaJS.xmlupdater($(node).val());
		parser.updateDocument(entitydescriptor);

		var xmlstring = parser.getXMLasString();
		xmlstring = SAMLmetaJS.XML.prettifyXML(xmlstring);
		$(node).val(xmlstring);

	};


	// Add content
	SAMLmetaJS.UI.embrace(node);


	// Initialization of the automatic reflection between UI elements and XML

	$("a[href='#rawmetadata']").click(toXML);
	$("a[href='#info']").click(fromXML);
	$("a[href='#contact']").click(fromXML);
	$("a[href='#attributes']").click(fromXML);
	$("a[href='#location']").click(fromXML);
	$("a[href='#saml2sp']").click(fromXML);
	$("a[href='#certs']").click(fromXML);

	SAMLmetaJS.pluginEngine.execute('tabClick', [
		function(node) {
			$(node).click(fromXML);
		}
	]);


	if (options && options.savehook) {
		$(options.savehook).submit(toXML);
	}

	// Adding handlers to the other buttons.

	$("div#rawmetadata button.prettify").click(function(e) {
		e.preventDefault();
		$(node).val(SAMLmetaJS.XML.prettifyXML($(node).val()));
	});
	$("div#rawmetadata button.wipe").click(function(e) {
		e.preventDefault();
		$(node).val('');
	});
	$("div#info button.addname").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addInfoname('en', '');
	});
	$("div#info button.adddescr").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addInfodescr('en', '');
	});
	$("div#contact button.addcontact").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addContact({});
	});
	$("div#saml2sp button.addendpoint").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addEndpoint({});
	});
	$("div#certs button.addcert").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addCert('both', '');
	});
	$("div#attributes button.selectall").click(function(e) {
		e.preventDefault();
		$("div#attributes div.content input:checkbox").each(function(index, box) {
			$(box).attr('checked', 'checked');
		});
	});
	$("div#attributes button.unselectall").click(function(e) {
		e.preventDefault();
		$("div#attributes div.content input:checkbox").each(function(index, box) {
			$(box).removeAttr('checked');
		});
	});


};


(function($) {
	$.vari = "$.vari";
	$.fn.foo = "$.fn.vari";

	// $.fn is the object we add our custom functions to
	$.fn.SAMLmetaJS = function(options) {

		return this.each(function() {
			SAMLmetaJS.sync(this, options);
		});
	};
}(jQuery));
