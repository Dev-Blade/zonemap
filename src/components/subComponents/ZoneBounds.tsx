import * as L from "leaflet";
import { useEffect, useState } from "react";
import { getScumSector, getZoneBounds } from "../../helpers/ZoneHelpers";

export const ZoneBounds = ({
  selectedLayer,
  changeCount,
}: {
  selectedLayer: L.Layer | undefined;
  changeCount: number;
}): JSX.Element => {
  const [bounds, setBounds] = useState({
    N: "",
    W: "",
    S: "",
    E: "",
    sectorNW: "",
    sectorSE: "",
  });
  useEffect(() => {
    const r = selectedLayer as L.Rectangle;
    if (!r) return;

    const { N, W, S, E } = getZoneBounds(r);

    const bounds = r.getBounds();
    const sectorNW = getScumSector(bounds.getNorthWest());
    const sectorSE = getScumSector(bounds.getSouthEast());
    setBounds({ N, W, S, E, sectorNW, sectorSE });
  }, [selectedLayer, changeCount]);

  switch (true) {
    case selectedLayer === undefined:
      return <></>;
      break;
    case selectedLayer instanceof L.Rectangle:
      {
        const sectors =
          bounds.sectorNW === bounds.sectorSE
            ? bounds.sectorNW
            : `${bounds.sectorNW}-${bounds.sectorSE}`;
        return (
          <>
            <h4>Zone geo data:</h4>

            <table>
              <tbody>
                <tr>
                  <td>West/North:</td>
                  <td>
                    X={bounds.W} Y={bounds.N}
                  </td>
                </tr>
                <tr>
                  <td>East/South:</td>
                  <td>
                    X={bounds.E} Y={bounds.S}
                  </td>
                </tr>
                <tr>
                  <td>
                    Sector{bounds.sectorNW === bounds.sectorSE ? "" : "s"}
                  </td>
                  <td>{sectors}</td>
                </tr>
              </tbody>
            </table>
          </>
        );
      }
      break;
  }
  return <></>;
};
