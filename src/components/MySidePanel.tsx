import { useEffect, useRef, JSX } from "react";
//import { bindAll, UnbindFn } from "./utils/bind-event-listener";
import L from "leaflet";
import { PropertiesForm } from "./subComponents/PropertiesForm.tsx";
import { ZoneBounds } from "./subComponents/ZoneBounds.tsx";
import { ZoneData } from "./subComponents/ZoneData.tsx";
import { TabCommands } from "./subComponents/TabCommands.tsx";
import { TabImport } from "./subComponents/TabImport.tsx";
import { TabZonesContent } from "./subComponents/TabZonesContent.tsx";

export interface MySidePanelOptions extends L.ControlOptions {
  map: L.Map | undefined;
  selectedLayer: L.Layer | undefined;
  featuresLayerGroup: L.GeoJSON | undefined;
  id: string;
  panelPosition?: "left" | "right";
  tabsPosition?: "top" | "left" | "bottom" | "right";
  darkMode?: boolean;
  pushControls?: boolean;
  tabName: string | number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setTabName: (tabName: string) => void;
  changeCount: number;
}

export const MySidePanel = (options: MySidePanelOptions): JSX.Element => {
  const defaultOptions: MySidePanelOptions = {
    map: undefined,
    selectedLayer: undefined,
    featuresLayerGroup: undefined,
    id: "panel",
    panelPosition: "right",
    tabsPosition: "top",
    darkMode: false,
    pushControls: true,

    tabName: "tab-1",
    setTabName: () => {},
    isOpen: false,
    setIsOpen: () => {},
    changeCount: 0,
  };
  options = { ...defaultOptions, ...options };

  const {
    map,
    selectedLayer,
    featuresLayerGroup,
    id,
    panelPosition,
    tabsPosition,
    tabName,
    setTabName,
    isOpen,
    setIsOpen,
    darkMode,
    pushControls,
    changeCount,
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map) return;
    const panel = ref.current;
    if (!panel) return;

    const realPanel = panel.querySelector<HTMLElement>(
      ".sidepanel-inner-wrapper"
    );

    if (realPanel) {
      L.DomEvent.disableScrollPropagation(realPanel);
      L.DomEvent.disableClickPropagation(realPanel);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (pushControls) {
      let controlsContainer = map
        .getContainer()
        .querySelector(".leaflet-control-container") as HTMLElement;

      if (controlsContainer) {
        controlsContainer.classList.add("leaflet-anim-control-container");

        if (isOpen) {
          controlsContainer.classList.remove(panelPosition + "-closed");
          controlsContainer.classList.add(panelPosition + "-opened");
        } else {
          controlsContainer.classList.remove(panelPosition + "-opened");
          controlsContainer.classList.add(panelPosition + "-closed");
        }
      }
    }
  }, [isOpen, map]);

  const getClassNameForTab = (tn: string) => {
    return tn === tabName ? " active" : "";
  };

  return (
    <div
      ref={ref}
      id={id}
      className={
        "sidepanel sidepanel-" +
        panelPosition +
        " " +
        "tabs-" +
        tabsPosition +
        (darkMode ? " sidepanel-dark" : "") +
        " " +
        "tabs-" +
        tabsPosition +
        " " +
        (isOpen ? "opened" : "closed")
      }
      onClick={(e) => {
        e.stopPropagation();
      }}
      aria-label="side panel"
      aria-hidden="false"
    >
      <div className="sidepanel-inner-wrapper">
        <nav
          className="sidepanel-tabs-wrapper"
          aria-label="sidepanel tab navigation"
        >
          <ul className="sidepanel-tabs">
            <li className="sidepanel-tab">
              <a
                href="#"
                className={"sidebar-tab-link" + getClassNameForTab("tab-1")}
                role="tab"
                onClick={() => setTabName("tab-1")}
              >
                <div className="iconplustext">
                  <div>
                    <i className="fa fa-regular fa-pencil"></i>
                  </div>
                  <div>Zone</div>
                </div>
              </a>
            </li>
            <li className="sidepanel-tab">
              <a
                href="#"
                className={"sidebar-tab-link" + getClassNameForTab("tab-2")}
                role="tab"
                onClick={() => setTabName("tab-2")}
              >
                <div className="iconplustext">
                  <div>
                    <i className="fa fa-regular fa-terminal"></i>
                  </div>
                  <div>Commands</div>
                </div>
              </a>
            </li>
            <li className="sidepanel-tab">
              <a
                href="#"
                className={"sidebar-tab-link" + getClassNameForTab("tab-3")}
                role="tab"
                onClick={() => setTabName("tab-3")}
              >
                <div className="iconplustext">
                  <div>
                    <i className="fa-solid fa-vector-square"></i>
                  </div>
                  <div>Zones</div>
                </div>
              </a>
            </li>
            <li className="sidepanel-tab">
              <a
                href="#"
                className={"sidebar-tab-link" + getClassNameForTab("tab-4")}
                role="tab"
                onClick={() => setTabName("tab-4")}
              >
                <div className="iconplustext">
                  <div>
                    <i className="fa fa-regular fa-cog"></i>
                  </div>
                  <div>Import</div>
                </div>
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidepanel-content-wrapper">
          <div className="sidepanel-content">
            <div
              className={"sidepanel-tab-content" + getClassNameForTab("tab-1")}
            >
              <article className="prose dark:prose-invert">
                <PropertiesForm />
                <ZoneBounds
                  selectedLayer={selectedLayer}
                  changeCount={changeCount}
                />
                <ZoneData
                  selectedLayer={selectedLayer}
                  changeCount={changeCount}
                />
              </article>
            </div>
            <div
              className={"sidepanel-tab-content" + getClassNameForTab("tab-2")}
            >
              <article className="prose dark:prose-invert text-large">
                <h3>Export commands for zones</h3>
                <TabCommands
                  featuresLayerGroup={featuresLayerGroup}
                  changeCount={changeCount}
                />
              </article>
            </div>
            <div
              className={"sidepanel-tab-content" + getClassNameForTab("tab-3")}
            >
              <article className="prose dark:prose-invert text-large">
                <h3>Content for Zones.json files</h3>
                <TabZonesContent
                  featuresLayerGroup={featuresLayerGroup}
                  changeCount={changeCount}
                />
              </article>
            </div>
            <div
              className={"sidepanel-tab-content" + getClassNameForTab("tab-4")}
            >
              <article className="prose dark:prose-invert">
                <h3>Import zone data</h3>
                <TabImport
                  featuresLayerGroup={featuresLayerGroup}
                  changeCount={changeCount}
                />
              </article>
            </div>
          </div>
        </div>
      </div>
      <div className="sidepanel-toggle-container">
        <button
          onClick={(e: React.MouseEvent) => {
            setIsOpen(!isOpen);
          }}
          className="sidepanel-toggle-button"
          type="button"
          aria-label="toggle side panel"
        ></button>
      </div>
    </div>
  );
};
