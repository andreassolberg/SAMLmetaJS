// MetaLib. Library to handle Metadata XML Parsing.
SAMLmetaJS.xmlparser = function(xmlstring) {

	var parser = null;
	var doc = null;

	var resultObject = {};

	parser = new DOMParser();
	doc = parser.parseFromString(xmlstring, "text/xml");

	return {

		"getEntityDescriptor": function() {

			// Reset the result object as we stat over again from scratch.
			resultObject = {};

			// Peek at the root node, and verify.
			var root = doc.documentElement;
			if (root === null) {
				console.log('Root is null, the document is probably empty');
				return resultObject;
			}
			if (root.localName !== 'EntityDescriptor' || root.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				console.log('Root not was not recognized as a EntityDescriptor node in correct namespace.');
				return resultObject;
			}
			resultObject.certs = [];
			resultObject.entityid = root.getAttribute('entityID');

			// Iterate the root children
			for (var i = 0; i < root.childNodes.length; i++ ) {
				var currentChild = root.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				switch(currentChild.localName) {

					case 'Extensions':
						this.parseEntityExtensions(resultObject, currentChild);
						break;

					// Handle the SPSSODescriptor
					case 'SPSSODescriptor':

						if (SAMLmetaJS.XML.hasAttribute(currentChild,
								'protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol'))	{

							this.getSAML2SP(resultObject, currentChild);
						}

						break;

					case 'ContactPerson':
						this.parseContactPerson(resultObject, currentChild);
						break;

					default:
						// alert('Unknown child of root: ' + currentChild.localName);

				}

			}
			return resultObject;

		},
		"getKeyDescriptor": function(resultObject, keydescriptor) {
			if (keydescriptor.localName !== 'KeyDescriptor' || keydescriptor.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				throw 'KeyDescriptor in getKeyDescriptor() not was not recognized as a node in correct namespace.';
			}
			console.log('get keydescriptor');

			var cert, use;
			var keyinfo, x509data, x509cert;

			use = keydescriptor.getAttribute('use') || 'both';

			keyinfo = SAMLmetaJS.XML.findChildElement(keydescriptor,
				[{'localName': 'KeyInfo', 'namespaceURI': SAMLmetaJS.Constants.ns.ds}]);
			if (!keyinfo) return;

			x509data = SAMLmetaJS.XML.findChildElement(keyinfo,
				[{'localName': 'X509Data', 'namespaceURI': SAMLmetaJS.Constants.ns.ds}]);
			if (!x509data) return;

			x509cert = SAMLmetaJS.XML.findChildElement(x509data,
				[{'localName': 'X509Certificate', 'namespaceURI': SAMLmetaJS.Constants.ns.ds}]);
			if (!x509cert) return;

			cert = SAMLmetaJS.XML.getText(x509cert);
			if (!cert) return;

			// We got what we want, now store in result object.

			if(!resultObject.certs) resultObject.certs = [];
			resultObject.certs.push({'use': use, 'cert': cert});

		},
		"getSAML2SP": function(resultObject, spssodescriptor) {

			resultObject.saml2sp = {};

			if (spssodescriptor.localName !== 'SPSSODescriptor' || spssodescriptor.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				throw {'name': 'SPSSODescriptor in getSAML2SP() not was not recognized as a node in correct namespace.'};
			}

			for (var i = 0; i < spssodescriptor.childNodes.length; i++ ) {
				var currentChild = spssodescriptor.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				switch(currentChild.localName) {

					case 'Extensions':
						this.parseExtensions(resultObject, currentChild);
						break;

					case 'KeyDescriptor':
						this.getKeyDescriptor(resultObject, currentChild);
						break;

					case 'SingleLogoutService':
						if (!resultObject.saml2sp.SingleLogoutService) resultObject.saml2sp.SingleLogoutService = [];
						resultObject.saml2sp.SingleLogoutService.push(this.parseEndpoint(currentChild));
						break;

					case 'AssertionConsumerService':
						if (!resultObject.saml2sp.AssertionConsumerService) resultObject.saml2sp.AssertionConsumerService = [];
						resultObject.saml2sp.AssertionConsumerService.push(this.parseEndpoint(currentChild));
						break;

					case 'AttributeConsumingService':
						this.parseAttributeConsumingService(resultObject, currentChild);
						break;

					default:
						// alert('Unknown child of root: ' + currentChild.localName);

				}

			}

		},
		"parseEndpoint": function(endpoint) {
			var res = {};
			res.Binding = endpoint.getAttribute('Binding');
			res.Location = endpoint.getAttribute('Location');
			res.ResponseLocation = endpoint.getAttribute('ResponseLocation');
			res.index = endpoint.getAttribute('index');
			return res;
		},

		"parseEntityExtensions": function(resultObject, node) {

			if (node.localName !== 'Extensions' || node.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				throw {'name': 'Extensions in parseExtensions() not was not recognized as a node in correct namespace.'};
			}

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				if (currentChild.localName == 'EntityAttributes' && currentChild.namespaceURI == SAMLmetaJS.Constants.ns.mdattr) {
					this.parseEntityAttributes(resultObject, currentChild);
				}


			}

		},

		"parseEntityAttributes": function(resultObject, node) {

			if (node.localName !== 'EntityAttributes' || node.namespaceURI !== SAMLmetaJS.Constants.ns.mdattr) {
				throw {'name': 'EntityAttributes in parseEntityAttributes() not was not recognized as a node in correct namespace.'};
			}

			resultObject.entityAttributes = {};

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;
				if (currentChild.namespaceURI !== SAMLmetaJS.Constants.ns.saml) continue;

				switch(currentChild.localName) {
					case 'Attribute':
						var newAttr = this.parseAttribute(currentChild);
						if (newAttr.name) resultObject.entityAttributes[newAttr.name] = newAttr;

						break;

					case 'Assertion':
					default:
						// alert('Unknown child of root: ' + currentChild.localName);

				}
			}

		},

		"parseAttribute": function(node) {
			if (node.localName !== 'Attribute' || node.namespaceURI !== SAMLmetaJS.Constants.ns.saml) {
				throw {'name': 'Attribute in parseAttribute() not was not recognized as a node in correct namespace.'};
			}

			var newAttr = {};
			newAttr.name = node.getAttribute('Name') || null;
			newAttr.nameFormat = node.getAttribute('NameFormat') || null;

			var values = [];
			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;
				if (currentChild.namespaceURI !== SAMLmetaJS.Constants.ns.saml) continue;
				if (currentChild.localName !== 'AttributeValue') continue;

				values.push(SAMLmetaJS.XML.getText(currentChild));
			}
			newAttr.values = values;
			return newAttr;
		},

		"parseExtensions": function(resultObject, node) {

			if (node.localName !== 'Extensions' || node.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				throw {'name': 'Extensions in parseExtensions() not was not recognized as a node in correct namespace.'};
			}

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				if (currentChild.localName == 'UIInfo' && currentChild.namespaceURI == SAMLmetaJS.Constants.ns.mdui) {
					this.parseMDUI(resultObject, currentChild);
				} else {
					console.log('Would not parse: ');
					console.log(currentChild);
				}


			}

		},
		"parseMDUI": function(resultObject, node) {
			if (node.localName !== 'UIInfo' || node.namespaceURI !== SAMLmetaJS.Constants.ns.mdui) {
				throw {'name': 'UIInfo in parseMDUI() not was not recognized as a node in correct namespace.'};
			}

			if (!resultObject.name) resultObject.name = {};
			if (!resultObject.descr) resultObject.descr = {};

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				var lang = currentChild.getAttribute('xml:lang') || 'en';

				switch(currentChild.localName) {

					case 'DisplayName':
						resultObject.name[lang] = SAMLmetaJS.XML.getText(currentChild);
						break;

					case 'Description':
						resultObject.descr[lang] = SAMLmetaJS.XML.getText(currentChild);
						break;

					case 'GeolocationHint':
						resultObject.location = SAMLmetaJS.XML.getText(currentChild).substr(4);
						break;



					default:
						// alert('Unknown child of root: ' + currentChild.localName);

				}

			}

		},

		"parseAttributeConsumingService": function(resultObject, node) {

			if (node.localName !== 'AttributeConsumingService' || node.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				throw {'name': 'AttributeConsumingService in parseAttributeConsumingService() not was not recognized as a node in correct namespace.'};
			}

			if (!resultObject.name) resultObject.name = {};
			if (!resultObject.descr) resultObject.descr = {};
			resultObject.attributes = {};

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				var lang = currentChild.getAttribute('xml:lang') || 'en';

				switch(currentChild.localName) {

					case 'ServiceName':
						resultObject.name[lang] = SAMLmetaJS.XML.getText(currentChild);
						break;

					case 'ServiceDescription':
						resultObject.descr[lang] = SAMLmetaJS.XML.getText(currentChild);
						break;

					case 'RequestedAttribute':
						var attrname = currentChild.getAttribute('Name');
						if (attrname) {
							resultObject.attributes[attrname] = 1;
						}
						break;

					default:
						// alert('Unknown child of root: ' + currentChild.localName);

				}

			}
		},

		"parseContactPerson": function(resultObject, node) {

			if (node.localName !== 'ContactPerson' || node.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				throw {'name': 'ContactPerson in parseContactPerson() not was not recognized as a node in correct namespace.'};
			}

			var newContact = {};
			newContact.contactType = node.getAttribute('contactType');

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				// nodeType 1 is Element
				if (currentChild.nodeType !== 1) continue;

				switch(currentChild.localName) {

					case 'GivenName':
						newContact.givenName = SAMLmetaJS.XML.getText(currentChild);
						break;

					case 'SurName':
						newContact.surName = SAMLmetaJS.XML.getText(currentChild);
						break;

					case 'EmailAddress':
						newContact.emailAddress = SAMLmetaJS.XML.getText(currentChild);
						break;

					default:
						// alert('Unknown child of root: ' + currentChild.localName);

				}

			}

			if (!resultObject.contacts) {
				resultObject.contacts = [];
			}
			resultObject.contacts.push(newContact);

		}

	};

};




