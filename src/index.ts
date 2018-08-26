import { Application, Container } from "pixi.js";
import { globals, maxUnits } from "./constants";
import { drawUI } from "./draw-ui";
import { makeState } from "./make-state";
import { State } from "./types";
import { formatPrice } from "./utils";
import { buildUI } from "./build-ui";
import { loadAllImgs } from "./imgs";

let state: State;

function updateSim(dt: number) {
  // TODO: port
}

function updateUI() {
  state.ui.pausedText = "running";
  if (state.sim.paused) {
    state.ui.pausedText = "paused";
  }
  state.ui.moneyText = formatPrice(state.money);
  let currentUnits = state.map.units.length;
  state.ui.unitsText = `${currentUnits} / ${maxUnits} units`;
}

function update(dt: number) {
  if (!state.sim.paused) {
    updateSim(dt);
  }
  updateUI();
}

document.addEventListener("DOMContentLoaded", () => {
  var app = new Application(1280, 720);
  globals.app = app;
  document.body.appendChild(app.view);

  state = makeState();
  loadAllImgs();
  buildUI(state);
  let uiContainer: Container;

  app.ticker.add(dt => {
    update(dt);

    if (uiContainer) {
      app.stage.removeChild(uiContainer);
    }
    uiContainer = drawUI(state);
    app.stage.addChild(uiContainer);
  });
});
