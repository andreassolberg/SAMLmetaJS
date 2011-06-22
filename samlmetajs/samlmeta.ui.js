

SAMLmetaJS.Constants = {
	'ns' : {
		'md': "urn:oasis:names:tc:SAML:2.0:metadata",
		'mdui': "urn:oasis:names:tc:SAML:metadata:ui",
		'mdattr': "urn:oasis:names:tc:SAML:metadata:attribute",
		'saml': "urn:oasis:names:tc:SAML:2.0:assertion",
		'xsd': "http://www.w3.org/2001/XMLSchema",
		'ds': "http://www.w3.org/2000/09/xmldsig#"
	},
	'certusage': {
		'both': 'Both',
		'signing': 'Signing',
		'encryption': 'Encryption'
	},
	'languages': {
		'en': 'English',
		'no': 'Norwegian (bokmål)',
		'nn': 'Norwegian (nynorsk)',
		'se': 'Sámegiella',
		'da': 'Danish',
		'de': 'German',
		'sv': 'Swedish',
		'fi': 'Finnish',
		'es': 'Español',
		'fr': 'Français',
		'it': 'Italian',
		'nl': 'Nederlands',
		'lb': 'Luxembourgish',
		'cs': 'Czech',
		'sl': 'Slovenščina',
		'lt': 'Lietuvių kalba',
		'hr': 'Hrvatski',
		'hu': 'Magyar',
		'pl': 'Język polski',
		'pt': 'Português',
		'pt-BR': 'Português brasileiro',
		'tr': 'Türkçe',
		'el': 'ελληνικά',
		'ja': 'Japanese (日本語)'
	},
	'contactTypes' : {
		'admin' : 'Administrative',
		'technical': 'Technical',
		'support': 'Support'
	},
	'endpointTypes' : {
		'sp': {
			'AssertionConsumerService': 'AssertionConsumerService',
			'SingleLogoutService': 'SingleLogoutService'
		},
		'idp' : {}
	},
	'bindings': {
		'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect': 'HTTP Redirect',
		'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST': 'HTTP POST',
		'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact': 'HTTP Artifact',
		'urn:oasis:names:tc:SAML:2.0:bindings:SOAP': 'SOAP',
		'urn:oasis:names:tc:SAML:2.0:bindings:PAOS': 'Reverse SOAP (PAOS)'
	},
	'attributes' : {
		'urn:oid:0.9.2342.19200300.100.1.1': 'uid',
		'urn:oid:0.9.2342.19200300.100.1.10': 'manager',
		'urn:oid:0.9.2342.19200300.100.1.2': 'textEncodedORAddress',
		'urn:oid:0.9.2342.19200300.100.1.20': 'homePhone',
		'urn:oid:0.9.2342.19200300.100.1.22': 'otherMailbox',
		'urn:oid:0.9.2342.19200300.100.1.3': 'mail',
		'urn:oid:0.9.2342.19200300.100.1.39': 'homePostalAddress',
		'urn:oid:0.9.2342.19200300.100.1.40': 'personalTitle',
		'urn:oid:0.9.2342.19200300.100.1.41': 'mobile',
		'urn:oid:0.9.2342.19200300.100.1.42': 'pager',
		'urn:oid:0.9.2342.19200300.100.1.43': 'co',
		'urn:oid:0.9.2342.19200300.100.1.6': 'roomNumber',
		'urn:oid:0.9.2342.19200300.100.1.60': 'jpegPhoto',
		'urn:oid:0.9.2342.19200300.100.1.7': 'photo',
		'urn:oid:1.2.840.113549.1.9.1': 'email',
		'urn:oid:1.3.6.1.4.1.2428.90.1.1': 'norEduOrgUniqueNumber',
		'urn:oid:1.3.6.1.4.1.2428.90.1.11': 'norEduOrgSchemaVersion',
		'urn:oid:1.3.6.1.4.1.2428.90.1.12': 'norEduOrgNIN',
		'urn:oid:1.3.6.1.4.1.2428.90.1.2': 'norEduOrgUnitUniqueNumber',
		'urn:oid:1.3.6.1.4.1.2428.90.1.3': 'norEduPersonBirthDate',
		'urn:oid:1.3.6.1.4.1.2428.90.1.4': 'norEduPersonLIN',
		'urn:oid:1.3.6.1.4.1.2428.90.1.5': 'norEduPersonNIN',
		'urn:oid:1.3.6.1.4.1.2428.90.1.6': 'norEduOrgAcronym',
		'urn:oid:1.3.6.1.4.1.2428.90.1.7': 'norEduOrgUniqueIdentifier',
		'urn:oid:1.3.6.1.4.1.2428.90.1.8': 'norEduOrgUnitUniqueIdentifier',
		'urn:oid:1.3.6.1.4.1.2428.90.1.9': 'federationFeideSchemaVersion',
		'urn:oid:1.3.6.1.4.1.250.1.57': 'labeledURI',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.1': 'eduPersonAffiliation',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.10': 'eduPersonTargetedID',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.2': 'eduPersonNickname',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.3': 'eduPersonOrgDN',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.4': 'eduPersonOrgUnitDN',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.5': 'eduPersonPrimaryAffiliation',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.6': 'eduPersonPrincipalName',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.7': 'eduPersonEntitlement',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.8': 'eduPersonPrimaryOrgUnitDN',
		'urn:oid:1.3.6.1.4.1.5923.1.1.1.9': 'eduPersonScopedAffiliation',
		'urn:oid:1.3.6.1.4.1.5923.1.2.1.2': 'eduOrgHomePageURI',
		'urn:oid:1.3.6.1.4.1.5923.1.2.1.3': 'eduOrgIdentityAuthNPolicyURI',
		'urn:oid:1.3.6.1.4.1.5923.1.2.1.4': 'eduOrgLegalName',
		'urn:oid:1.3.6.1.4.1.5923.1.2.1.5': 'eduOrgSuperiorURI',
		'urn:oid:1.3.6.1.4.1.5923.1.2.1.6': 'eduOrgWhitePagesURI',
		'urn:oid:1.3.6.1.4.1.5923.1.5.1.1': 'isMemberOf',
		'urn:oid:2.16.840.1.113730.3.1.241': 'displayName',
		'urn:oid:2.16.840.1.113730.3.1.3': 'employeeNumber',
		'urn:oid:2.16.840.1.113730.3.1.39': 'preferredLanguage',
		'urn:oid:2.16.840.1.113730.3.1.4': 'employeeType',
		'urn:oid:2.16.840.1.113730.3.1.40': 'userSMIMECertificate',
		'urn:oid:2.5.4.10': 'o',
		'urn:oid:2.5.4.11': 'ou',
		'urn:oid:2.5.4.12': 'title',
		'urn:oid:2.5.4.13': 'description',
		'urn:oid:2.5.4.16': 'postalAddress',
		'urn:oid:2.5.4.17': 'postalCode',
		'urn:oid:2.5.4.18': 'postOfficeBox',
		'urn:oid:2.5.4.19': 'physicalDeliveryOfficeName',
		'urn:oid:2.5.4.20': 'telephoneNumber',
		'urn:oid:2.5.4.21': 'telexNumber',
		'urn:oid:2.5.4.3': 'cn',
		'urn:oid:2.5.4.36': 'userCertificate',
		'urn:oid:2.5.4.4': 'sn',
		'urn:oid:2.5.4.41': 'name',
		'urn:oid:2.5.4.42': 'givenName',
		'urn:oid:2.5.4.7': 'l',
		'urn:oid:2.5.4.9': 'street'
	}
};






