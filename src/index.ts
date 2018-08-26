import * as TWEEN from "@tweenjs/tween.js";
import { entries } from "lodash";
import { Application, Container, interaction } from "pixi.js";
import { autotileRoads } from "./autotile-roads";
import {
  globals,
  maxInput,
  maxOutput,
  maxUnits,
  stepDuration,
} from "./constants";
import { drawRoads } from "./draw-roads";
import { drawUI } from "./draw-ui";
import { Graph } from "./graph";
import { loadAllImgs } from "./imgs";
import { materials } from "./materials";
import { start } from "./start";
import { State } from "./types";
import {
  cellOccupancy,
  dirToAngle,
  eachMapIndex,
  formatPrice,
  ijDiff,
  ijToDir,
  ijToIndex,
  unitAvailSpace,
  unitHasInputForCell,
  unitIsFull,
  unitOccupancy,
  xyToIj,
} from "./utils";

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
  for (const u of state.map.units) {
    if (u.path) {
      u.path.index += 1;
      if (u.path.index >= u.path.nodes.length) {
        let lastNode = u.path.nodes[u.path.index - 1];
        const c = state.map.cells[lastNode.id as number];
        const b = c.building;
        if (b) {
          switch (b.name) {
            case "city":
              for (const [k, v] of entries(u.materials)) {
                if (v > 0) {
                  let profit = materials[k].price * v;
                  u.materials[k] = 0;
                  state.money += profit;
                }
              }
              break;
            default:
              if (b.inputs && b.output) {
                let outname = b.output.name;
                for (const input of b.inputs) {
                  let avail = u.materials[input.name] || 0;
                  let alreadyThere = c.bstate.materials[input.name] || 0;
                  let needing = maxInput - alreadyThere;
                  let depositing = Math.min(needing, avail);
                  if (depositing > 0) {
                    c.bstate.materials[input.name] += depositing;
                    u.materials[input.name] -= depositing;
                  }
                }

                if (!u.materials[outname]) {
                  u.materials[outname] = 0;
                }
                let merchAvail = c.bstate.materials[outname];
                let spaceAvail = unitAvailSpace(u);
                let merchTaken = Math.min(spaceAvail, merchAvail);
                if (merchTaken > 0) {
                  u.materials[outname] += merchTaken;
                  c.bstate.materials[outname] -= merchTaken;
                }
              }
          }
        }

        u.path = null;
      }
    }

    if (!u.path) {
      let idx = ijToIndex(u);
      let fromIdx = idx;
      const { graph } = state.map;
      let net = graph.networksByCell[idx];
      if (!net) {
        console.warn(`Unit at ${u.i},${u.j} does not have a network`);
        continue;
      }
      let neighbors: number[] = [];
      for (const bIdx of net.buildings) {
        if (bIdx !== idx) {
          neighbors.push(bIdx);
        }
      }

      if (unitIsFull(u)) {
        // try to eliminate bad neighbors
        let goodNeighbors: number[] = [];
        for (const bIdx of neighbors) {
          let c = state.map.cells[bIdx];
          if (unitHasInputForCell(u, c)) {
            goodNeighbors.push(bIdx);
          }
        }
        neighbors = goodNeighbors;
      }

      if (unitOccupancy(u) < 0.5) {
        neighbors.sort((aIdx, bIdx) => {
          let aC = state.map.cells[aIdx];
          let bC = state.map.cells[bIdx];
          return cellOccupancy(aC) - cellOccupancy(bC);
        });
      }

      if (neighbors.length === 0) {
        continue;
      }

      let toIdx: number = null;
      for (let i = 0; i < neighbors.length; i++) {
        if (Math.random() < 0.8) {
          toIdx = neighbors[i];
        }
      }

      if (toIdx === null) {
        toIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      }

      try {
        // nodes are returned in reverse order for some reason
        let nodes = graph.finder.find(fromIdx, toIdx);
        nodes.length = nodes.length - 1;
        nodes = nodes.reverse();
        u.path = {
          nodes,
          index: 0,
        };
      } catch (e) {
        console.error(`Error in a-star search:`, e.stack);
      }
    }

    if (u.path) {
      let node = u.path.nodes[u.path.index];
      let nodeCell = state.map.cells[node.id as number];
      let diff = ijDiff(nodeCell, u);
      let d = ijToDir(diff);
      u.d = d;
      u.angle = dirToAngle(d);
      let tween = new TWEEN.Tween(u);
      tween
        .to(
          {
            i: nodeCell.i,
            j: nodeCell.j,
          },
          stepDuration,
        )
        .onComplete(() => {
          TWEEN.remove(tween);
        })
        .start(state.sim.ticksSinceStart);
      if (u.tween) {
        TWEEN.remove(u.tween);
        u.tween = null;
      }
      u.tween = tween;
    }
  }
}

function updateSim(dt: number) {
  state.sim.ticksSinceStart += dt;
  TWEEN.update(state.sim.ticksSinceStart);

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
