import * as L from "leaflet";
import numeral from "numeral";
import { getFeatureProperty } from "./Features";
import { LatLng } from "leaflet";

/*
        c,
          s = 21.3,
          u = 905424.875, //x
          d = 619679.688, //x
          m = 619609.625, //y
          p = 904430.438, //y
          f = 320,
          g = 1524110.126, //w
          b = 1525034.5,   //h
*/

// S E
// {X=-904775.125 Y=-904754.125 Z=151.764|P=282.723022 Y=54.841599 R=0.000000}

// N W
// {X=623545.312 Y=618411.312 Z=-23.706|P=340.085480 Y=186.315506 R=0.000000}

export const mapWidth = 160;
export const mapHeight = 160;

export const sectorWidth = mapWidth / 5;
export const sectorHeight = mapHeight / 5;

export const scumWidth = 1523700;
export const scumHeight = 1523700;

export const scumSectorWidth = scumWidth / 5;
export const scumSectorHeight = scumHeight / 5;

export const scumOffsetX = 619200;
export const scumOffsetY = 619200;

// corner nw
// X=618500 Y=618500
// corner se
// X=-904800 Y=-904800

export const factorWidth = scumWidth / mapWidth;
export const factorHeight = scumHeight / mapHeight;

export const sectorMatrix = [
  ["D4", "D3", "D2", "D1", "D0"],
  ["C4", "C3", "C2", "C1", "C0"],
  ["B4", "B3", "B2", "B1", "B0"],
  ["A4", "A3", "A2", "A1", "A0"],
  ["Z4", "Z3", "Z2", "Z1", "Z0"],
];

// --------------------------------------------------------------------------------------------------------------------
export const convertGeoToScumPoint = (latlng: L.LatLngExpression) => {
  latlng = L.latLng(latlng);
  latlng.lng = scumOffsetX - latlng.lng * factorWidth;
  latlng.lat = scumOffsetY + latlng.lat * factorHeight;
  return latlng;
};

// --------------------------------------------------------------------------------------------------------------------
export const convertScumToGeoPoint = (latlng: L.LatLngExpression) => {
  latlng = L.latLng(latlng);
  latlng.lng = (scumOffsetX - latlng.lng) / factorWidth;
  latlng.lat = (latlng.lat - scumOffsetY) / factorHeight;
  return latlng;
};

// --------------------------------------------------------------------------------------------------------------------
export const getZoneBounds = (r: L.Rectangle) => {
  const bounds = r.getBounds();
  const scumPointNW = convertGeoToScumPoint(bounds.getNorthWest());
  const scumPointSE = convertGeoToScumPoint(bounds.getSouthEast());
  const format = "0.0000";
  const N = numeral(scumPointNW.lat).format(format);
  const W = numeral(scumPointNW.lng).format(format);
  const S = numeral(scumPointSE.lat).format(format);
  const E = numeral(scumPointSE.lng).format(format);
  return { N, W, S, E };
};

// --------------------------------------------------------------------------------------------------------------------
export const getScumSector = (latlng: L.LatLngExpression) => {
  latlng = L.latLng(latlng);
  const scumPoint = convertGeoToScumPoint(latlng);

  scumPoint.lng -= scumOffsetX;
  scumPoint.lat -= scumOffsetY;
  scumPoint.lng *= -1;
  scumPoint.lat *= -1;

  let x = Math.floor(scumPoint.lng / scumSectorWidth);
  let y = Math.floor(scumPoint.lat / scumSectorHeight);

  let oob = false;
  if (x < 0) {
    x = 0;
    oob = true;
  }
  if (x >= sectorMatrix[0].length) {
    x = sectorMatrix[0].length - 1;
    oob = true;
  }
  if (y < 0) {
    y = 0;
    oob = true;
  }
  if (y >= sectorMatrix.length) {
    y = sectorMatrix.length - 1;
    oob = true;
  }

  let ret = sectorMatrix[y][x] + (oob ? "?" : "");
  return ret;
};

// --------------------------------------------------------------------------------------------------------------------
export const getSortedZones = (
  featuresLayerGroup: L.GeoJSON
): L.Rectangle[] => {
  const f = featuresLayerGroup.getLayers();

  const ret = [] as L.Rectangle[];
  for (const layer of f) {
    if (!(layer instanceof L.Rectangle)) continue;
    ret.push(layer);
  }
  ret.sort((a, b) => {
    const aa = a as L.Rectangle;
    const bb = b as L.Rectangle;
    return aa.feature!.properties.name.localeCompare(
      bb.feature!.properties.name
    );
  });
  return ret;
};

// --------------------------------------------------------------------------------------------------------------------
export const getZoneObject = (r: L.Rectangle) => {
  const n = getFeatureProperty(r, "name");
  const { N, W, S, E } = getZoneBounds(r);
  const obj = {
    Name: n,
    TopLeft: `X=${W} Y=${N}`,
    BottomRight: `X=${E} Y=${S}`,
  };
  return obj;
};

// --------------------------------------------------------------------------------------------------------------------
export const getZoneJson = (r: L.Rectangle): string => {
  const obj = {
    Zones: [getZoneObject(r)],
  };
  return JSON.stringify(obj, null, 1);
};

// --------------------------------------------------------------------------------------------------------------------
export const getAllZonesJson = (featuresLayerGroup: L.GeoJSON): string => {
  const obj: { Zones: object[] } = {
    Zones: [],
  };
  const f = getSortedZones(featuresLayerGroup);
  for (const r of f) obj.Zones.push(getZoneObject(r));

  return JSON.stringify(obj, null, 1);
};

// --------------------------------------------------------------------------------------------------------------------
export const getZoneCommand = (r: L.Rectangle): string => {
  const n = getFeatureProperty(r, "name");

  const { N, W, S, E } = getZoneBounds(r);

  return (
    "#ExportItemSpawnerPresetsInZone " +
    W +
    " " +
    N +
    " " +
    E +
    " " +
    S +
    " " +
    n
  );
};

// --------------------------------------------------------------------------------------------------------------------
export const getTeleportCommand = (latlng: LatLng): string => {
  const scumPoint = convertGeoToScumPoint(latlng);
  const str = "#Teleport " + scumPoint.lng + " " + scumPoint.lat + " 0";
  return str;
};
