import { Application, Container, interaction } from "pixi.js";
import { autotileRoads } from "./autotile-roads";
import { buildUI } from "./build-ui";
import { findBuilding } from "./buildings";
import { globals, maxUnits, numCols, numRows, startMoney } from "./constants";
import { drawRoads } from "./draw-roads";
import { drawUI } from "./draw-ui";
import { loadAllImgs } from "./imgs";
import { makeState } from "./make-state";
import { Cell, IJ, State } from "./types";
import {
  eachMapIndex,
  formatPrice,
  ijToIndex,
  initBuilding,
  xyToIj
} from "./utils";
import { start } from "./start";

let state: State;
let mousePos = { x: 0, y: 0 };

function updateSim(dt: number) {
  // TODO: port
}

function updateUI() {
  state.ui.lastIJ = state.ui.currIJ;
  state.ui.currIJ = xyToIj(mousePos);
  if (drawRoads(state)) {
    autotileRoads(state);
  }

  state.ui.pausedText = "running";
  if (state.sim.paused) {
    state.ui.pausedText = "paused";
  }
  state.ui.moneyText = formatPrice(state.money);
  let currentUnits = state.map.units.length;
  state.ui.unitsText = `${currentUnits} / ${maxUnits} units`;
}

function update(dt: number) {
  if (state.shouldRestart) {
    state = start();
  }

  if (!state.sim.paused) {
    updateSim(dt);
  }
  updateUI();
}

function cancelDrag() {
  if (state.ui.dragging) {
    console.log(`Cancelling dragging!`);
    state.ui.dragging = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  var app = new Application(1280, 720);
  globals.app = app;
  document.body.appendChild(app.view);

  loadAllImgs();
  state = start();

  let container: Container;
  app.stage.interactive = true;
  app.stage.on("pointermove", (ev: interaction.InteractionEvent) => {
    const { x, y } = ev.data.global;
    mousePos.x = x;
    mousePos.y = y;
  });
  app.stage.on("pointerupoutside", () => {
    cancelDrag();
  });
  app.stage.on("pointerup", () => {
    cancelDrag();
  });

  app.ticker.add(dt => {
    update(dt);

    if (container) {
      app.stage.removeChild(container);
    }
    container = drawUI(state);
    app.stage.addChild(container);
  });
});
