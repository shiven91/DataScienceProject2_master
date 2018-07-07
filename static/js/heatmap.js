//----------------------------------------------------------------------------
// Variables for API endpoints
//----------------------------------------------------------------------------
var earthquakeURL = "/earthquakedata";

//----------------------------------------------------------------------------
// Calls function to render map
//----------------------------------------------------------------------------
renderMap(earthquakeURL);

//----------------------------------------------------------------------------
// Function to render map
//----------------------------------------------------------------------------
function renderMap(earthquakeURL) {

  // Performs GET request for the earthquake URL
  d3.json(earthquakeURL, function(data) {
    console.log(earthquakeData)
    var earthquakeData = data;
    createFeatures(earthquakeData);
  });

  // Function to create features
  function createFeatures(earthquakeData) {

      // Defines two functions that are run once for each feature in earthquakeData
      // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
      function onEachQuakeLayer(feature, layer) {
          return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
              fillOpacity: 1,
              color: chooseColor(feature.properties.mag),
              fillColor: chooseColor(feature.properties.mag),
              radius:  markerSize(feature.properties.mag)
          });
      };

      function onEachEarthquake(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3>" 
          + "<hr><p>Magnitude: " + feature.properties.mag + "</p>");
      };

      // Creates a GeoJSON layer containing the features array of the earthquakeData object
      // Run the onEachEarthquake & onEachQuakeLayer functions once for each element in the array
      var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachEarthquake,
        pointToLayer: onEachQuakeLayer
      });

      // Sends earthquakes, fault lines and timeline layers to the createMap function
      createMap(earthquakes);

}

  // Function to create map
  function createMap(earthquakes) {
    // Define outdoors, satellite, and darkmap layers
    // Outdoors layer
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoibWRpYXoiLCJhIjoiY2podjQ5MXFwMDFoOTN2bWRoaXc3MTAybCJ9.vJyWJ8UQhjYGgnWf0BBjMQ");
    // Satellite layer
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoic2l2ZW45MSIsImEiOiJjamh4aWVtbmkwYzRjM3JvNmRqdjZyeTViIn0.sGd70glOwJqjVM6gYXUIrg");
    // Darkmap layer
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoic2l2ZW45MSIsImEiOiJjamh4aWVtbmkwYzRjM3JvNmRqdjZyeTViIn0.sGd70glOwJqjVM6gYXUIrg");

      // Define a baseMaps object to hold base layers
      var baseMaps = {
          "Outdoors": outdoors,
          "Satellite": satellite,
          "Dark Map": darkmap,
      };

      // Create overlay object to hold overlay layers
      var overlayMaps = {
          "Earthquakes": earthquakes,
      };

      // Create map, default settings: outdoors and faultLines layers display on load
      var map = L.map("map", {
          center: [39.8283, -98.5785],
          zoom: 3,
          layers: [darkmap,earthquakes],
          scrollWheelZoom: false
      });

      // Create a layer control
      // Pass in baseMaps and overlayMaps
      // Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
          collapsed: true
      }).addTo(map);

      // Adds Legend
      var legend = L.control({position: 'bottomright'});
      legend.onAdd = function(map) {
          var div = L.DomUtil.create('div', 'info legend'),
                      grades = [0, 1, 2, 3, 4, 5],
                      labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

          for (var i = 0; i < grades.length; i++) {
              div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
          };

          return div;
      };

      legend.addTo(map);

  };

}


//----------------------------------------------------------------------------
// chooseColor function:
// Returns color for each grade parameter using ternary expressions
//----------------------------------------------------------------------------
function chooseColor(magnitude) {
return magnitude > 5 ? "red":
       magnitude > 4 ? "orange":
       magnitude > 3 ? "gold":
       magnitude > 2 ? "yellow":
       magnitude > 1 ? "yellowgreen":
                       "greenyellow"; // <= 1 default
};

//----------------------------------------------------------------------------
// Function to amplify circle size by earthquake magnitude
//----------------------------------------------------------------------------
function markerSize(magnitude) {
  return magnitude * 5;
};
