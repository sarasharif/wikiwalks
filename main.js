var map;
var infowindow;

function initMap() {
  var sf = {lat: 37.7749, lng: -122.4194};

  map = new google.maps.Map(document.getElementById('map'), {
    center: sf,
    zoom: 12
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

  // var request = {
  //   location: sf,
  //   radius: '1000',
  //   query: 'tourist attraction'
  // };
//   var service = new google.maps.places.PlacesService(map);
//   service.textSearch(request, callback);
// }
//
// function callback(results, status) {
//   if (status === google.maps.places.PlacesServiceStatus.OK) {
//     for (var i = 0; i < results.length; i++) {
//       createMarker(results[i]);
//     }
//   }
// }
//
// function createMarker(place) {
//   var placeLoc = place.geometry.location;
//   var marker = new google.maps.Marker({
//     map: map,
//     position: place.geometry.location
//   });
//

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
  // wikiRequest.setRequestHeader( 'Access-Control-Allow-Origin', 'sara@sharif.com');
  wikiRequest.send(null);
}

function convertToAudio(words) {
  responsiveVoice.speak(words);
}
