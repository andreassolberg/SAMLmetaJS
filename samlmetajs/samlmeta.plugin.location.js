(function($) {
	var SAMLmetaJS = $.fn.SAMLmetaJS;

	SAMLmetaJS.plugins.location = {
		tabClick: function (handler) {
			handler($("a[href='#location']"));
		},

		addTab: function (pluginTabs) {

		},

		fromXML: function (entitydescriptor) {
			var spl, latLng;

			if (!entitydescriptor.entityAttributes) {
				return;
			}

			if (entitydescriptor.location) {
				SAMLmetaJS.UI.setLocation(entitydescriptor.location);
				spl = entitydescriptor.location.split(',');
				latLng = new google.maps.LatLng(spl[0],spl[1]);

				SAMLmetaJS.map.panTo(latLng);
				SAMLmetaJS.mapmarker.setPosition(latLng);
			}
		},

		toXML: function (entitydescriptor) {
			if ($("input#includeLocation").attr('checked')) {
				entitydescriptor.location = $("input#geolocation").val();
			}
		}
	};

}(jQuery));
