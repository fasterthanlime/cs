import { State } from "./types";
import { Container, Text, Sprite, Rectangle, Graphics } from "pixi.js";
import { screenH, map } from "./constants";
import { getImg } from "./imgs";
import { buildUI } from "./build-ui";
import { autotileRoads } from "./autotile-roads";
import { ijToXy, unitOccupancy, cellOccupancy, ijToIndex } from "./utils";

function createInitialDraw(state: State) {
  state.draw = {};
  let container = new Container();
  Object.assign(state.draw, { container });
  {
    state.draw.layers = {};
    let road = new Container();
    container.addChild(road);
    let unit = new Container();
    container.addChild(unit);
    let building = new Container();
    container.addChild(building);
    let ui = new Container();
    container.addChild(ui);
    Object.assign(state.draw.layers, { road, unit, building, ui });
  }

  let pausedText = new Text("", { fill: 0xffffff });
  pausedText.position.set(20, screenH - 70);
  let moneyText = new Text("", { fill: 0x44ff44 });
  moneyText.position.set(300, screenH - 70);
  let unitsText = new Text("", { fill: 0x4444ff });
  unitsText.position.set(600, screenH - 70);
  let statusText = new Text("", { fill: 0xffffff, fontSize: 14 });
  statusText.position.set(20, screenH - 25);

  Object.assign(state.draw, { pausedText, moneyText, unitsText, statusText });
}

export function drawUI(state: State): Container {
  if (!state.draw) {
    createInitialDraw(state);
  }

  let { layers } = state.draw;
  const halfSide = map.slotSide * 0.5;

  layers.road.removeChildren();
  layers.unit.removeChildren();
  layers.building.removeChildren();
  layers.ui.removeChildren();

  // update texts
  state.draw.pausedText.text = state.ui.pausedText;
  layers.ui.addChild(state.draw.pausedText);

  state.draw.moneyText.text = state.ui.moneyText;
  layers.ui.addChild(state.draw.moneyText);

  state.draw.unitsText.text = state.ui.unitsText;
  layers.ui.addChild(state.draw.unitsText);

  state.draw.statusText.text = state.ui.statusText;
  layers.ui.addChild(state.draw.statusText);

  // update toolbar
  {
    let { toolbar } = state.ui;
    if (!toolbar.container || toolbar.dirty) {
      console.log(`Rebuilding toolbar container`);
      toolbar.dirty = false;
      toolbar.container = new Container();
      let x = 10;
      let y = 10;
      for (const obj of toolbar.objects) {
        console.log(`button ${obj.icon}`);
        if (!obj.container) {
          obj.container = new Container();
        }

        obj.container.removeChildren();
        obj.container.addChild(new Sprite(getImg("button-bg")));
        let sprite = new Sprite(getImg(obj.icon));
        sprite.interactive = true;
        sprite.on("click", () => {
          state.events.push(obj.event);
        });
        obj.container.addChild(sprite);
        obj.container.position.set(x, y);
        x += 50;
        toolbar.container.addChild(obj.container);
      }
    }
    layers.ui.addChild(toolbar.container);
  }

  // update rest of UI
  for (const obj of state.ui.objects) {
    const { x, y } = obj;
    const { icon, roadIcon } = obj;
    if (icon) {
      const sprite = new Sprite(getImg(icon));
      sprite.position.set(x, y);
      if (obj.onclick) {
        sprite.interactive = true;
        sprite.buttonMode = true;
        sprite.on("pointerdown", () => {
          const res = obj.onclick(state);
          if (res) {
            if (res.buildUI) {
              buildUI(state);
            }
            if (res.autotileRoads) {
              autotileRoads(state);
            }
            if (res.restart) {
              state.shouldRestart = true;
            }
          }
        });
      }

      if (obj.loc === "map") {
        layers.building.addChild(sprite);
      } else {
        layers.ui.addChild(sprite);
      }

      if (obj.building) {
        const b = obj.building;
        if (b.inputs && b.output) {
          let idx = ijToIndex(obj);
          const c = state.map.cells[idx];
          const occupancy = cellOccupancy(c);
          const gfx = new Graphics();
          gfx.beginFill(0x777777, 1);
          gfx.drawRect(-1, -1, 40, 4);
          gfx.endFill();

          gfx.beginFill(0x333333, 1);
          gfx.drawRect(0, 0, 40, 2);
          gfx.endFill();

          gfx.beginFill(0xff9999, 1);
          gfx.drawRect(0, 0, occupancy * 40, 2);
          gfx.endFill();

          gfx.position.set(x + halfSide - 20, y + halfSide + halfSide * 0.7);
          layers.building.addChild(gfx);
        }
      }
    }
    if (roadIcon) {
      const sprite = new Sprite(getImg(roadIcon));
      sprite.position.set(x, y);
      layers.road.addChild(sprite);
    }
  }

  for (const u of state.map.units) {
    const { i, j, d, angle } = u;
    let { x, y } = ijToXy(u);
    x += halfSide;
    y += halfSide;

    const sprite = new Sprite(getImg(u.unit.name));
    sprite.position.set(x, y);
    sprite.anchor.set(0.5);
    sprite.rotation = angle;
    layers.unit.addChild(sprite);

    const currOccupancy = unitOccupancy(u);
    let occupancy: number;
    if (typeof u.lastOccupancy === "undefined") {
      occupancy = currOccupancy;
    } else {
      let t = 0.1;
      occupancy = (1 - t) * u.lastOccupancy + t * currOccupancy;
    }
    u.lastOccupancy = occupancy;
    console.log(`showing occupancy ${occupancy}`);
    const gfx = new Graphics();

    gfx.beginFill(0xffffff, 0.5);
    gfx.arc(0, 0, 4, 0, 2 * Math.PI);
    gfx.endFill();

    gfx.beginFill(0xffffff, 0.5);
    gfx.arc(0, 0, 7, 0, occupancy * 2 * Math.PI);
    gfx.endFill();

    gfx.position.set(x, y - halfSide * 0.7);
    layers.ui.addChild(gfx);
  }

  return state.draw.container;
}
