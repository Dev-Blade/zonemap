import * as L from "leaflet";
import { sectorHeight, sectorMatrix, sectorWidth } from "./ZoneHelpers";

export const createSectorMarkers = (map: L.Map) => {
  map.createPane("sectorMarkersPane");
  for (let y = 0; y < sectorMatrix.length; y++) {
    for (let x = 0; x < sectorMatrix[y].length; x++) {
      const latlng = { lng: x * sectorWidth, lat: -y * sectorHeight };
      const sector = sectorMatrix[y][x];
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: "sectorMarkerIcon",
          iconAnchor: [0, 0],
          iconSize: [0, 0],
          tooltipAnchor: [30, 25],
        }),
        title: sector,
        opacity: 1,
        pane: "sectorMarkersPane",
      });
      marker.bindTooltip(sector, {
        permanent: true,
        direction: "center",
        className: "sectorMarkerTooltip",
        pane: "sectorMarkersPane",
      });
      marker.addTo(map);
    }
  }
};