// Library to update XML Document from JSON object.
SAMLmetaJS.xmlupdater = function(xmlstring) {
	var parser = null;
	var doc = null;

	var resultObject = {};

	parser = new DOMParser();
	doc = parser.parseFromString(xmlstring, "text/xml");

	return {

		"updateDocument": function(entitydescriptor) {

			console.log('Update XML document');

			var root, spdescriptor, attributeconsumer, extensions, i, attr;
			root = this.addIfNotEntityDescriptor();

			if (entitydescriptor.entityid)
				root.setAttribute('entityID', entitydescriptor.entityid);

			if (entitydescriptor.entityAttributes) {
				entityExtensions = this.addIfNotEntityExtensions(root);

				entityAttributes = this.addIfNotEntityAttributes(entityExtensions);
				SAMLmetaJS.XML.wipeChildren(entityAttributes, SAMLmetaJS.Constants.ns.saml, 'Attribute');
				for(var name in entitydescriptor.entityAttributes) {
					this.addAttribute(entityAttributes, entitydescriptor.entityAttributes[name]);
				}
			}

			if (entitydescriptor.saml2sp) {
				spdescriptor = this.addIfNotSPSSODescriptor(root);

				if (
					SAMLmetaJS.tools.hasContents(entitydescriptor.name) ||
					SAMLmetaJS.tools.hasContents(entitydescriptor.descr) ||
					entitydescriptor.location
				) {
					extensions = this.addIfNotExtensions(spdescriptor);
					mdui = this.addIfNotMDUI(extensions);
					this.updateMDUI(mdui, entitydescriptor);
				}

				SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'KeyDescriptor');
				if (entitydescriptor.certs) {
					for(i = 0; i< entitydescriptor.certs.length; i++) {
						this.addCert(spdescriptor, entitydescriptor.certs[i].use, entitydescriptor.certs[i].cert);
					}
				}

				SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'AssertionConsumerService');
				if (entitydescriptor.saml2sp.AssertionConsumerService &&
						entitydescriptor.saml2sp.AssertionConsumerService.length > 0) {
					for(i = 0; i< entitydescriptor.saml2sp.AssertionConsumerService.length; i++) {
						this.addEndpoint(spdescriptor, 'AssertionConsumerService', entitydescriptor.saml2sp.AssertionConsumerService[i]);
					}
				}

				SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'SingleLogoutService');
				if (entitydescriptor.saml2sp.SingleLogoutService && entitydescriptor.saml2sp.SingleLogoutService.length > 0) {
					for(i = 0; i< entitydescriptor.saml2sp.SingleLogoutService.length; i++) {
						this.addEndpoint(spdescriptor, 'SingleLogoutService', entitydescriptor.saml2sp.SingleLogoutService[i]);
					}
				}
				if (SAMLmetaJS.tools.hasContents(entitydescriptor.name) &&
						SAMLmetaJS.tools.hasContents(entitydescriptor.attributes)) {
					attributeconsumer = this.addIfNotAttributeConsumingService(spdescriptor);
					this.updateAttributeConsumingService(attributeconsumer, entitydescriptor);

					for (attr in entitydescriptor.attributes) {
						this.addRequestedAttribute(attributeconsumer, attr);
					}
				}
			}

			if (entitydescriptor.contacts) {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'ContactPerson');
				for(i = 0; i < entitydescriptor.contacts.length; i++) {
					this.addContact(root, entitydescriptor.contacts[i])
				}
			}

		},

		"addCert": function(node, use, cert) {
			var keydescriptor, keyinfo, x509data, x509cert;

			keydescriptor = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:KeyDescriptor');

			if (use === 'signing' || use === 'encryption') {
				keydescriptor.setAttribute('use', use);
			}

			keyinfo = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:KeyInfo');
			x509data = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:X509Data');
			x509cert = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:X509Certificate');
			x509cert.appendChild( doc.createTextNode(cert));
			x509data.appendChild(x509cert);
			keyinfo.appendChild(x509data);
			keydescriptor.appendChild(keyinfo);

			node.insertBefore(keydescriptor, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));


		},

		"addContact": function(node, contact) {
			var givenname,surname,emailaddress;
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:ContactPerson');
			if (contact.contactType) newNode.setAttribute('contactType', contact.contactType);

			if(contact.givenName) {
				givenname = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:GivenName');
				givenname.appendChild(doc.createTextNode(contact.givenName));
				newNode.appendChild(givenname);
			}
			if(contact.surName) {
				surname = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:SurName');
				surname.appendChild(doc.createTextNode(contact.surName));
				newNode.appendChild(surname);
			}
			if(contact.emailAddress) {
				emailaddress = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:EmailAddress');
				emailaddress.appendChild(doc.createTextNode(contact.emailAddress));
				newNode.appendChild(emailaddress);
			}
			node.appendChild(newNode);
		},
		"updateMDUI": function(node, entitydescriptor) {
			if (SAMLmetaJS.tools.hasContents(entitydescriptor.name)) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'DisplayName');
				for(lang in entitydescriptor.name) {
					this.addMDUIDisplayName(node, lang, entitydescriptor.name[lang]);
				}
			}
			if (SAMLmetaJS.tools.hasContents(entitydescriptor.descr)) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'Description');
				for(lang in entitydescriptor.descr) {
					this.addMDUIDescription(node, lang, entitydescriptor.descr[lang]);
				}
			}
			SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'GeolocationHint');
			if (entitydescriptor.location) {
				this.addMDUILocation(node, entitydescriptor.location);
			}

		},
		"addMDUILocation": function(node, location) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:GeolocationHint');
			var text = doc.createTextNode('geo:' + location);
			newNode.appendChild(text);
			node.appendChild(newNode);

		},
		"addMDUIDisplayName": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:DisplayName');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
		},
		"addMDUIDescription": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:Description');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
		},
		"updateAttributeConsumingService": function(node, entitydescriptor) {
			var i, lang;
			for (i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					) {
					node.removeChild(currentChild);
				}
			}

			if (entitydescriptor.name) {
				for(lang in entitydescriptor.name) {
					this.addName(node, lang, entitydescriptor.name[lang]);
				}
			}
			if (entitydescriptor.descr) {
				for(lang in entitydescriptor.descr) {
					this.addDescr(node, lang, entitydescriptor.descr[lang]);
				}
			}

		},
		"addName": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:ServiceName');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
		},
		"addDescr": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:ServiceDescription');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
		},
		"addRequestedAttribute": function(node, attr) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:RequestedAttribute');
			newNode.setAttribute('Name', attr);
			node.appendChild(newNode);
		},
		"addAttribute": function(node, attr) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.saml, 'saml:Attribute');
			newNode.setAttribute('Name', attr.name);
			if (attr.nameFormat) {
				newNode.setAttribute('NameFormat', attr.nameFormat);
			}
			if (attr.values) {
				for (var i = 0; i < attr.values.length; i++ ) {
					var newValue = doc.createElementNS(SAMLmetaJS.Constants.ns.saml, 'saml:AttributeValue');
					newValue.appendChild(doc.createTextNode(attr.values[i]));
					newNode.appendChild(newValue);
				}

			}
			node.appendChild(newNode);
		},
		"addIfNotEntityExtensions": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'Extensions' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:Extensions');
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'SPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'IdPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
				]
			));
			return newNode;
		},
		"addIfNotExtensions": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'Extensions' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:Extensions');
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'KeyDescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
			return newNode;
		},
		"addIfNotMDUI": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'UIInfo' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.mdui
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:UIInfo');
			node.appendChild(newNode);
			return newNode;

		},
		"addIfNotEntityAttributes": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'EntityAttributes' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.mdattr
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdattr, 'mdattr:EntityAttributes');
			node.appendChild(newNode);
			return newNode;

		},
		"addIfNotAttributeConsumingService": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'AttributeConsumingService' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:AttributeConsumingService');
			newNode.setAttribute('index', 0);
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'ContactPerson', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
			return newNode;
		},
		"addEndpoint": function(node, endpointtype, endpoint) {
			var newNode;
			newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:' + endpointtype);
			if (endpoint.Binding) newNode.setAttribute('Binding', endpoint.Binding);
			if (endpoint.Location) newNode.setAttribute('Location', endpoint.Location);
			if (endpoint.ResponseLocation) newNode.setAttribute('ResponseLocation', endpoint.ResponseLocation);
			if (endpoint.index) newNode.setAttribute('index', endpoint.index);
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
		},

		"addIfNotSPSSODescriptor": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'SPSSODescriptor' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md &&
						SAMLmetaJS.XML.hasAttribute(currentChild, 'protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol')
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:SPSSODescriptor');
			newNode.setAttribute('protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol');
			node.appendChild(newNode);
			return newNode;
		},

		"addIfNotEntityDescriptor": function() {
			var root = doc.documentElement;
			if (root === null || root.localName !== 'EntityDescriptor' || root.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				root = this.addEntityDescriptor();
			}
			return root;
		},

		"addEntityDescriptor": function() {
			var node = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:EntityDescriptor');
			node.setAttribute('xmlns:ds', SAMLmetaJS.Constants.ns.ds);
			if (doc.documentElement !== null) {
				doc.removeChild(doc.documentElement);
			}
			doc.appendChild(node);
			return node;
		},

		"getXMLasString": function() {
			return (new XMLSerializer()).serializeToString(doc);
		}

	};
};


