import { Alert } from "flowbite-react";

import { createContext } from "react";
import * as uuid from "uuid";
import * as geojson from "geojson";
import * as L from "leaflet";

import "leaflet-shades";
import "leaflet-editable";
import "leaflet-easybutton";

import "leaflet/dist/leaflet.css"; // <- Leaflet styles

import { useEffect, useRef, useState } from "react";

import "../assets/css/Map.css";

import { Menu, getContextMenu, hideContextMenu, showContextMenu } from "./Menu";
import { loadView, saveView, saveZones } from "../helpers/Storage";
import { MySidePanel } from "./MySidePanel";
import {
  constrainLatLng,
  emptyPolygonFeature,
  setFeatureProperty,
  updateTooltip,
} from "../helpers/Features";
import { MyTooltip } from "../helpers/MyTooltip";
import { loadFromStorage } from "../utils/storage";
import { createSectorMarkers } from "../helpers/Map";
import { getTeleportCommand } from "../helpers/ZoneHelpers";

export interface MapContextProps {
  map?: L.Map;
  featuresLayerGroup?: L.GeoJSON;
  editLayerGroup?: L.LayerGroup | undefined;
  selectedLayer?: L.Layer | undefined;
  setSelectedLayer?: React.Dispatch<React.SetStateAction<L.Layer | undefined>>;

  changeCount: number;
  setChangeCount: React.Dispatch<React.SetStateAction<number>>;

  toggle?: boolean;
  setToggle?: React.Dispatch<React.SetStateAction<boolean>>;
  tab?: string;
  setTab?: React.Dispatch<React.SetStateAction<string>>;
  zoneData?: geojson.FeatureCollection<any>;
  setZoneData?: React.Dispatch<
    React.SetStateAction<geojson.FeatureCollection<any> | undefined>
  >;
}

export const mapContext = createContext<MapContextProps>({
  map: undefined,
  featuresLayerGroup: undefined,
  editLayerGroup: undefined,
  selectedLayer: undefined,
  setSelectedLayer: () => {},
  tab: "tab-1",
  setTab: () => {},
  setZoneData: () => {},
  changeCount: 0,
  setChangeCount: () => {},
});

let onMapMouseDown = (e: L.LeafletMouseEvent) => {};
let onMapClick = (e: L.LeafletMouseEvent) => {};
let onKeyUp = (e: KeyboardEvent) => {};
let mapButton: L.Control.EasyButton | undefined = undefined;

let timeOutAlert: NodeJS.Timeout;

