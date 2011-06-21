(function($) {
	var SAMLmetaJS = $.fn.SAMLmetaJS;

	$("div#contact button.addcontact").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addContact({});
	});

	SAMLmetaJS.plugins.contact = {
		tabClick: function (handler) {
			handler($("a[href='#contact']"));
		},

		addTab: function (pluginTabs) {

		},

		fromXML: function (entitydescriptor) {
			var i;
			if (!entitydescriptor.entityAttributes) {
				return;
			}

			// Add existing contacts (from XML)
			SAMLmetaJS.UI.clearContacts();
			if (entitydescriptor.contacts) {
				for (i = 0; i < entitydescriptor.contacts.length; i++ ) {
					SAMLmetaJS.UI.addContact(entitydescriptor.contacts[i]);
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#contact fieldset').each(function (index, element) {
				var newContact = {};

				if (!$(element).find('input').eq(1).attr('value')) {
					return;
				}

				newContact.contactType = $(element).find('select').val();
				newContact.givenName = $(element).find('input').eq(0).attr('value');
				newContact.surName = $(element).find('input').eq(1).attr('value');
				newContact.emailAddress = $(element).find('input').eq(2).attr('value');
				entitydescriptor.contacts.push(newContact);
			});
		}
	};

}(jQuery));