SAMLmetaJS.tools = {
	"hasContents": function(obj) {
		if (!obj) return false;
		for (key in obj) {
			return true;
		}
		return false;
	}
};

SAMLmetaJS.XML = {
	"hasAttribute": function(node, attribute, value) {

		var attr = node.getAttribute(attribute);
		if (!attr) return false;

		var attrs = attr.split(" ");
		for(key in attrs) {
			if (attrs[key] == value) return true;
		}
		return false;
	},
	"getText": function(node) {
		if (!node.hasChildNodes()) return;
		var str = '';
		for (var i = 0; i < node.childNodes.length; i++ ) {
			if (node.childNodes[i].nodeType == 3) {
				str += node.childNodes[i].nodeValue;
			}
		}
		str = str.replace(/\s+/g, ' ');
		str = str.replace(/^\s*/g, '');
		str = str.replace(/\s*$/g, '');
		return str;
	},
	"wipeChildren": function(node, ns, element) {
		var i, lang;
		var wipequeue = [];

		if (!node.childNodes) return;

		for (i = 0; i < node.childNodes.length; i++ ) {
			var currentChild = node.childNodes[i];
			if (currentChild.nodeType !== 1) continue;
			if (ns && ns !== currentChild.namespaceURI) continue;
			if (element && element !== currentChild.localName) continue;
			wipequeue.push(currentChild);
		}
		for(i = 0; i < wipequeue.length; i++) {
			node.removeChild(wipequeue[i]);
		}
	},
	"findChildElement": function(node, list) {
		// Iterate the root children
		var i, j;
		for (i = 0; i < node.childNodes.length; i++ ) {
			var currentChild = node.childNodes[i];
			if(currentChild.nodeType !== 1) continue; // Process only elements.

			for(j = 0; j < list.length; j++) {
				if (list[j].localName == currentChild.localName &&
					list[j].namespaceURI == currentChild.namespaceURI
					) {
					return currentChild;
				}
			}
		}
		return null;
	},
	"prettifyXML": function(xmlstring) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(xmlstring, 'text/xml');

		function isEmptyElement(element) {
			var whitespace = new RegExp('^\s*$');
			for (var child = element.firstChild; child != null; child = child.nextSibling) {
				if (child instanceof Text && whitespace.test(child.data)) {
					continue;
				}
				return false;
			}
			return true;
		}

		function isTextElement(element) {
			for (var child = element.firstChild; child != null; child = child.nextSibling) {
				if (child instanceof Text) {
					continue;
				}
				return false;
			}
			return true;
		}

		function xmlEntities(string) {
			string = string.replace(/&/g, '&amp;');
			string = string.replace(/\"/g, '&qout;');
			string = string.replace(/'/g, '&apos;');
			string = string.replace(/</, '&lt;');
			string = string.replace(/>/, '&gt;');
			return string;
		}


		function prettifyElement(element, indentation) {
			var ret = indentation + '<' + element.nodeName;

			var attrIndent = indentation;
			while (attrIndent.length < ret.length) {
				attrIndent += ' ';
			}

			var attrs = element.attributes;

			for (var i = 0; i < attrs.length; i++) {
				var a = attrs.item(i);
				if (i > 0) {
					ret += '\n' + attrIndent;
				}
				ret += ' ' + a.nodeName + '="' + xmlEntities(a.value) + '"';
			}

			if (isEmptyElement(element)) {
				if (attrs.length > 1) {
					return ret + '\n' + attrIndent + ' />\n';
				} else if (attrs.length == 1) {
					return ret + ' />\n';
				} else {
					return ret + '/>\n';
				}
			}

			if (attrs.length > 1) {
				ret += '\n' + attrIndent + ' >';
			} else {
				ret += '>';
			}

			if (isTextElement(element)) {
				return ret + xmlEntities(element.textContent) + '</' + element.nodeName + '>\n';
			}

			ret += '\n';

			for (var child = element.firstElementChild; child != null; child = child.nextElementSibling) {
				ret += prettifyElement(child, indentation + '	 ');
			}

			return ret + indentation + '</' + element.nodeName + '>\n';
		}

		return prettifyElement(doc.documentElement, '');
	}


};
