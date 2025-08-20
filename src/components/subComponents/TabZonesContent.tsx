import * as L from "leaflet";
import { getFeatureProperty } from "../../helpers/Features";
import Tooltip from "../utilityComponents/Tooltip";
import { useState } from "react";
import {
  getAllZonesJson,
  getSortedZones,
  getZoneJson,
} from "../../helpers/ZoneHelpers";

export const TabZonesContent = ({
  featuresLayerGroup,
}: {
  featuresLayerGroup: L.GeoJSON | undefined;
  changeCount: number;
}): JSX.Element => {
  const [allInOne, setAllInOne] = useState<boolean>(false);

  if (featuresLayerGroup === undefined) return <></>;

  let content: JSX.Element | JSX.Element[] = <></>;

  if (allInOne) {
    const allZonesJson = getAllZonesJson(featuresLayerGroup);

    content = (
      <div className="pb-4">
        <h4 className="mb-0">
          <div className="flex max-w-md flex-row gap-1">
            <div>
              <Tooltip message="✨copy to clipboard">
                <button
                  className="clp"
                  onClick={() => {
                    navigator.clipboard.writeText(allZonesJson);
                  }}
                >
                  <div className="animate-[wiggle_1s_ease-in-out_infinite]">
                    <svg
                      className="shrink-0 h-5 w-5 transition text-gray-500 group-hover:text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-3 -3 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path>
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"></path>
                    </svg>
                  </div>
                </button>
              </Tooltip>
            </div>
            <div>All Zones</div>
          </div>
        </h4>
        <pre>{allZonesJson}</pre>
      </div>
    );
  } else {
    const zoneJsons: { name: string; json: string }[] = [];

    const f = getSortedZones(featuresLayerGroup);

    for (const r of f) {
      zoneJsons.push({
        name: getFeatureProperty(r, "name"),
        json: getZoneJson(r),
      });
    }

    content = zoneJsons.map((zone, i) => {
      return (
        <div key={"z" + i} className="pb-4">
          <h4 className="mb-0">
            <div className="flex max-w-md flex-row gap-1">
              <div>
                <Tooltip message="✨copy to clipboard">
                  <button
                    className="clp"
                    onClick={() => {
                      navigator.clipboard.writeText(zone.json);
                    }}
                  >
                    <div className="animate-[wiggle_1s_ease-in-out_infinite]">
                      <svg
                        className="shrink-0 h-5 w-5 transition text-gray-500 group-hover:text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="-3 -3 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path>
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"></path>
                      </svg>
                    </div>
                  </button>
                </Tooltip>
              </div>
              <div>{zone.name}</div>
            </div>
          </h4>
          <pre id={"clip" + i}>{zone.json}</pre>
        </div>
      );
    });
  }

  return (
    <>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          onClick={() => setAllInOne(!allInOne)}
          value={allInOne ? 1 : 0}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          all-in-one
        </span>
      </label>

      <div className="text-base">{content}</div>
    </>
  );
};
