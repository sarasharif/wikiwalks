var map;
var infowindow;

function initMap() {
  var sf = {lat: 37.7749, lng: -122.4194};

  map = new google.maps.Map(document.getElementById('map'), {
    center: sf,
    zoom: 12
  });

  infowindow = new google.maps.InfoWindow();
  var request = {
    location: sf,
    radius: '1000',
    query: 'tourist attraction'
  };
  var service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    wikiLookup(place.name);
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
  // wikiRequest.setRequestHeader( 'Access-Control-Allow-Origin', 'sara@sharif.com');
  wikiRequest.send(null);
}

function convertToAudio(words) {
  responsiveVoice.speak(words);
}
