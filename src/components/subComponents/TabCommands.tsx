import * as L from "leaflet";
import { getSortedZones, getZoneCommand } from "../../helpers/ZoneHelpers";

export const TabCommands = ({
  featuresLayerGroup,
}: {
  featuresLayerGroup: L.GeoJSON | undefined;
  changeCount: number;
}): JSX.Element => {
  if (featuresLayerGroup === undefined) return <></>;

  const exportCommands: string[] = [];
  const f = getSortedZones(featuresLayerGroup);
  for (const r of f) {
    exportCommands.push(getZoneCommand(r));
  }

  return (
    <>
      <div className="text-base p-2 bg-trans">
        {exportCommands.map((command, i) => (
          <div key={"z" + i} className="pb-4">
            <div>{command}</div>
          </div>
        ))}
      </div>
    </>
  );
};
