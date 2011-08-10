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
	
	MDException,
	constants;

if (typeof window == 'undefined') {
	
	// Node.js external requirements
	libxmljs = require("libxmljs");
	
	isnode = true;
	
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


parseFromString = function(xmlstring) {

	var doc = null;
	var result = {};
	
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
		}]);
		
		// console.log('found certificate');
		// console.log(cert);
		
		
		return cert;
	}
	
	function getContactPerson (node) {

		var 
			person = {},
			contacttype
			;
			
		return null;

		expectNode(node, 'ContactPerson', constants.ns.md);

		contacttype = nodeGetAttribute(node, 'contactType');
		person.contactType = contacttype;
		
		// Process children of ContactPerson
		nodeProcessChildren(node, [
			{	
				namespace: constants.ns.md, name: 'Extensions',
				callback: function(n) {
					console.log('Parsing Extensions within ContactPerson not yet implemented...');
				}
			},
			{	
				namespace: constants.ns.md, name: 'GivenName',
				callback: function(n) {
					person.GivenName = nodeGetTextRecursive(n);
				}
			},
			{	
				namespace: constants.ns.md, name: 'SurName',
				callback: function(n) {
					person.SurName = nodeGetTextRecursive(n);
				}
			},
			{	
				namespace: constants.ns.md, name: 'EmailAddress',
				callback: function(n) {
					person.EmailAddress = nodeGetTextRecursive(n);
				}
			},

			{	
				namespace: constants.ns.md, name: 'Company',
				callback: function(n) {
					person.Company = nodeGetTextRecursive(n);
				}
			},
			{	
				namespace: constants.ns.md, name: 'TelephoneNumber',
				callback: function(n) {
					person.TelephoneNumber = nodeGetTextRecursive(n);
				}
			}

		// Fallback			
		], function(n) {
			throw new MDException('Did not expect this element at contactperson level: ' + nodeName(n));
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
					
					// console.log('Getting ServiceName: ');
					// console.log('Language is ' + lang)
					// console.log(text);
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
			throw new MDException('Did not expect this element at AttributeConsumingService level: ' + nodeName(n));
		});
		
		// console.log(acs);
		

		return acs;

		
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
				namespace: constants.ns.mdui, name: 'GeolocationHint',
				callback: function(n) {
					mdui.location = nodeGetTextRecursive(n).substr(4);
				}
			}
		// Fallback	
		], function(n) {
			console.log('Not implemented parsing of [' + nodeName(n) + '] in MDUI...');
		});
		
		return mdui;
		
	}


	
	function parseSPSSODescriptorExtensions(node, saml2sp) {
		expectNode(node, 'Extensions', constants.ns.md);
		
		// Process children of EntityDescriptor
		nodeProcessChildren(node, [
			{	
				namespace: constants.ns.mdui, name: 'UIInfo',
				callback: function(n) {
					console.log('Parsing UIInfo element');
					saml2sp.mdui = parseUIInfo(n);
				}
			},
			{	
				namespace: constants.ns.saml,
				callback: function(n) {
					throw new MDException('Illegal namespace (saml) in Extensions at SPSSODescriptor: ' + nodeName(n));
				}
			},
			{	
				namespace: constants.ns.md,
				callback: function(n) {
					throw new MDException('Illegal namespace (md) in Extensions at SPSSODescriptor: ' + nodeName(n));
				}
			}
		// Fallback	
		], function(n) {
			console.log('Parsing Extensions at SPSSODescriptor with [' + nodeName(n) + '] not implemented...');
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
					console.log('Parsing Extensions not yet implemented at SPSSODescriptor level ...');
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
				namespace: constants.ns.md, name: 'SingleLogoutService',
				callback: function(n) {
					apush(saml2sp, 'SingleLogoutService', parseEndpoint(n));
				}
			},
			{	
				namespace: constants.ns.md, name: 'AssertionConsumerService',
				callback: function(n) {
					apush(saml2sp, 'AssertionConsumerService', parseEndpoint(n));
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
			throw new MDException('Did not expect this element at SPSSODescr level: ' + nodeName(n));
		});
		
		
		// console.log(entity);
		
		return saml2sp;
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
					organization.url[nodeGetAttribute(n, 'xml:lang', 'en')] = nodeGetTextRecursive(n);
				}
			}
		// Fallback			
		], function(n) {
			throw new MDException('Did not expect this element at organization level: ' + nodeName(n));
		});
		
		
		// console.log(organization);
		
		return organization;
		
		
	}
	
	
	function parseEntityDescriptor (node) {
		
		var 
			entity = {},
			validuntil, validuntilDate;



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
					console.log('Parsing Extensions not yet implemented...');
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
				}
			},
			{	
				namespace: constants.ns.md, name: 'IDPSSODescriptor',
				callback: function(n) {
					console.log('Parsing IDPSSODescriptor not yet implemented...');
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
					console.log('Metadata document contains a signature at entity level.');
				}
			}

		// Fallback			
		], function(n) {
			throw new MDException('Did not expect this element at entity level: ' + nodeName(n));
		});
		
		
		console.log(entity);
		
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
					// console.log('EntityDescriptor found... nice..');
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
	
	

	
	
	
	doc = getDoc(xmlstring);
	
//	parseEntitiesDescriptor(doc);
	
	var entitydescriptor = parseEntityDescriptor(doc);
	
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

	
	// entitydescriptor.getACSname = function() {
	// 	console.log(this);
	// }

	
	try {
		return entitydescriptor;
	} catch (e) {
		console.log(e.message);
	}

	
	// console.log(result);
	
	return result;
}


if (isnode) {
	exports.parseFromString = parseFromString;
} else {
	window.mdreader = {};
	window.mdreader.parseFromString = parseFromString;
}




})();


