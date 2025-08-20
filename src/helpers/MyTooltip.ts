import * as L from "leaflet";

export interface MyTooltipOptions extends L.TooltipOptions {
  rectangle: L.Rectangle;
}

export class MyTooltip extends L.Tooltip {
  declare options: MyTooltipOptions;
  declare _container: HTMLElement;
  declare _source: L.FeatureGroup;

  constructor(options: MyTooltipOptions, source?: L.Layer) {
    super(options, source);
    this.options.rectangle = options.rectangle;
  }

  toPoint(
    x: number | L.Point | L.PointExpression | undefined,
    y?: number,
    round?: boolean
  ): L.Point | undefined | null {
    if (x instanceof L.Point) {
      return x;
    }
    if (Array.isArray(x)) {
      return new L.Point(x[0], x[1]);
    }
    return new L.Point(x as number, y!, round);
  }

  _setPosition(pos: L.Point) {
    let subX = 0,
      subY = 0;
    const container = this._container,
      offset = this.toPoint(this.options.offset);

    const r = this.options.rectangle;
    const nw = r.getBounds().getNorthWest();
    const se = r.getBounds().getSouthEast();

    pos = this._map.latLngToContainerPoint(nw);
    pos = this._map.containerPointToLayerPoint(pos);

    let pos2 = this._map.latLngToContainerPoint(se);
    pos2 = this._map.containerPointToLayerPoint(pos2);

    const w = pos2.x - pos.x;
    const h = pos2.y - pos.y;

    pos = pos.subtract(this.toPoint(subX, subY, true)!).add(offset!);

    container.classList.remove(
      "leaflet-tooltip-right",
      "leaflet-tooltip-left",
      "leaflet-tooltip-top",
      "leaflet-tooltip-bottom"
    );

    L.DomUtil.setPosition(container, pos);

    container.style.width = w + "px";
    container.style.height = h + "px";
    container.style.minWidth = w + "px";
    container.style.maxHeight = h + "px";

    const content = this.getContent();
    const s = content ? content?.toString() : "";
    const l = s.length * 2;

    let fs = w / 3 - l;

    if (fs > 20) fs = 20;
    if (fs < 10) fs = 10;

    container.style.fontSize = fs + "px";
  }
}
