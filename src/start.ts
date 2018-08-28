import { buildUI } from "./build-ui";
import { findBuilding } from "./buildings";
import { numCols, numRows } from "./constants";
import { makeState } from "./make-state";
import { Cell, IJ, State } from "./types";
import { eachMapIndex, ijToIndex, initBuilding } from "./utils";
import { autotileRoads } from "./autotile-roads";
import { Graph } from "./graph";
import { buildToolbar } from "./build-toolbar";

export function start(): State {
  let state = makeState();
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
        protected: true,
      };
      initBuilding(c);
      state.map.cells[idx] = c;
    }
  });

  {
    let cityIJ: IJ = {
      i: Math.round(3 + Math.random() * (numCols - 6)),
      j: Math.round(3 + Math.random() * (numRows - 6)),
    };
    for (let id = -2; id <= 2; id++) {
      for (let jd = -2; jd <= 2; jd++) {
        let ij = {
          i: cityIJ.i + id,
          j: cityIJ.j + jd,
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
        protected: true,
      };
      initBuilding(c);
      let idx = ijToIndex({ i, j });
      state.map.cells[idx] = c;
    };

    addBuiltin(0, 0, "city");
    addBuiltin(-2, 1, "copper");
    addBuiltin(-1, 2, "copper");
  }
  buildToolbar(state);
  buildUI(state);
  autotileRoads(state);
  state.map.graph = new Graph(state.map.cells);
  (window as any).GameState = state;
  return state;
}
