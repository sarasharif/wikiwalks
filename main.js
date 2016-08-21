var map;
var infowindow;

function initMap() {
  var sf = {lat: 37.7749, lng: -122.4194};

  map = new google.maps.Map(document.getElementById('map'), {
    center: sf,
    zoom: 12,
    styles: [
      {
        featureType: 'all',
        stylers: [
          // { hue: '#00ffe6' },
          { saturation: -70 }
        ]
      },{
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [
          { hue: '#00ffee' },
          { saturation: 50 }
        ]
      },{
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [
          { visibility: 'off' }
        ]
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

  infowindow = new google.maps.InfoWindow();

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
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
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

}

function wikiLookup(place) {
  var theUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext&exintro&redirects=&titles=" + place;
  httpGetAsync(theUrl);
}

function httpGetAsync(theUrl) {
  var wikiRequest = new XMLHttpRequest();
  wikiRequest.onreadystatechange = function() {
    if (wikiRequest.readyState == 4 && wikiRequest.status == 200)
      var res = wikiRequest.responseText;
      var pageid = Object.keys(JSON.parse(res).query.pages);
      var info = JSON.parse(res).query.pages[pageid].extract;
      convertToAudio(info);
  };
  wikiRequest.open("GET", theUrl, true); // true for asynchronous
  wikiRequest.setRequestHeader( 'Api-User-Agent', 'sara@sharif.com');
  wikiRequest.setRequestHeader( 'Access-Control-Allow-Origin', 'https://sarasharif.github.io');
  wikiRequest.send(null);
}

function convertToAudio(words) {
  responsiveVoice.speak(words);
}
