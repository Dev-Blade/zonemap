import * as L from "leaflet";
import * as geojson from "geojson";

export const emptyPolygonFeature = (): geojson.Feature<
  geojson.Polygon,
  geojson.GeoJsonProperties
> => ({
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ] as geojson.Position[],
    ],
  },
  properties: {},
});

// --------------------------------------------------------------------------------------------------------------------
export const setFeatureProperty = (
  l: L.Layer,
  property: string,
  value: string
) => {
  let fl: L.Rectangle;
  if (l instanceof L.Rectangle) {
    fl = l as L.Rectangle;
    if (!fl.feature) fl.feature = emptyPolygonFeature(); // ensure feature is defined
    const p = fl.feature.properties;
    p[property] = value;
  }
};

// --------------------------------------------------------------------------------------------------------------------
export const getFeatureProperty = (l: L.Layer, property: string) => {
  let fl: L.Polygon;
  if (l instanceof L.Rectangle) {
    fl = l as L.Polygon;
    if (fl.feature) {
      const p = fl.feature.properties;
      return p[property];
    }
  }
  return undefined;
};

// --------------------------------------------------------------------------------------------------------------------
export const updateTooltip = (r: L.Layer) => {
  const tt = r.getTooltip();
  tt?.setContent(getFeatureProperty(r, "name"));
};

// --------------------------------------------------------------------------------------------------------------------
//          [0, 0],
//          [-160, 160],
export const constrainLatLng = (latlng: L.LatLngExpression) => {
  latlng = L.latLng(latlng);
  if (latlng.lng < 0) latlng.lng = 0;
  if (latlng.lng > 160) latlng.lng = 160;
  if (latlng.lat < -160) latlng.lat = -160;
  if (latlng.lat > 0) latlng.lat = 0;
  return latlng;
};
