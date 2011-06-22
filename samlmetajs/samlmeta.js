if (typeof console === "undefined" || typeof console.log === "undefined") var console = { log: function() {} };

// Hack to initiatlize a DOMParser in browser that do not support this natively.
// Hack found here:
//	https://sites.google.com/a/van-steenbeek.net/archive/explorer_domparser_parsefromstring
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

(function($) {

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
			var i, l;

			if (currentTab !== 'xml') return;
			currentTab = 'other';

			console.log('fromXML()');


			var parser = SAMLmetaJS.xmlparser($(node).val());
			var entitydescriptor = parser.getEntityDescriptor();

			console.log(entitydescriptor);

			SAMLmetaJS.UI.setEntityID(entitydescriptor.entityid);

			SAMLmetaJS.UI.clearCerts();
			if (entitydescriptor.certs) {
				for (l in entitydescriptor.certs) {
					if (entitydescriptor.certs.hasOwnProperty(l)) {
						SAMLmetaJS.UI.addCert(entitydescriptor.certs[l].use, entitydescriptor.certs[l].cert);
					}
				}
			}

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
		$("div#certs button.addcert").click(function(e) {
			e.preventDefault();
			SAMLmetaJS.UI.addCert('both', '');
		});

	};


	$.vari = "$.vari";
	$.fn.foo = "$.fn.vari";

	// $.fn is the object we add our custom functions to
	$.fn.SAMLmetaJS = function(options) {

		return this.each(function() {
			SAMLmetaJS.sync(this, options);
		});
	};
}(jQuery));
