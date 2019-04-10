var query = `SELECT * FROM "12cb3883-56f5-47de-afa5-3b1cf61b257b" WHERE YEAR = '2019'`;

var showingCrimes = false;
var parkingLayer = true;

var parkingIcon = L.icon({
  iconUrl: 'images/parking-icon.png',

  iconSize: [30, 30], // size of the icon
});

var crimesCluster = L.markerClusterGroup({
  chunkedLoading: true,
  spiderfyOnMaxZoom: false, // disable spiderfy
  disableClusteringAtZoom: 18, // at this zoom level and below, markers will not be clustered
  maxClusterRadius: 70 // < default (80) makes more, smaller clusters
});

var map = L.map('leaflet-map', {
  preferCanvas: true
}).setView([42.3601, -71.0589], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiZXJpY2ttb28iLCJhIjoiY2pwMW9zdnplMDB0MDNrcGV3Y3dpdDdxYyJ9.PKvFcq8kWpz8bH3G2taIjA'
}).addTo(map);

loadCrimesLayer();
loadParkingLayer();

function loadCrimesLayer() {
  d3.csv("datasets/filtered-crimes.csv", function(jsonArray) {
    var dataLength = jsonArray.length;
    var latList = [];
    var lonList = [];
    var incidentList = [];
    var dateList = [];

    // iterate over all data points
    for (var i = 0; i < dataLength; i++) {
      latList.push(Number(jsonArray[i].Lat));
      lonList.push(Number(jsonArray[i].Long));
      incidentList.push(jsonArray[i].OFFENSE_DESCRIPTION);
      dateList.push(jsonArray[i].OCCURRED_ON_DATE);
    }

    // Add markers to cluster group
    var crimesMarkerList = [];
    for (var i = 0; i < dataLength; i++) {
      var incident = incidentList[i];
      var date = dateList[i];
      var marker = L.circleMarker(getLatLon(i, latList, lonList), {
        radius: 5,
        color: 'red'
      }).bindPopup(function() {
        return `Offense description: ${incident}<br>
        Date: ${date}`;
      });
      crimesMarkerList.push(marker);
    }

    crimesCluster.addLayers(crimesMarkerList);
    showCrimes();
  });
}

function loadParkingLayer() {
  var request = new XMLHttpRequest();
  request.responseType = 'text';
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      geoJsonData = JSON.parse(request.responseText);
      console.log(geoJsonData);

      parkingLayer = L.geoJSON(geoJsonData, {
          pointToLayer: function(point, latlng) {
            return L.marker(latlng, {
              icon: parkingIcon
            });
          }
        })
        .bindPopup(function(layer) {
          return `Name: ${layer.feature.properties.Name}<br>
        Phone: ${layer.feature.properties.Phone}<br>
        Spaces: ${layer.feature.properties.Spaces}<br>
        Fee: ${layer.feature.properties.Fee}<br>
        Comments: ${layer.feature.properties.Comments}`;
        });
    }
    //console.log(latList)
  };

  request.open('GET', 'datasets/Snow_Emergency_Parking.geojson');
  request.send();
}

function showCrimes() {
  if (showingCrimes) {
    console.log("The map is already showing crimes")
    return;
  }

  if (parkingLayer != null) {
    console.log("removing parking layer")
    parkingLayer.remove();
  }

  crimesCluster.addTo(map);

  showingCrimes = true;
}

function showParking() {
  if (!showingCrimes) {
    console.log("The map is already showing snow emergency parking")
    return;
  }

  if (crimesCluster != null) {
    console.log("removing crime layer")
    crimesCluster.remove();
  }

  parkingLayer.addTo(map);

  showingCrimes = false;
}

// HELPER: Get (lat,lon) for specific point
function getLatLon(i, latList, lonList) {
  return [
    latList[i],
    lonList[i]
  ];
};