import { Application, Container, interaction } from "pixi.js";
import { globals, maxUnits, numCols, numRows } from "./constants";
import { drawUI } from "./draw-ui";
import { makeState } from "./make-state";
import { State, Cell, IJ } from "./types";
import {
  formatPrice,
  eachMapIndex,
  ijToIndex,
  dirsToRoad,
  xyToIj,
  initBuilding
} from "./utils";
import { buildUI } from "./build-ui";
import { loadAllImgs } from "./imgs";
import { drawRoads } from "./draw-roads";
import { autotileRoads } from "./autotile-roads";
import { findBuilding } from "./buildings";

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

  state = makeState();
  eachMapIndex(ij => {
    let idx = ijToIndex(ij);
    const { i, j } = ij;
    state.map.cells[idx] = { i, j };
  });

  eachMapIndex(ij => {
    const { i, j } = ij;
    if (Math.random() <= 1 / 5) {
      let idx = ijToIndex({ i, j });
      let c: Cell = {
        i,
        j,
        building: findBuilding("mountains"),
        protected: true
      };
      initBuilding(c);
      state.map.cells[idx] = c;
    }
  });

  {
    let cityIJ: IJ = {
      i: Math.round(3 + Math.random() * (numCols - 6)),
      j: Math.round(3 + Math.random() * (numRows - 6))
    };
    for (let id = -2; id <= 2; id++) {
      for (let jd = -2; jd <= 2; jd++) {
        let ij = {
          i: cityIJ.i + id,
          j: cityIJ.j + jd
        };
        let idx = ijToIndex(ij);
        delete state.map.cells[idx].building;
        delete state.map.cells[idx].protected;
      }
    }

    let addBuiltin = (id: number, jd: number, bname: string) => {
      let { i, j } = cityIJ;
      i += id;
      j += jd;
      let c: Cell = {
        i,
        j,
        building: findBuilding(bname),
        protected: true
      };
      initBuilding(c);
      let idx = ijToIndex({ i, j });
      state.map.cells[idx] = c;
    };

    addBuiltin(0, 0, "city");
    addBuiltin(-2, 1, "copper");
    addBuiltin(-1, 2, "copper");
  }

  loadAllImgs();
  buildUI(state);
  let uiContainer: Container;

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

    if (uiContainer) {
      app.stage.removeChild(uiContainer);
    }
    uiContainer = drawUI(state);
    app.stage.addChild(uiContainer);
  });
});
