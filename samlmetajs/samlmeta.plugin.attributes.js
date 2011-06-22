(function($) {
	var SAMLmetaJS = $.fn.SAMLmetaJS;

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

	SAMLmetaJS.plugins.info = {
		tabClick: function (handler) {
			handler($("a[href='#attributes']"));
		},

		addTab: function (pluginTabs) {

		},

		fromXML: function (entitydescriptor) {
			if (!entitydescriptor.entityAttributes) {
				return;
			}

			// Set attributes
			SAMLmetaJS.UI.setAttributes(entitydescriptor.attributes);
		},

		toXML: function (entitydescriptor) {
			$('div#attributes div').each(function(index, element) {
				$(element).find('input:checked').each(function(index2, element2) {
					entitydescriptor.attributes[$(element2).attr('name')] = 1;
				});
			});
		}
	};

}(jQuery));
