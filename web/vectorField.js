
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider"
],
function generateMap(Map, MapView, FeatureLayer, ImageryLayer, Expand, Legend, TimeSlider) {

const map = new Map({
  basemap: "hybrid"
});

const balloonPicture = "https://cdn4.iconfinder.com/data/icons/activity-1-1/32/21-512.png";
const rainPicture = "https://cdn3.iconfinder.com/data/icons/ecology-43/64/x-15-512.png";

const balloonDataFields = ["latitude", "longitude", "elevation", "status", "time", "data"];
const rainDataFields = ["latitude", "longitude"];

const baseView = new MapView({
  container: "viewDiv",
  map: map,
  center: [-120.5724, 34.720],
  zoom: 10
});

var legendExpand = new Expand({
  view: baseView,
  content: new Legend({
    view: baseView
  })
});

baseView.ui.add(legendExpand, "top-right");

const timeSlider = new TimeSlider({
  container: "timeSlider",
  mode: "instant",
  view: baseView,
  timeVisible: true
});
baseView.ui.add(timeSlider, "bottom-left");

var windLayer = new ImageryLayer({
  url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ScientificData/NDFD_wind/ImageServer",
  renderer: {
    type: "vector-field",
    style: "beaufort-kn", // Beaufort point symbol (knots)
    flowRepresentation: "flow-from", // show flow to angle for wind direction
    symbolTileSize: 10,
    visualVariables: [
      {
        type: "size",
        field: "Magnitude", // values read from the first band
        maxDataValue: 32,
        maxSize: "100px",
        minDataValue: 0.04,
        minSize: "8px"
      },
      {
        type: "rotation",
        field: "Direction", // values read from the second band
        rotationType: "geographic"// "arithmetic" is the default
      }
    ]
  }
});

baseView.whenLayerView(windLayer).then(function (lv) {
  const fullTimeExtent = windLayer.timeInfo.fullTimeExtent;

  // set up time slider properties
  timeSlider.fullTimeExtent = fullTimeExtent;
  timeSlider.stops = {
    interval: windLayer.timeInfo.interval
  };
});

map.add(windLayer);

return map;
});