function initMap() {

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 12,
    styles: [
      {
        featureType: 'all',
        stylers: [ { saturation: -70 } ]
      },{
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [ { saturation: 10 } ]
      },{
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [ { visibility: 'off' } ]
      }
    ]
  });

  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var markers = [];
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var infowindow = new google.maps.InfoWindow();
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
         return;
      }

      var marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
        wikiLookup(place.name);
      });

      markers.push(marker);

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

function wikiLookup(place) {
  $wgCrossSiteAJAXdomains = ['/http:\/\/[a-z\-]{2,}\.wikipedia\.org/', '/http:\/\/[a-z\-]{2,}\.wikinews\.org/', '/http:\/\/[a-z\-]{2,}\.wiktionary\.org/', '/http:\/\/[a-z\-]{2,}\.wikibooks\.org/', '/http:\/\/[a-z\-]{2,}\.wikiversity\.org/', '/http:\/\/[a-z\-]{2,}\.wikipedia\.org/', '/http:\/\/[a-z\-]{2,}\.wikisource\.org/', '/http:\/\/[a-z\-]{2,}\.wikiquote\.org/', '/http:\/\/(?!upload)[a-z\-]{2,}\.wikimedia\.org/' ];
  $.ajax({
    url: "https://en.wikipedia.org/w/api.php?prop=extracts&explaintext&exintro&redirects=",
    data: {
        action: 'query',
        meta: 'userinfo',
        format: 'json',
        origin: '*',
        titles: place
    },
    dataType: 'json',
    success: function (data) {
      var info = parseWiki(data);
      convertToAudio(info);
    }
  });
}

function parseWiki(data) {
  var pageid = Object.keys(data.query.pages);
  info = data.query.pages[pageid].extract;
  return info;
}

function convertToAudio(info) {
  responsiveVoice.speak(info);
}