// This object allows you to update UI elements on the page, using various
// simple functions to add and clear UI elements.
SAMLmetaJS.UI = {

	"embrace": function(node) {


		$(node).wrap('<div id="rawmetadata"></div>');
		$(node).parent().wrap('<div id="tabs" />');


		var metatab = $(node).parent();
		var tabnode = $(node).parent().parent();

		var pluginTabs = {'list': [], 'content': []};
		SAMLmetaJS.pluginEngine.execute('addTab', [pluginTabs]);


		metatab.append('<div>' +
							'<button class="prettify">Pretty format</button>' +
							'<button class="wipe">Wipe</button>' +
						'</div>');

		tabnode.prepend('<ul>' +
							'<li><a href="#rawmetadata">Metadata</a></li>' +
							'<li><a href="#saml2sp">SAML Endpoints</a></li>' +
							'<li><a href="#certs">Certificates</a></li>' +
							pluginTabs.list.join('') +
						'</ul>');
		tabnode.append('<div id="saml2sp">' +
							'<div class="content"></div>' +
							'<div><button class="addendpoint">Add new endpoint</button></div>' +
						'</div>' +

						'<div id="certs">' +

							'<div class="content"></div>' +
							'<div><button class="addcert">Add new certificate</button></div>' +

						'</div>'  + pluginTabs.content.join(''));

	},






	"setEntityID": function(entityid) {
		$("input#entityid").val(entityid);
	},

	"addCert": function(use, cert) {

		var infoHTML;
		var randID = 'cert' + Math.floor(Math.random() * 10000 + 1000);

		infoHTML = '<fieldset><legend>Certificate</legend>' +
				'<select class="certuse" name="' + randID + '-use-name" id="' + randID + '-use">';


		for (var key in SAMLmetaJS.Constants.certusage) {
			var checked = '';
			if (key == use) checked = ' selected="selected" ';
			infoHTML += '<option value="' + key + '" ' + checked + '>' +
				SAMLmetaJS.Constants.certusage[key] +
				'</option>';
		}


		infoHTML += '</select>' +
			'<textarea class="certdata" style="" name="' + randID + '-data" id="' + randID + '-data-name">' + (cert || '') + '</textarea>' +
			'<button style="display: block" class="removecert">Remove</button>' +
			'</fieldset>';

		$(infoHTML).appendTo("div#certs > div.content").find('button.removecert').click(function(e) {
			e.preventDefault();
			$(e.target).closest('fieldset').remove();
		});
	},
	"clearCerts": function() {
		$("div#certs > div.content").empty();
	},

	"clearEndpoints": function() {
		$("div#saml2sp > div.content").empty();
	},
	"addEndpoint": function(endpoint, endpointname) {

		var checked, endpointHTML;
		var randID ='endpoint-' + Math.floor(Math.random() * 10000 + 1000);

		// ---- Type of endpoint selector
		endpointHTML = '<fieldset><legend>' + (endpointname || 'Endpoint') + '</legend>' +
			'<div class="endpointfield">' +
				'<label for="' + randID + '-type">Endpoint type: </label>' +
				'<select class="datafield-type" name="' + randID + '-type-name" id="' + randID + '-type">';

		for (var endpointType in SAMLmetaJS.Constants.endpointTypes.sp) {
			checked = '';
			if (endpointType == endpointname) {
				checked = ' selected="selected" ';
			}
			endpointHTML += '<option value="' + endpointType + '" ' + checked + '>' +
				SAMLmetaJS.Constants.endpointTypes.sp[endpointType] +
				'</option>';
		}
		endpointHTML += '</select></div>';

		if (endpoint.index) {
			endpointHTML += '<input type="hidden" class="datafield-index" id="' + randID + '-binding" name="' + randID + '-index-name" value="' +
				endpoint.index + '" />';
		}


		// ---- Binding
		endpointHTML += '<div class="endpointfield"><label for="' + randID + '-binding">Binding: </label>' +
				'<select class="datafield-binding" name="' + randID + '-binding-name" id="' + randID + '-binding">';

		var foundBinding = false;
		for (var binding in SAMLmetaJS.Constants.bindings) {
			checked = '';
			if (endpoint.Binding == binding) {
				checked = ' selected="selected" ';
				foundBinding = true;
			}
			endpointHTML += '<option value="' + binding + '" ' + checked + '>' +
				SAMLmetaJS.Constants.bindings[binding] +
				'</option>';
		}
		if (endpoint.Binding && !foundBinding) {
			endpointHTML += '<option value="' + endpoint.Binding + '" selected="selected">Unknown binding (' + endpoint.Binding + ')</option>';
		}
		endpointHTML += '</select>' +
			'</div>';


		// Text field for location
		endpointHTML +=	'<div class="endpointfield endpointfield-location">' +
				'<label for="' + randID + '-location">  Location</label>' +
				'<input class="datafield-location" type="text" name="' + randID + '-location-name" id="contact-' + randID + '-location" value="' + (endpoint.Location || '') + '" /></div>';

		// Text field for response location
		endpointHTML +=	'<div class="endpointfield">' +
				'<label for="' + randID + '-locationresponse">  Response location</label>' +
				'<input class="datafield-responselocation" type="text" name="' + randID + '-locationresponse-name" id="contact-' + randID + '-locationresponse" value="' + (endpoint.ResponseLocation || '') + '" />' +
			'</div>';


		endpointHTML += '<button style="display: block; clear: both" class="remove">Remove</button>' +
			'</fieldset>';

		$(endpointHTML).appendTo("div#saml2sp > div.content").find('button.remove').click(function(e) {
			e.preventDefault();
			$(e.target).closest('fieldset').remove();
		});

	}
};



