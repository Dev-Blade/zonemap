import * as L from "leaflet";
import { loadFromStorage, saveToStorage } from "../utils/storage";
import { constrainLatLng } from "./Features";

interface MapView {
  center: L.LatLngExpression;
  zoom: number;
}

// --------------------------------------------------------------------------------------------------------------------
export const loadView = (map: L.Map) => {
  const objectOut = loadFromStorage("view") as MapView;
  if (!objectOut) {
    console.log("NOTHING loaded");
    return;
  }

  const latlng = constrainLatLng(L.latLng(objectOut.center));

  map.setView(latlng, objectOut.zoom, { animate: false });
};

// --------------------------------------------------------------------------------------------------------------------
export const saveView = (map: L.Map) => {
  const objectOut: MapView = {
    center: map.getCenter(),
    zoom: map.getZoom(),
  };
  saveToStorage("view", objectOut);
};

// --------------------------------------------------------------------------------------------------------------------
export const saveZones = (featuresLayerGroup: L.GeoJSON | undefined) => {
  if (!featuresLayerGroup) {
    console.error("saveZones(): features layer is undefined");
    return;
  }
  const objectOut = featuresLayerGroup.toGeoJSON();

  //console.log(objectOut);
  saveToStorage("zones", objectOut);
  //console.log("zones saved");
};
