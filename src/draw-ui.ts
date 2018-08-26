import { State } from "./types";
import { Container, Text, Sprite } from "pixi.js";
import { screenH } from "./constants";
import { getImg } from "./imgs";
import { buildUI } from "./build-ui";

export function drawUI(state: State): Container {
  const container = new Container();
  {
    let t = new Text(state.ui.pausedText, { fill: 0xffffff });
    t.position.set(20, screenH - 70);
    container.addChild(t);
  }
  {
    let t = new Text(state.ui.moneyText, { fill: 0x44ff44 });
    t.position.set(300, screenH - 70);
    container.addChild(t);
  }
  {
    let t = new Text(state.ui.unitsText, { fill: 0x4444ff });
    t.position.set(600, screenH - 70);
    container.addChild(t);
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
          }
        });
      }
      container.addChild(sprite);
    }
  }

  return container;
}
