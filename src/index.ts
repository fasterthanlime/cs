import * as TWEEN from "@tweenjs/tween.js";
import { Application, Container, interaction } from "pixi.js";
import { autotileRoads } from "./autotile-roads";
import { globals, maxOutput, maxUnits, stepDuration } from "./constants";
import { drawRoads } from "./draw-roads";
import { drawUI } from "./draw-ui";
import { loadAllImgs } from "./imgs";
import { start } from "./start";
import { State } from "./types";
import { eachMapIndex, formatPrice, ijToIndex, xyToIj } from "./utils";
import { Graph } from "./graph";

let state: State;
let mousePos = { x: 0, y: 0 };

function doStep() {
  state.sim.step++;

  // step buildings
  eachMapIndex(ij => {
    let idx = ijToIndex(ij);
    const c = state.map.cells[idx];
    if (!c) {
      return;
    }
    const b = c.building;
    if (!b) {
      return;
    }
    if (!(b.inputs && b.output)) {
      return;
    }

    let outname = b.output.name;
    let maxRounds = 5;
    for (let i = 0; i < maxRounds; i++) {
      for (const input of b.inputs) {
        if (c.bstate.materials[input.name] < input.amount) {
          return;
        }
      }
      let projectedOutput = c.bstate.materials[outname] + b.output.amount;
      if (projectedOutput > maxOutput) {
        return;
      }

      for (const input of b.inputs) {
        c.bstate.materials[input.name] -= input.amount;
      }
      c.bstate.materials[outname] += b.output.amount;
    }
  });

  // step vehicles
}

function updateSim(dt: number) {
  TWEEN.update(dt);
  state.sim.ticks += dt;
  if (state.sim.ticks > stepDuration) {
    state.sim.ticks -= stepDuration;
    doStep();
  }
}

function updateUI() {
  state.ui.lastIJ = state.ui.currIJ;
  state.ui.currIJ = xyToIj(mousePos);
  if (drawRoads(state)) {
    autotileRoads(state);
    state.map.graph = new Graph(state.map.cells);
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
    update(dt / 60.0);

    if (container) {
      app.stage.removeChild(container);
    }
    container = drawUI(state);
    app.stage.addChild(container);
  });
});