const Map = (): JSX.Element => {
  const [refMap, setRefMap] = useState<HTMLElement | null>(null);

  const [selectedLayer, setSelectedLayer] = useState<L.Layer | undefined>();
  const [panelIsOpen, setPanelIsOpen] = useState<boolean>(false);
  const [alertIsOpen, setAlertIsOpen] = useState<boolean>(false);
  const [alertContent, setAlertContent] = useState<string>("");

  const [teleportButton, setTeleportButton] = useState<boolean>(false);

  const [mouseDownBeforeClick, setMouseDownBeforeClick] =
    useState<boolean>(false);

  const [tabName, setTabName] = useState<string>("tab-1");

  const [featuresLayerGroup, setFeaturesLayerGroup] = useState<
    L.GeoJSON | undefined
  >();
  const [editLayerGroup, setEditLayerGroup] = useState<
    L.LayerGroup | undefined
  >();

  const [zoneData, setZoneData] = useState<
    geojson.FeatureCollection<any> | undefined
  >();

  const [changeCount, setChangeCount] = useState<number>(0);
  const m = useRef<L.Map | undefined>(undefined);

  const showPosition = (e: L.LeafletMouseEvent) => {
    console.log("dblclick");
    const str = getTeleportCommand(e.latlng);
    setAlertContent(str);
    navigator.clipboard.writeText(str);
    setAlertIsOpen(true);

    clearTimeout(timeOutAlert);
    timeOutAlert = setTimeout(() => {
      setAlertIsOpen(false);
    }, 2000);
  };

  // to keep layer clicks working with react
  featuresLayerGroup?.eachLayer((layer) => {
    // Guard
    if (!(layer instanceof L.Rectangle)) return;

    layer.off("click");
    layer.on("click", L.DomEvent.stop); // prevent adding rectangle inside rectangle
    layer.on("click", (e: L.LeafletMouseEvent) => {
      console.log("layer click");
      if (teleportButton) {
        showPosition(e);
        setTeleportButton(false);
        mapButton?.state("teleport");
      } else {
        setSelectedLayer(e.target);
        setPanelIsOpen(true);
      }
      hideContextMenu();
      setMouseDownBeforeClick(false);
    });
  });

  m.current?.off("mousedown", onMapMouseDown);
  onMapMouseDown = (e: L.LeafletMouseEvent) => {
    //console.log("map mousedown");
    setMouseDownBeforeClick(true);
  };
  m.current?.on("mousedown", onMapMouseDown);

  m.current?.off("click", onMapClick);
  onMapClick = (e: L.LeafletMouseEvent) => {
    //console.log("map click", mouseDownBeforeClick);
    if (mouseDownBeforeClick) {
      setMouseDownBeforeClick(false);
      if (teleportButton) {
        showPosition(e);
        mapButton?.state("teleport");
        setTeleportButton(false);
      } else {
        setSelectedLayer(undefined);
        if (tabName === "tab-1") setPanelIsOpen(false);
      }
    }
  };
  m.current?.on("click", onMapClick);

  document.removeEventListener("keyup", onKeyUp);
  onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "t") {
      if (mapButton) {
        mapButton.state(teleportButton ? "teleport" : "teleporting");
        setTeleportButton(!teleportButton);
      }
    }
  };
  document.addEventListener("keyup", onKeyUp);

  // --------------------------------------------------------------------------------------------------------------------
  const setupRectangle = (
    rectangle: L.Rectangle,
    featuresLayerGroup: L.GeoJSON,
  ) => {
    if (!featuresLayerGroup) {
      console.error("setupRectangle(): features layer is undefined");
      return;
    }
    if (!rectangle) {
      console.error("setupRectangle(): rectangle is undefined");
      return;
    }

    const tooltip = new MyTooltip({
      content: "",
      permanent: true,
      sticky: false,
      pane: "tooltipPane",
      direction: "left",
      offset: L.point({ x: -0, y: 0 }),
      className: "Tooltip areaTooltip",
      rectangle: rectangle,
    });

    rectangle.bindTooltip(tooltip);
    tooltip.openTooltip(rectangle.getBounds().getNorthWest());

    rectangle.on("contextmenu", L.DomEvent.stop);
    rectangle.on("contextmenu", (e) => {
      console.log("contextmenu");

      const menu = getContextMenu();
      if (menu) {
        setSelectedLayer(rectangle);
        showContextMenu();
        menu.style.left = e.originalEvent.clientX + "px";
        menu.style.top = e.originalEvent.clientY + "px";
      }
    });

    rectangle.on("editable:editing", (e: L.LeafletEvent) => {
      hideContextMenu();
    });

    let c = changeCount;

    rectangle.on(
      "editable:dragend editable:vertex:dragend",
      (e: L.LeafletEvent) => {
        setSelectedLayer(rectangle);
        updateTooltip(rectangle!);
        saveZones(featuresLayerGroup);
        setChangeCount(c++);
      },
    );
    updateTooltip(rectangle);
  };

  // --------------------------------------------------------------------------------------------------------------------
  const reCreateZones = () => {
    if (!featuresLayerGroup) {
      console.log("no features layer group");
      return;
    }
    if (!zoneData) {
      console.log("no zone data");
      return;
    }

    featuresLayerGroup.clearLayers();

    for (const feature of zoneData.features) {
      //if (!feature.properties) feature.properties = {};
      //feature.properties.editable = true;

      const p = feature.properties;
      switch (feature.geometry.type) {
        case "Polygon":
          {
            const g = feature.geometry as geojson.Polygon;
            // SW
            const latlng0 = constrainLatLng(
              L.latLng([g.coordinates[0][0][1], g.coordinates[0][0][0]] as [
                number,
                number,
              ]),
            );
            // NE
            const latlng1 = constrainLatLng(
              L.latLng([g.coordinates[0][2][1], g.coordinates[0][2][0]] as [
                number,
                number,
              ]),
            );

            const l = L.latLngBounds(latlng0, latlng1);
            const rectangle = L.rectangle(l, {
              noClip: true,
              pane: "featuresPane",
              className: "ScumZone",
            }).addTo(featuresLayerGroup);
            rectangle.feature = emptyPolygonFeature();
            rectangle.feature.properties = p;
            setupRectangle(rectangle, featuresLayerGroup);
          }
          break;
      }
    }
    console.log("zones recreated");
    setSelectedLayer(undefined);
    saveZones(featuresLayerGroup);
    setChangeCount(changeCount + 1);
  };

  // --------------------------------------------------------------------------------------------------------------------
  const loadZones = (map: L.Map, featuresLayerGroup: L.GeoJSON) => {
    let objectOut: geojson.FeatureCollection<any> = loadFromStorage(
      "zones",
    ) as geojson.FeatureCollection<any>;
    if (!objectOut) {
      console.log("NOTHING loaded");
      objectOut =
        featuresLayerGroup.toGeoJSON() as geojson.FeatureCollection<any>;
    }
    setZoneData(objectOut);
    console.log("zones loaded");
  };

  useEffect(() => {
    reCreateZones();
  }, [zoneData]);

  useEffect(() => {
    const unselect = (layer: L.Layer) => {
      switch (true) {
        case layer instanceof L.Rectangle:
          {
            const r = layer as L.Rectangle;
            r.disableEdit();
            r.setStyle({
              color: "red",
              fillColor: "red",
              weight: 2,
            });
          }
          break;
      }
    };
    const select = (layer: L.Layer) => {
      switch (true) {
        case layer instanceof L.Rectangle:
          const rectangle = layer as L.Rectangle;
          rectangle.enableEdit();
          rectangle.setStyle({
            color: "red",
            fillColor: "yellow",
            weight: 2,
          });
          break;
      }
      setTabName("tab-1");
    };

    let hc = false;
    featuresLayerGroup?.eachLayer((layer) => {
      // Guard
      if (!(layer instanceof L.Rectangle)) return;

      if (layer === selectedLayer) {
        hc = true;
        select(layer);
      } else unselect(layer);
    });
    if (!hc) {
      hideContextMenu();
    }
  }, [zoneData, selectedLayer, featuresLayerGroup]);

  useEffect(() => {
    if (m.current) {
      if (teleportButton) {
        L.DomUtil.addClass(
          m.current.getContainer(),
          "crosshair-cursor-enabled",
        );
        const zs = document.getElementsByClassName("ScumZone");
        for (const z of zs) {
          z.classList.add("crosshair-cursor-enabled");
        }
      } else {
        L.DomUtil.removeClass(
          m.current.getContainer(),
          "crosshair-cursor-enabled",
        );
        const zs = document.getElementsByClassName("ScumZone");
        for (const z of zs) {
          z.classList.remove("crosshair-cursor-enabled");
        }
      }
    }
  }, [teleportButton]);

  useEffect(() => {
    if (refMap) {
      console.log("Map container is mounted");

      if (m.current) m.current.remove(); // remove the map if it exists

      const editLayerGroup = new L.LayerGroup([], { pane: "editPane" });

      const geoJsonOptions: L.GeoJSONOptions = {
        pane: "featuresPane",
        bubblingMouseEvents: false,
        onEachFeature: (
          feature: geojson.Feature<geojson.Geometry, geojson.GeoJsonProperties>,
        ) => {
          console.log("feature", feature);
        },
      };
      const featuresLayerGroup = L.geoJSON(undefined, geoJsonOptions);
      const map = L.map("map", {
        center: [-80, 80],
        zoom: 3,
        crs: L.CRS.Simple,
        doubleClickZoom: false,
        editable: true,
        layers: [editLayerGroup, featuresLayerGroup],
        editOptions: {
          editLayer: editLayerGroup,
          featuresLayer: featuresLayerGroup,
        },
        //maxBounds: [          [90, -185],          [-45, 50],        ],
      });
      map.createPane("editPane");
      map.createPane("featuresPane");

      L.tileLayer("assets/t0/{z}/{x}/{y}.png", {
        maxZoom: 8,
        minZoom: 3,
        noWrap: true,
        bounds: [
          [0, 0],
          [-160, 160],
        ],
        attribution:
          '&copy; 2024-2025 <a title="Use the general channel on this discord to contact me." href="https://discord.gg/sHnyq7vBKY">Blαde</a> for SCUM',
      }).addTo(map);

      L.easyButton({
        position: "topleft",
        leafletClasses: true,
        states: [
          {
            stateName: "center",
            onClick: function (c, map) {
              const rectangle = map.editTools.startRectangle(undefined, {
                color: "red",
                fillColor: "yellow",
                weight: 3,
                noClip: true,
                pane: "featuresPane",
              });

              setFeatureProperty(rectangle, "id", uuid.v4());
              setFeatureProperty(rectangle, "name", "New_Zone");
              setupRectangle(rectangle, featuresLayerGroup);
              setSelectedLayer(rectangle);
              setPanelIsOpen(true);
            },
            title: "Add zone",
            icon: "fa-regular fa-square",
          },
        ],
      }).addTo(map);

      mapButton = L.easyButton({
        position: "topleft",
        leafletClasses: true,
        states: [
          {
            stateName: "teleport",
            onClick: function (c, map) {
              setTeleportButton(true);
              c.state("teleporting");
            },
            title: "Get Teleport Command [T]",
            icon: "fa-solid fa-location-pin",
          },
          {
            stateName: "teleporting",
            onClick: function (c, map) {
              setTeleportButton(false);
              c.state("teleport");
            },
            title: "Click on map to get Teleport Command",
            icon: "fa-solid fa-location-dot color-red",
          },
        ],
      });
      mapButton.addTo(map);
      map.on("contextmenu", () => {
        setSelectedLayer(undefined);
      }); // disable default context menu

      map.on("zoomstart movestart", (e) => {
        hideContextMenu();
      });
      map.on("movestart", (e) => {});
      map.on("zoomstart", (e) => {
        const ctx = document.getElementsByClassName("leaflet-tooltip-pane");
        if (ctx.length > 0) {
          const ctx0 = ctx[0];
          const ts = ctx0.getElementsByClassName("leaflet-tooltip");
          for (const t of ts) {
            t.classList.add("hidden");
          }
        }
      });

      map.on("zoomend moveend", (e) => {
        saveView(map);
      });

      let c = changeCount;
      map.on("zoomend", (e) => {
        const ctx = document.getElementsByClassName("leaflet-tooltip-pane");
        if (ctx.length > 0) {
          const ctx0 = ctx[0];
          const ts = ctx0.getElementsByClassName("leaflet-tooltip");
          for (const t of ts) {
            t.classList.remove("hidden");
          }
        }
      });

      setEditLayerGroup(editLayerGroup);
      setFeaturesLayerGroup(featuresLayerGroup);

      if (map && featuresLayerGroup) {
        loadZones(map, featuresLayerGroup);
        loadView(map);
      }

      window.addEventListener("resize", function (e) {
        setSelectedLayer(undefined);
        hideContextMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          console.log("Escape key pressed");
          map.editTools.stopDrawing();
        }
      });

      createSectorMarkers(map);

      console.log("Map is created");
      m.current = map;
    }
  }, [refMap, m]);

  return (
    <>
      <mapContext.Provider
        value={{
          map: m.current,
          featuresLayerGroup: featuresLayerGroup,
          editLayerGroup: editLayerGroup,
          selectedLayer,
          setSelectedLayer,
          changeCount,
          setChangeCount,
          zoneData,
          setZoneData,
        }}
      >
        <div ref={setRefMap} id="map">
          <MySidePanel
            selectedLayer={selectedLayer}
            featuresLayerGroup={featuresLayerGroup}
            map={m.current}
            id="panel"
            tabsPosition="right"
            isOpen={panelIsOpen}
            setIsOpen={setPanelIsOpen}
            tabName={tabName}
            setTabName={setTabName}
            darkMode={true}
            changeCount={changeCount}
          />
        </div>
        <Menu />

        {alertIsOpen && (
          <div
            style={{ position: "absolute", left: 0, bottom: 0, zIndex: 1000 }}
          >
            <Alert color="dark" rounded={false}>
              <span>{alertContent}</span>
            </Alert>
          </div>
        )}
      </mapContext.Provider>
    </>
  );
};

export { Map };
