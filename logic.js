// Store our API endpoint inside queryUrl
// var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Tectonic plates link
var TectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }



  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
 var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    
    pointToLayer: function (feature, latlng) {
      var color;
      var r = 255;
      var g = Math.floor(255-80*feature.properties.mag);
      var b = Math.floor(255-80*feature.properties.mag);
      color= "rgb("+r+" ,"+g+","+ b+")"
      
      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  // var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
  //   "access_token=pk.eyJ1IjoibGtrb3VhbSIsImEiOiJjamh4aHM2d3YwOHFyM3BxczI0ZGY5d2M0In0.Yh4jrAv-Eii4wkJ0g2lSYw");
 
 var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
     "access_token=pk.eyJ1IjoibGtrb3VhbSIsImEiOiJjamh4aHM2d3YwOHFyM3BxczI0ZGY5d2M0In0.Yh4jrAv-Eii4wkJ0g2lSYw");

var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
     "access_token=pk.eyJ1IjoibGtrb3VhbSIsImEiOiJjamh4aHM2d3YwOHFyM3BxczI0ZGY5d2M0In0.Yh4jrAv-Eii4wkJ0g2lSYw");

var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
     "access_token=pk.eyJ1IjoibGtrb3VhbSIsImEiOiJjamh4aHM2d3YwOHFyM3BxczI0ZGY5d2M0In0.Yh4jrAv-Eii4wkJ0g2lSYw");

  // Define a baseMaps object to hold our base layers
var baseMaps = {
    "Satellite Map": satellitemap,
    "Gray Map": graymap,
    "Outdoor Map":outdoormap
  };

  // Add a tectonic plate layer
var tectonicPlates = new L.LayerGroup();
  
// Create overlay object to hold our overlay layer

  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: tectonicPlates
  };

  // Create our map, giving it the satellite map and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [satellitemap, earthquakes]
  });

// Add Fault lines data
  d3.json(TectonicPlatesLink, function(plateData) {
    L.geoJson(plateData, {
      color: "orange",
      weight: 2
    })
    .addTo(tectonicPlates);
  });
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


function getColor(d) {
    return d < 1 ? 'rgb(255,255,255)' :
          d < 2  ? 'rgb(255,225,225)' :
          d < 3  ? 'rgb(255,195,195)' :
          d < 4  ? 'rgb(255,165,165)' :
          d < 5  ? 'rgb(255,135,135)' :
          d < 6  ? 'rgb(255,105,105)' :
          d < 7  ? 'rgb(255,75,75)' :
          d < 8  ? 'rgb(255,45,45)' :
          d < 9  ? 'rgb(255,15,15)' :
                      'rgb(255,0,0)';
}

// Create a legend to display information about our map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
    labels = [];
    div.innerHTML+='Magnitude<br><hr>';
    // 
    
    
    div.classList.add('TEST-CLASS');
    
   
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

}
  

