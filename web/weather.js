
require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider"
],
function generateMap(Map, SceneView, FeatureLayer, ImageryLayer, Expand, Legend, TimeSlider) {

const map = new Map({
  basemap: "hybrid"
});

const balloonPicture = "https://cdn4.iconfinder.com/data/icons/activity-1-1/32/21-512.png";
const rainPicture = "https://cdn3.iconfinder.com/data/icons/ecology-43/64/x-15-512.png";

const balloonDataFields = ["latitude", "longitude", "elevation", "status", "time", "data"];
const rainDataFields = ["latitude", "longitude"];

const baseView = new SceneView({
  container: "myView",
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

//Trailheads feature layer (points)
const balloonLayer = new FeatureLayer({
  url: "https://services3.arcgis.com/3jMtSgKCt8E2Zfvl/arcgis/rest/services/balloon_data/FeatureServer",
  outFields: balloonDataFields,
  popupTemplate: getPopupFormat("Weather Balloon", balloonDataFields),
  renderer: renderIcon(balloonPicture, 32),
  elevationInfo: {
    mode: "relative-to-ground",
    unit: "feet",
    featureExpressionInfo: {
      expression: "$feature.elevation"
    }
  },
});

const rainLayer = new FeatureLayer({
  url: "https://services3.arcgis.com/3jMtSgKCt8E2Zfvl/arcgis/rest/services/rainlocations/FeatureServer",
  outFields: rainDataFields,
  popupTemplate: getPopupFormat("Rain", rainDataFields),
  renderer: renderIcon(rainPicture, 64),
});

map.add(balloonLayer);
map.add(rainLayer);

return map;
});

function getPopupFormat(title, dataFields) {
  let content = "";
  for(var i=0; i < dataFields.length; i++) {
    content += `<b>${dataFields[i]}:</b> {${dataFields[i]}}`
    content += (i < dataFields.length - 1) ? "<br> " : ""
  }
  return {
  "title": title,
  "content": content
  }
}

function renderIcon(iconURL, size) {
  return {
    "type": "simple",
    "symbol": {
      type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
      url: iconURL, //dynamic s3 location of picture including picture as KEY
      width: parseInt(size) + "px",
      height: parseInt(size) + "px"
    }
  }
}