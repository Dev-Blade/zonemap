import * as L from "leaflet";
import { useEffect, useState } from "react";
import { getZoneCommand, getZoneJson } from "../../helpers/ZoneHelpers";

export const ZoneData = ({
  selectedLayer,
  changeCount,
}: {
  selectedLayer: L.Layer | undefined;
  changeCount: number;
}): JSX.Element => {
  const [data, setData] = useState<{ command: string; json: string }>({
    command: "",
    json: "",
  });

  useEffect(() => {
    const r = selectedLayer as L.Rectangle;
    if (!r) return;
    const exportCommand = getZoneCommand(r);
    const exportJson = getZoneJson(r);
    setData({ command: exportCommand, json: exportJson });
  }, [selectedLayer, changeCount]);

  switch (true) {
    case selectedLayer === undefined:
      return <></>;
      break;
    case selectedLayer instanceof L.Rectangle:
      {
        return (
          <>
            <h4>Zone other data:</h4>
            <h5>Loot Export Command</h5>
            <pre className="whitespace-pre-wrap">{data.command}</pre>
            <h5>Content for Zones.json</h5>
            <pre>{data.json}</pre>
          </>
        );
      }
      break;
  }
  return <></>;
};
