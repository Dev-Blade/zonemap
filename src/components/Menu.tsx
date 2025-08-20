import { Rectangle } from "leaflet";
import { saveZones } from "../helpers/Storage";
import { mapContext } from "./Map";
import { useContext } from "react";

export const getContextMenu = () => {
  return document.getElementById("dropdown");
};

export const hideContextMenu = () => {
  const menu = getContextMenu();
  if (menu) menu.classList.add("hidden");
};
export const showContextMenu = () => {
  const menu = getContextMenu();
  if (menu) menu.classList.remove("hidden");
};

export const Menu = (): JSX.Element => {
  const { featuresLayerGroup, selectedLayer, setSelectedLayer } =
    useContext(mapContext);

  const isPathLayer = selectedLayer instanceof Rectangle;
  let typeName = isPathLayer ? "zone" : "marker";

  return (
    <div
      id="dropdown"
      style={{ position: "absolute", top: "1em", left: "1em", zIndex: 1000 }}
      className="hidden z-10 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700"
    >
      <ul
        className="py-2 text-sm text-gray-700 dark:text-gray-200"
        aria-labelledby="dropdownDefaultButton"
      >
        <li>
          <a
            onClick={(e) => {
              console.log("clicked", selectedLayer);
              featuresLayerGroup?.removeLayer(selectedLayer!);
              setSelectedLayer && setSelectedLayer(undefined);
              saveZones(featuresLayerGroup);
            }}
            href="#"
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            remove this {typeName}
          </a>
        </li>
        {isPathLayer && (
          <>
            <li>
              <a
                onClick={(e) => {
                  (selectedLayer as L.Path)?.bringToFront();
                  setSelectedLayer && setSelectedLayer(undefined);
                  saveZones(featuresLayerGroup);
                }}
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {typeName} to front
              </a>
            </li>
            <li>
              <a
                onClick={(e) => {
                  (selectedLayer as L.Path)?.bringToBack();
                  setSelectedLayer && setSelectedLayer(undefined);
                  saveZones(featuresLayerGroup);
                }}
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {typeName} to back
              </a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
