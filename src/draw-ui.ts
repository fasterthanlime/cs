import { State } from "./types";
import { Container, Text, Sprite, Rectangle, Graphics } from "pixi.js";
import { screenH, map } from "./constants";
import { getImg } from "./imgs";
import { buildUI } from "./build-ui";
import { autotileRoads } from "./autotile-roads";
import { ijToXy, unitOccupancy } from "./utils";

export function drawUI(state: State): Container {
  const container = new Container();

  const roadLayer = new Container();
  const unitLayer = new Container();
  const buildingLayer = new Container();
  const uiLayer = new Container();
  container.addChild(roadLayer);
  container.addChild(unitLayer);
  container.addChild(buildingLayer);
  container.addChild(uiLayer);

  {
    let t = new Text(state.ui.pausedText, { fill: 0xffffff });
    t.position.set(20, screenH - 70);
    uiLayer.addChild(t);
  }
  {
    let t = new Text(state.ui.moneyText, { fill: 0x44ff44 });
    t.position.set(300, screenH - 70);
    uiLayer.addChild(t);
  }
  {
    let t = new Text(state.ui.unitsText, { fill: 0x4444ff });
    t.position.set(600, screenH - 70);
    uiLayer.addChild(t);
  }
  {
    let t = new Text(state.ui.statusText, { fill: 0xffffff, fontSize: 14 });
    t.position.set(20, screenH - 25);
    uiLayer.addChild(t);
  }

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
        buildingLayer.addChild(sprite);
      } else {
        if (obj.loc === "toolbar") {
          let bgSprite = new Sprite(getImg("button-bg"));
          bgSprite.position.set(x, y);
          uiLayer.addChild(bgSprite);
        }
        uiLayer.addChild(sprite);
      }
    }
    if (roadIcon) {
      const sprite = new Sprite(getImg(roadIcon));
      sprite.position.set(x, y);
      roadLayer.addChild(sprite);
    }
  }

  for (const u of state.map.units) {
    const { i, j, d, angle } = u;
    const { x, y } = ijToXy(u);

    const sprite = new Sprite(getImg(u.unit.name));
    sprite.position.set(x, y);
    sprite.rotation = angle;
    unitLayer.addChild(sprite);

    const occupancy = unitOccupancy(u);
    const gfx = new Graphics();
    gfx.beginFill(0xffffff, 1);
    gfx.drawRect(0, 0, occupancy / 40, 2);
    gfx.endFill();
    gfx.position.set(x, y);
    unitLayer.addChild(gfx);
  }

  return container;
}
