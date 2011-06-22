(function($) {
	var SAMLmetaJS = $.fn.SAMLmetaJS;

	$("div#info button.addname").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addInfoname('en', '');
	});
	$("div#info button.adddescr").click(function(e) {
		e.preventDefault();
		SAMLmetaJS.UI.addInfodescr('en', '');
	});

	SAMLmetaJS.plugins.info = {
		tabClick: function (handler) {
			handler($("a[href='#info']"));
		},

		addTab: function (pluginTabs) {

		},

		fromXML: function (entitydescriptor) {
			var l;
			if (!entitydescriptor.entityAttributes) {
				return;
			}

			// Add name and description
			SAMLmetaJS.UI.clearInfoname();
			if (entitydescriptor.name) {
				for (l in entitydescriptor.name) {
					if (entitydescriptor.name.hasOwnProperty(l)) {
						SAMLmetaJS.UI.addInfoname(l, entitydescriptor.name[l]);
					}
				}
			}

			SAMLmetaJS.UI.clearInfodescr();
			if (entitydescriptor.descr) {
				for (l in entitydescriptor.descr) {
					if (entitydescriptor.descr.hasOwnProperty(l)) {
						SAMLmetaJS.UI.addInfodescr(l, entitydescriptor.descr[l]);
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#infoname > div').each(function (index, element) {
                var value = $(element).children('input').attr('value');
				if (!value) {
                    return;
                }
				entitydescriptor.name[$(element).children('select').val()] = value;
			});
			$('div#infodescr > div').each(function (index, element) {
                var value = $(element).find('div > textarea').val();
				if (!value) {
                    return;
                }
				entitydescriptor.descr[$(element).find('div > select').val()] = value;
			});
		}
	};

}(jQuery));
