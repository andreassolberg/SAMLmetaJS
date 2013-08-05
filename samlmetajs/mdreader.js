/*
 * (c) Andreas Åkre Solberg, UNINETT AS, 2011
 *	http://rnd.feide.no
 *
 * This is a JS library to parse and extract information from
 * a SAML 2.0 Metadata document.
 *
 * It is written to be suitable from both Node.js and in the browser.
 */

(function() {


var
	isnode = false,
	libxmljs,
	parseFromString,
	settings = {},
	isEmpty,
	hasProp,
	MDException,
	TestResult,
	constants;

if (typeof window == 'undefined') {

	// Node.js external requirements
	libxmljs = require("libxmljs");
	isnode = true;

}

/*
 * Check if an object is empty (e.g. has no properties)
*/
isEmpty = function (obj) {
	var prop;
	for (prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			return false;
		}
	}
	return true;
};

/*
 * Check if an object has a given property.
*/
hasProp = function (obj, prop) {
	return typeof obj[prop] !== 'undefined';
};

/*
 * Class MDEntityDescriptor
 *
 * This is representing the entitydescriptor object. A prototype is added
 * to make easily accessible helper function to get content, such as endpoints.
 */
MDEntityDescriptor = function() {

}

/*
 * Look for certiciate of a specific type.
 * type can be 'signing' or 'encryption'
 */
MDEntityDescriptor.prototype.hasCertOfType = function (type) {

	var checkCert = function (role) {
		var i;
		if (!role || !role.certs) {
			return false;
		}
		for(i = 0; i < role.certs.length; i++) {
			// console.log('Looking for certificate of type:'); console.log(type); console.log(this.saml2sp.certs[i]);
			if (role.certs[i].use === 'both' || role.certs[i].use === type) {
				return true;
			}
		}
		return false;
	};

	return checkCert(this.saml2idp) || checkCert(this.saml2sp);
}

/*
 * Check if the current entity has a specified property.
 */
MDEntityDescriptor.prototype.hasProperty = function (property) {
	var entity;
	if (hasProp(this, 'saml2sp')) {
		entity = this.saml2sp;
	} else {
		entity = this.saml2idp;
	}
	if (!entity) {
		return false;
	}

	return hasProp(entity, property);
};

/*
 * Return the specified property from the current entity.
 */
MDEntityDescriptor.prototype.getProperty = function (property) {
	var entity;
	if (hasProp(this, 'saml2sp')) {
		entity = this.saml2sp;
	} else {
		entity = this.saml2idp;
	}
	if (!entity) {
		this.saml2sp = {};
		entity = this.saml2sp;
	}

	if (!hasProp(entity, property)) {
		entity[property] = {};
	}

	return entity[property];
};

/*
 * Look for a MDUI property in any language.
 */
MDEntityDescriptor.prototype.hasMDUIProperty = function (property) {
	var mdui = this.hasProperty('mdui'),
		result = false;
	if (mdui) {
		mdui = this.getProperty('mdui');
		result = !isEmpty(mdui) && hasProp(mdui, property) && !isEmpty(mdui[property]);
	};
	return result;
};

/*
 * Look for logo in any language.
 */
MDEntityDescriptor.prototype.hasLogo = function () {
	return this.hasMDUIProperty('logo');
};

/*
 * Add an logo in the specified language.
 * An logo is an object with three required attributes:
 *	- location: url of the image
 *	- width: width in pixels
 *	- height: height in pixels
 */
MDEntityDescriptor.prototype.addLogo = function (lang, location, width, height) {
	var mdui = this.getProperty('mdui');
	if (!hasProp(mdui, 'logo')) {
		mdui.logo = {};
	}
	mdui.logo[lang] = {
		location: location,
		width: width,
		height: height
	};
};

/*
 * Look for location.
 */
MDEntityDescriptor.prototype.hasLocation = function () {
	return this.hasMDUIProperty('location');
};

/*
 * Get the geolocation or null if the entity does not have any.
 */
MDEntityDescriptor.prototype.getLocation = function () {
	if (!this.hasLocation()) {
		return null;
	} else {
		return this.getProperty('mdui').location;
	}
};

/*
 * Safely set the geolocation for this entity creating
 * nested structures as needed.
 */
MDEntityDescriptor.prototype.setLocation = function (location) {
	var mdui = this.getProperty('mdui');
	mdui.location = location;
};

/*
 * Look for keywords in any language.
 */
MDEntityDescriptor.prototype.hasKeywords = function () {
	return this.hasMDUIProperty('keywords');
};

/*
 * Add a set of keywords in the specified language.
 */
MDEntityDescriptor.prototype.addKeywords = function (lang, keywords) {
	var mdui = this.getProperty('mdui');
	if (!hasProp(mdui, 'keywords')) {
		mdui.keywords = {};
	}
	mdui.keywords[lang] = keywords;
};

/*
 * Look for InformationURL in any language.
 */
MDEntityDescriptor.prototype.hasInformationURL = function () {
	return this.hasMDUIProperty('informationURL');
};

/*
 * Add an Information URL in the specified language.
 */
MDEntityDescriptor.prototype.addInformationURL = function (lang, url) {
	var mdui = this.getProperty('mdui');
	if (!hasProp(mdui, 'informationURL')) {
		mdui.informationURL = {};
	}
	mdui.informationURL[lang] = url;
};

/*
 * Look for PrivacyStatementURL in any language.
 */
MDEntityDescriptor.prototype.hasPrivacyStatementURL = function () {
	return this.hasMDUIProperty('privacyStatementURL');
};

/*
 * Add an Privacy Statement URL in the specified language.
 */
MDEntityDescriptor.prototype.addPrivacyStatementURL = function (lang, url) {
	var mdui = this.getProperty('mdui');
	if (!hasProp(mdui, 'privacyStatementURL')) {
		mdui.privacyStatementURL = {};
	}
	mdui.privacyStatementURL[lang] = url;
};

/*
 * Look for Certificates
 */
MDEntityDescriptor.prototype.hasCertificate = function (role) {
	var container = 'saml2' + role;
	return (hasProp(this, container) && !isEmpty(this[container]) &&
			hasProp(this[container], 'certs') && !isEmpty(this[container].certs));
};

/*
 * Add a Certificate.
 */
MDEntityDescriptor.prototype.addCertificate = function (role, use, cert, algorithm, keySize, OAEPparams) {
	var container = 'saml2' + role;
	if (!this[container]) {
		this[container] = {};
	}
	if (!this[container].certs) {
		this[container].certs = [];
	}
	this[container].certs.push({
		use: use,
		cert: cert,
		algorithm: algorithm,
		keySize: keySize,
		OAEPparams: OAEPparams
	});
};

/*
 * Class: TestResult
 * Contains information about a single test performed regarding metadata.
 * The objects contain the following properties:
 *
 * id: an identifier, unique for this type of test.
 * text: a human readable textual description of the test.
 * value: Whether the test succeeded or failed.
 *		0	failed
 *		1	suceeded
 *		2	NA
 * significance: How signficant is it that this test fails.
 *		0	Not signficant at all. Just informative.
 *		1	Fail means a 'warning' (usually a SHOULD statement that is violated)
 *		2	Fail means a critical error (failed requirement)
 */
TestResult = function(id, text, value, significance) {
	this.id = id;
	this.significance = null;

	if (typeof value !== 'undefined') {
		this.value = value;
	} else {
		this.value = 2;
	}

	if (typeof significance !== 'undefined') {
		this.significance = significance;
	}

	this.text = text;
}

TestResult.prototype.getLevel = function () {
	if (this.significance === 0 || this.value === 2) {
		return 'info';
	} else if (this.value === 1) {
		return 'ok';
	} else if (this.significance === 1) {
		return 'warning';
	} else {
		return 'error';
	}
}

TestResult.prototype.html = function () {
	var
		html,
		valueClass,
		significanceClass;

	valueClass = 'samlmetajs_testvalue' + this.value;
	significanceClass = '';
	if (this.significance !== null) {
		significanceClass = 'samlmetajs_sigvalue' + this.significance;
	}

	html = this.text; // + ' [' + this.significance + '] [' + this.id + ']';
	html = '<div class="samlmetajs_testentry samlmetajs_testentry_' + this.id + ' ' + valueClass + ' ' + significanceClass + '">' + html + '</div>';
	return html;
}


MDException = function (message) {
	this.name = 'Generic SAML Parser Error';
	this.message = message;
}

constants = {
	'ns' : {
		'md': "urn:oasis:names:tc:SAML:2.0:metadata",
		'mdui': "urn:oasis:names:tc:SAML:metadata:ui",
		'mdattr': "urn:oasis:names:tc:SAML:metadata:attribute",
		'saml': "urn:oasis:names:tc:SAML:2.0:assertion",
		'xsd': "http://www.w3.org/2001/XMLSchema",
		'ds': "http://www.w3.org/2000/09/xmldsig#",
		'idpdisc': 'urn:oasis:names:tc:SAML:profiles:SSO:idp-discovery-protocol'
	}
};

function processTest(t) {
	// console.log('processTest(t) ');
	// console.log(t);
	if (settings.testProcessor) settings.testProcessor(t);
}


function validateXML(string) {

	// code for IE
	if (window.ActiveXObject) {

		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.loadXML(string);

		if(xmlDoc.parseError.errorCode!=0) {
			txt="XML Parsing failed error Code: " + xmlDoc.parseError.errorCode + "\n";
			txt=txt+"Reason: " + xmlDoc.parseError.reason;
			txt=txt+"Failed at line: " + xmlDoc.parseError.line;
			throw new MDException(txt);
		} else	{
			return true;
		}

	// code for Mozilla, Firefox, Opera, etc.
	} else if (document.implementation.createDocument) {

		var parser=new DOMParser();
		var xmlDoc=parser.parseFromString(string,"text/xml");

		if (xmlDoc.getElementsByTagName("parsererror").length>0) {
			//throw new MDException(xmlDoc.getElementsByTagName("parsererror")[0]);
			throw new MDException('parse error');
		} else {
			return true;
		}

	} else {
		throw new MDException('Your browser cannot handle XML validation');
	}
}


/*
 * Push new element new element 'n' to an array stored in obj[name]. Create the array if not yet exists.
 */
function apush(obj, name, n) {
	if (!n) return;
	if (!obj[name]) obj[name] = [];
	obj[name].push(n);
}

function dump (node) {

	console.log(node);
	console.log('Node name: ' + nodeName(node));
	console.log('Node namespace: ' + nodeNamespace(node));

}

function nodeName (node) {
	// console.log('nodename: ');
	// console.log(node);
	// console.log(isnode);
	if (isnode) {
		return node.name();
	} else {
		return node.localName;
	}
}

function nodeNamespace (node) {
	if (isnode) {
		return node.namespace().href();
	} else {
		return node.namespaceURI;
	}
}

function nodeIsElement(node) {
	if (isnode) {
		return (node.type() === 'element');
	} else {
		return (node.nodeType === 1);
	}
}

function nodeChildNo (node) {
	if (isnode) {
		return node.childNodes().length;
	} else {
		return node.childNodes.length;
	}
}

function nodeGetChild (node, i) {
	if (isnode) {
		return node.childNodes()[i];
	} else {
		return node.childNodes[i];
	}
}

function nodeGetAttribute (node, attrname, defaultvalue) {
	var attr = null;
	if (isnode) {
		if (node.attr(attrname)) {
			attr = node.attr(attrname).value();
		}
	} else {
		attr = node.getAttribute(attrname);
	}
	if (!attr) return defaultvalue;
	return attr;
}

function nodeGetText(node) {
	if (isnode) {
		return node.text();
	} else {
		return node.textContent;
	}
}

function nodeGetTextRecursive(node) {
	var
		i, curChild, nc, str = '';

	nc = nodeChildNo(node);
	for(i = 0; i < nc; i++) {

		curChild = nodeGetChild(node, i);
		str += nodeGetText(curChild);

	}
	str = str.replace(/\s+/g, ' ');
	str = str.replace(/^\s*/g, '');
	str = str.replace(/\s*$/g, '');
	return str;
}

function expectNode (node, name, namepsace) {
	if (!node) throw new Exception('Expecting node with name [' + name + '] but node was not defined...');
	if (nodeName(node) !== name) throw new MDException('Expecting node with name [' + name + '] but found a [' + nodeName(node) + ']');
	if (nodeNamespace(node) !== namepsace) throw new MDException('Expecting node with namespace [' + namepsace + '] but found a [' + nodeNamespace(node) + ']');
}

function nodeProcessChildren(node, callbacks, fallback) {
	var
		processed = false,
		i, j, curChild, nc;

	nc = nodeChildNo(node);
	for(j = 0; j < nc; j++) {

		curChild = nodeGetChild(node, j);
		if (!nodeIsElement(curChild)) continue;

		for (i = 0; i < callbacks.length; i++) {
			if (callbacks[i].name && callbacks[i].name !== nodeName(curChild)) continue;
			if (callbacks[i].namespace && callbacks[i].namespace !== nodeNamespace(curChild)) continue;

			callbacks[i].callback(curChild, i);
			processed = true;
		}

		if (!processed && typeof fallback === 'function') {
			fallback(curChild);
		}

	}


}


reader = function() {

	this.result = null;

};

validateEmail = function(string) {
	var reg = /^(mailto:)?([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	return reg.test(string);
}

validateURL = function(string) {
	var reg = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return reg.test(string);
}

isHTTPS = function(string) {
	var reg = /(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return reg.test(string);
}

parseFromString = function(xmlstring) {

	var doc = null;
	var result = {};
	var entitydescriptor = null;

	function getDoc(xmlstring) {
		var parser = null;
		if (isnode) {
			// Node.js libxmljs
			return libxmljs.parseXmlString(xmlstring).document().root();

		} else {
			// Browser DOM
			parser = new DOMParser();
			return parser.parseFromString(xmlstring, "text/xml").documentElement;
		}
	}

	function getNewDoc() {
		return getDoc('<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"></md:EntityDescriptor>');
	}

	function parseKeyDescriptor (node) {

		var cert = {};

		expectNode(node, 'KeyDescriptor', constants.ns.md);

		cert.use = nodeGetAttribute(node, 'use', 'both');

		/* ------------
		 * Process children of KeyDescriptor
		 */
		nodeProcessChildren(node, [{

			namespace: constants.ns.ds, name: 'KeyInfo',
			callback: function(n) {

				/* ------------
				 * Process children of KeyInfo
				 */
				nodeProcessChildren(n, [{

					namespace: constants.ns.ds, name: 'X509Data',
					callback: function(n) {

						/* ------------
						 * Process children of X509Data
						 */
						nodeProcessChildren(n, [{
							namespace: constants.ns.ds, name: 'X509Certificate',
							callback: function(n) {
								cert.cert = nodeGetTextRecursive(n);
							}
						}]);

					}

				}]);

			}
		}, {
			namespace:  constants.ns.md, name: 'EncryptionMethod',
			callback: function (n) {
				cert.algorithm = nodeGetAttribute(n, 'Algorithm');
				nodeProcessChildren(n, [{
					namespace: constants.ns.xenc, name: 'KeySize',
					callback: function (n) {
						cert.keySize = nodeGetTextRecursive(n);
					}
				}, {
					name: 'OAEPparams',
					callback: function (n) {
						cert.OAEPparams = nodeGetTextRecursive(n);
					}
				}]);
			}

		}]);

		// console.log('found certificate');
		// console.log(cert);

		if (!cert.cert) {
			processTest(new TestResult('certdatamissing', 'Could not extract certificate data properly from KeyDescriptor element ', 0, 1));
		}

		return cert;
	}

	function getContactPerson (node) {

		var
			person = {},
			contacttype
			;


		expectNode(node, 'ContactPerson', constants.ns.md);

		contacttype = nodeGetAttribute(node, 'contactType');
		person.contactType = contacttype;


		// Process children of ContactPerson
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'Extensions',
				callback: function(n) {
					processTest(new TestResult('contactextension', 'SAMLmetaJS has not yet implemented support for parsing Extensions in ContactPerson'));
				}
			},
			{
				namespace: constants.ns.md, name: 'GivenName',
				callback: function(n) {
					person.givenName = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'SurName',
				callback: function(n) {
					person.surName = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'EmailAddress',
				callback: function(n) {
					person.emailAddress = nodeGetTextRecursive(n);
					if (!validateEmail(person.emailAddress)) {
						processTest(new TestResult('emailaddressformat', 'EmailAddress of ContactPerson was in invalid format', 0, 1));
					}
				}
			},

			{
				namespace: constants.ns.md, name: 'Company',
				callback: function(n) {
					person.company = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'TelephoneNumber',
				callback: function(n) {
					person.telephoneNumber = nodeGetTextRecursive(n);
				}
			}

		// Fallback
		], function(n) {
			processTest(new TestResult('unknowncontactpersonelement', 'Unexpected child element of ContactPerson [' + nodeName(n) + ']', 0, 1));
		});
		return person;
	}

	function parseEndpoint(node) {
		var res = {};
		res.Binding = nodeGetAttribute(node, 'Binding', null);
		res.Location = nodeGetAttribute(node, 'Location', null);
		res.ResponseLocation = nodeGetAttribute(node, 'ResponseLocation', null);
		res.index = nodeGetAttribute(node, 'index', null);
		return res;
	}

	function parseAttributeConsumingService (node) {

		var acs = {};

		expectNode(node, 'AttributeConsumingService', constants.ns.md);

		if (!acs.name) acs.name = {};
		if (!acs.descr) acs.descr = {};
		acs.attributes = {};


		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'ServiceName',
				callback: function(n) {
					var lang = nodeGetAttribute(n, 'xml:lang', 'en');
					var text = nodeGetTextRecursive(n);
					acs.name[lang] = text;

				}
			},
			{
				namespace: constants.ns.md, name: 'ServiceDescription',
				callback: function(n) {
					acs.descr[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'RequestedAttribute',
				callback: function(n) {
					var attrname = nodeGetAttribute(n, 'Name');
					if (attrname) {
						acs.attributes[attrname] = 1;
					}
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('acsunknownchild', 'Unexpected child element of AttributeConsumingService [' + nodeName(n) + ']', 0, 1));
		});

		return acs;
	}


	function parseAttribute (node) {

		var
			attribute = {},
			values = [];

		expectNode(node, 'Attribute', constants.ns.saml);

		attribute.name = nodeGetAttribute(node, 'Name', null);
		attribute.nameFormat = nodeGetAttribute(node, 'NameFormat', null);
		attribute.friendlyName = nodeGetAttribute(node, 'FriendlyName', null);


		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.saml, name: 'AttributeValue',
				callback: function(n) {
					values.push(nodeGetTextRecursive(n));
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('unknownattributecontent', 'Unexpected child element of Attribute [' + nodeName(n) + ']', 0, 1));
		});

		attribute.values = values;
		return attribute;
	}


	function parseUIInfo(node) {

		var mdui = {};

		expectNode(node, 'UIInfo', constants.ns.mdui);

		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.mdui, name: 'DisplayName',
				callback: function(n) {
					if (!mdui.name) mdui.name = {};
					mdui.name[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.mdui, name: 'Description',
				callback: function(n) {
					if (!mdui.descr) mdui.descr = {};
					mdui.descr[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.mdui, name: 'Logo',
				callback: function(n) {
					var lang = nodeGetAttribute(n, 'xml:lang', '');
					if (!mdui.logo) {
						mdui.logo = {};
					}
					mdui.logo[lang] = {
						location: nodeGetTextRecursive(n),
						width: nodeGetAttribute(n, 'width', ''),
						height: nodeGetAttribute(n, 'height', '')
					}
					if (!validateURL(mdui.logo[lang].location)) {
						processTest(new TestResult('MDUILogoInvalidURL', 'Location of Logo was in invalid format', 0, 1));
					}
					if (!isHTTPS(mdui.logo[lang].location)) {
						processTest(new TestResult('MDUILogoURLNotHttps', 'Location of Logo should use the https protocol', 0, 1));
					}
				}
			},
			{
				namespace: constants.ns.mdui, name: 'GeolocationHint',
				callback: function(n) {
					mdui.location = nodeGetTextRecursive(n).substr(4);
				}
			},
			{
				namespace: constants.ns.mdui, name: 'Keywords',
				callback: function (n) {
					if (!mdui.keywords) {
						mdui.keywords = {};
					}
					mdui.keywords[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.mdui, name: 'InformationURL',
				callback: function (n) {
					var url = nodeGetTextRecursive(n);
					if (!mdui.informationURL) {
						mdui.informationURL = {};
					}
					mdui.informationURL[nodeGetAttribute(n, 'xml:lang', 'en')] = url;
					if (!validateURL(url)) {
						processTest(new TestResult('InformationURLInvalidURL', 'InformationURL was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.mdui, name: 'PrivacyStatementURL',
				callback: function (n) {
					var url = nodeGetTextRecursive(n);
					if (!mdui.privacyStatementURL) {
						mdui.privacyStatementURL = {};
					}
					mdui.privacyStatementURL[nodeGetAttribute(n, 'xml:lang', 'en')] = url;
					if (!validateURL(url)) {
						processTest(new TestResult('PrivacyStatementURL', 'PrivacyStatementURL was not a valid URL', 0, 2));
					}
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('mduiunknownchild', 'Parsing of this child element of MDUI not yet implemented [' + nodeName(n) + ']'));
		});

		return mdui;

	}

	function parseSPSSODescriptorExtensions(node, saml2sp) {
		expectNode(node, 'Extensions', constants.ns.md);

		// Process children of Extensions
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.mdui, name: 'UIInfo',
				callback: function(n) {
					saml2sp.mdui = parseUIInfo(n);
				}
			},
			{
				namespace: constants.ns.saml,
				callback: function(n) {
					processTest(new TestResult('extillegalnamespacesaml', 'Illegal namespace (saml) in Extensions at SPSSODescriptor [' + nodeName(n) + ']', 0, 2));
					//throw new MDException('Illegal namespace (saml) in Extensions at SPSSODescriptor: ' + nodeName(n));
				}
			},
			{
				namespace: constants.ns.md,
				callback: function(n) {
					processTest(new TestResult('extillegalnamespacemd', 'Illegal namespace (md) in Extensions at SPSSODescriptor [' + nodeName(n) + ']', 0, 2));
					//throw new MDException('Illegal namespace (md) in Extensions at SPSSODescriptor: ' + nodeName(n));
				}
			},
			{
				namespace: constants.ns.init, name: 'RequestInitiator',
				callback: function (n) {
					var e = parseEndpoint(n);
					apush(saml2sp, 'RequestInitiator', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('RequestInitiatorInvalidURL', 'RequestInitiator/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.idpdisc, namee: 'DiscoveryResponse',
				callback: function (n) {
					var e = parseEndpoint(n);
					apush(saml2sp, 'DiscoveryResponse', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('DiscoveryResponseInvalidURL', 'DiscoveryResponse/@Location was not a valid URL', 0, 2));
					}
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('notimplementedssoext', 'Parsing Extensions at SPSSODescriptor with [' + nodeName(n) + '] not implemented'));
			// console.log('Parsing Extensions at SPSSODescriptor with [' + nodeName(n) + '] not implemented...');
		});
	}

	function parseSAML2SP(node) {

		var
			saml2sp = {}
			;

		expectNode(node, 'SPSSODescriptor', constants.ns.md);

		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'Extensions',
				callback: function(n) {
					parseSPSSODescriptorExtensions(n, saml2sp);
				}
			},
			{
				namespace: constants.ns.md, name: 'KeyDescriptor',
				callback: function(n) {
					apush(saml2sp, 'certs', parseKeyDescriptor(n));
				}
			},
			{
				namespace: constants.ns.md, name: 'ArtifactResolutionService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2sp, 'ArtifactResolutionService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('ArtifactResolutionServiceInvalidURL', 'ArtifactResolutionService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'ManageNameIDService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2sp, 'ManageNameIDService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('ManageNameIDServiceInvalidURL', 'ManageNameIDService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'SingleLogoutService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2sp, 'SingleLogoutService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('SingleLogoutServiceInvalidURL', 'SingleLogoutService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'AssertionConsumerService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2sp, 'AssertionConsumerService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('AssertionConsumerServiceInvalidURL', 'AssertionConsumerService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'AttributeConsumingService',
				callback: function(n) {
					saml2sp.acs = parseAttributeConsumingService(n);
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('saml2spunknownchild', 'Parsing this child of SPSSODescr not yet implemented [' + nodeName(n) + ']'));
		});

		return saml2sp;
	}

	function parseSAML2IDP(node) {

		var
			saml2idp = {}
			;

		expectNode(node, 'IDPSSODescriptor', constants.ns.md);

		// Process children of IDPSSODescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'KeyDescriptor',
				callback: function(n) {
					apush(saml2idp, 'certs', parseKeyDescriptor(n));
				}
			},
			{
				namespace: constants.ns.md, name: 'ArtifactResolutionService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2idp, 'ArtifactResolutionService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('ArtifactResolutionServiceInvalidURL', 'ArtifactResolutionService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'AssertionIDRequestService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2idp, 'AssertionIDRequestService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('AssertionIDRequestServiceInvalidURL', 'AssertionIDRequestService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'ManageNameIDService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2idp, 'ManageNameIDService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('ManageNameIDServiceInvalidURL', 'ManageNameIDService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'NameIDMappingService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2idp, 'NameIDMappingService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('NameIDMappingServiceInvalidURL', 'NameIDMappingService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'SingleLogoutService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2idp, 'SingleLogoutService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('SingleLogoutServiceInvalidURL', 'SingleLogoutService/@Location was not a valid URL', 0, 2));
					}
				}
			},
			{
				namespace: constants.ns.md, name: 'SingleSignOnService',
				callback: function(n) {
					var e = parseEndpoint(n);
					apush(saml2idp, 'SingleSignOnService', e);
					if (!validateURL(e.Location)) {
						processTest(new TestResult('SingleSignOnServiceInvalidURL', 'SingleSignOnService/@Location was not a valid URL', 0, 2));
					}
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('saml2idpunknownchild', 'Parsing this child of IDPSSODescr not yet implemented [' + nodeName(n) + ']'));
		});

		return saml2idp;
	}

	function parseOrganization (node) {

		var
			organization = {
				name: {},
				displayname: {},
				url: {}
			};

		expectNode(node, 'Organization', constants.ns.md);


		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'OrganizationName',
				callback: function(n) {
					organization.name[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'OrganizationDisplayName',
				callback: function(n) {
					organization.displayname[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'OrganizationURL',
				callback: function(n) {
					var url = nodeGetTextRecursive(n);
					organization.url[nodeGetAttribute(n, 'xml:lang', 'en')] = url;
					if (!validateURL(url)) {
						processTest(new TestResult('OrganizationURLInvalidURL', 'OrganizationURL was not a valid URL', 0, 2));
					}
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('OrganizationunknownElement', 'Child element of Organization ' + nodeName(n) + ' not yet implemented'));
		});

		// console.log(organization);
		return organization;
	}

	function parseEntityAttributes (node) {

		var attributes = [];

		expectNode(node, 'EntityAttributes', constants.ns.mdattr);

		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.saml, name: 'Attribute',
				callback: function(n) {
					var newAttr = parseAttribute(n);
					attributes.push(newAttr);
				}
			},
			{
				namespace: constants.ns.saml, name: 'Assertion',
				callback: function(n) {
					processTest(new TestResult('notimplementedentattributesassertion', 'Parsing EntityAttributes with <Assertion> is not yet implemented'));
				}
			},
			{
				namespace: constants.ns.md,
				callback: function(n) {
					processTest(new TestResult('extillegalnamespacemdent', 'Illegal namespace (md) in Extensions at EntityDescriptor [' + nodeName(n) + ']', 0, 2));
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('notimplementedentext', 'Parsing Extensions at EntityDescriptor with [' + nodeName(n) + '] not implemented'));
		});

		return attributes;
	}


	function parseEntityExtensions (node, entity) {
		expectNode(node, 'Extensions', constants.ns.md);

		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.mdattr, name: 'EntityAttributes',
				callback: function(n) {
					entity.entityAttributes = parseEntityAttributes(n);
				}
			},
			{
				namespace: constants.ns.saml,
				callback: function(n) {
					processTest(new TestResult('extillegalnamespacesamlent', 'Illegal namespace (saml) in Extensions at EntityDescriptor [' + nodeName(n) + ']', 0, 2));
				}
			},
			{
				namespace: constants.ns.md,
				callback: function(n) {
					processTest(new TestResult('extillegalnamespacemdent', 'Illegal namespace (md) in Extensions at EntityDescriptor [' + nodeName(n) + ']', 0, 2));
				}
			}
		// Fallback
		], function(n) {
			processTest(new TestResult('notimplementedentext', 'Parsing Extensions at EntityDescriptor with [' + nodeName(n) + '] not implemented'));
		});

	}


	function parseEntityDescriptor (node) {

		var
			entity,
			validuntil, validuntilDate;

		entity = new MDEntityDescriptor();


		expectNode(node, 'EntityDescriptor', constants.ns.md);

		entity.entityid = nodeGetAttribute(node, 'entityID');


		validuntil = nodeGetAttribute(node, 'validUntil');

		if (validuntil) {
			validuntilDate = new Date(validuntil);
			entity.validUntil = validuntilDate.getTime();
		}

		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'Extensions',
				callback: function(n) {
					parseEntityExtensions(n, entity);
					// processTest(new TestResult('entityextensionnotyetimplemented', 'Extension on entity level not yet implemented'));
				}
			},
			{
				namespace: constants.ns.md, name: 'SPSSODescriptor',
				callback: function(n) {
					entity.saml2sp = parseSAML2SP(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'AttributeAuthorityDescriptor',
				callback: function(n) {
					console.log('Parsing AttributeAuthorityDescriptor not yet implemented...');
					processTest(new TestResult('AttributeAuthorityDescriptorNotImplemented', 'Parsing AttributeAuthorityDescriptor not yet implemented'));
				}
			},
			{
				namespace: constants.ns.md, name: 'IDPSSODescriptor',
				callback: function(n) {
					entity.saml2idp = parseSAML2IDP(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'Organization',
				callback: function(n) {
					entity.organization = parseOrganization(n);
				}
			},
			{
				namespace: constants.ns.md, name: 'ContactPerson',
				callback: function(n) {
					apush(entity, 'contacts', getContactPerson(n));
				}
			},
			{
				namespace: constants.ns.ds, name: 'Signature',
				callback: function(n) {
					// console.log('Metadata document contains a signature at entity level.');
				}
			}

		// Fallback
		], function(n) {
			processTest(new TestResult('unknowntoplevelelement', 'SAMLmetaJS found an unexpected element as a child of the EntityDescriptor [' + nodeName(n) + ']', 0, 1));
		});


		return entity;
	}

	function parseEntitiesDescriptor(node) {

		var entity;

		expectNode(node, 'EntitiesDescriptor', constants.ns.md);

		nodeProcessChildren(node, [
			{
				namespace: constants.ns.md, name: 'EntityDescriptor',
				callback: function(n) {
					entity = parseEntityDescriptor(n);
					if (entity.entityid) {
						result[entity.entityid] = entity;
					}
				}
			},
			{
				namespace: constants.ns.ds, name: 'Signature',
				callback: function(n) {
					console.log('Metadata document contains a signature at root level.');
				}
			}

		// Fallback
		], function(n) {
			throw new MDException('Did not expect this element at root level: ' + nodeName(n));
		});

	}


	if (xmlstring) {
		try {
			validateXML(xmlstring);
			doc = getDoc(xmlstring);
			entitydescriptor = parseEntityDescriptor(getDoc(xmlstring));
		} catch (e) {
			console.log(e.message);
			entitydescriptor = parseEntityDescriptor(getNewDoc());
		}
	} else {
		console.log('Empty XML string');
		entitydescriptor = parseEntityDescriptor(getNewDoc());
	}


	if (entitydescriptor.name) {
		// Everthing is OK with the name. No need to override.
	} else if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.mdui && entitydescriptor.saml2sp.mdui.name) {
		entitydescriptor.name = entitydescriptor.saml2sp.mdui.name;
	} else if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.acs && entitydescriptor.saml2sp.acs.name) {
		entitydescriptor.name = entitydescriptor.saml2sp.acs.name;
	}

	if (entitydescriptor.descr) {
		// Everthing is OK with the name. No need to override.
	} else if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.mdui && entitydescriptor.saml2sp.mdui.descr) {
		entitydescriptor.descr = entitydescriptor.saml2sp.mdui.descr;
	} else if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.acs && entitydescriptor.saml2sp.acs.descr) {
		entitydescriptor.descr = entitydescriptor.saml2sp.acs.descr;
	}


	if (!entitydescriptor.name) {
		processTest(new TestResult('noentityname', 'The entity did not include a name', 0, 1));
	}
	if (!entitydescriptor.descr) {
		processTest(new TestResult('noentitydescr', 'The entity did not include a description', 0, 1));
	}
	if (!entitydescriptor.saml2idp && (!entitydescriptor.saml2sp || !entitydescriptor.saml2sp.AssertionConsumerService)) {
		processTest(new TestResult('noacsendpoint', 'The entity did not include an AssertionConsumerService endpoint', 0, 2));
	}

	if (!entitydescriptor.organization) {
		processTest(new TestResult('noorganization', 'The entity does not have information about the Organization', 0, 1));
	}
	if (!entitydescriptor.contacts) {
		processTest(new TestResult('nocontacts', 'The entity does not have information about ContactPersons at all', 0, 1));
	}

	if (entitydescriptor.hasCertOfType('signing')) {
		processTest(new TestResult('hascertsigning', 'The entity does have a signing certificate', 1, 1));
	} else {
		processTest(new TestResult('hascertsigning', 'The entity does NOT have a signing certificate', 0, 1));
	}
	if (entitydescriptor.hasCertOfType('encryption')) {
		processTest(new TestResult('hascertencryption', 'The entity does have a encryption certificate', 1, 1));
	} else {
		processTest(new TestResult('hascertencryption', 'The entity does NOT have a encryption certificate', 0, 1));
	}


	return entitydescriptor;
}


function setup (s) {
	settings = s;
}

if (isnode) {
	exports.parseFromString = parseFromString;
} else {
	window.mdreader = {};
	window.mdreader.parseFromString = parseFromString;
	window.mdreader.setup = setup;
}


})();
