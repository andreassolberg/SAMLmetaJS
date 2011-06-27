(function($) {
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

	SAMLmetaJS.plugins.attributes = {
		tabClick: function (handler) {
			handler($("a[href='#attributes']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#attributes">Attributes</a></li>');
			pluginTabs.content.push(
				'<div id="attributes">' +

					'<div class="content"></div>' +

					'<div>' +
						'<button class="selectall">Select all</button>' +
						'<button class="unselectall">Unselect all</button>' +
					'</div>' +

				'</div>'
			);
		},

		fromXML: function (entitydescriptor) {
			var attributeHTML, checked, attrname;
			if (!entitydescriptor.attributes) {
				return;
			}

			// Set attributes
			attributeHTML = '';
			for(attrname in SAMLmetaJS.Constants.attributes) {
                if (SAMLmetaJS.Constants.attributes.hasOwnProperty(attrname)) {
				    checked = (entitydescriptor.attributes[attrname] ? 'checked="checked"' : '');
				    attributeHTML += '<div style="float: left; width: 300px"><input type="checkbox" id="' + attrname + '-id" name="' + attrname + '" ' + checked + '/>' +
					    '<label for="' + attrname + '-id">' + SAMLmetaJS.Constants.attributes[attrname] + '</label></div>';
                }
			}
			attributeHTML += '<br style="height: 0px; clear: both" />';
			$("div#attributes > div.content").empty();
			$("div#attributes > div.content").append(attributeHTML);
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
