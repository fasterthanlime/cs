import { State } from "./types";
import {
  objIjDiff,
  ijToDir,
  ijToIndex,
  dirOpposite,
  removeDir,
  hasDir,
  spend,
  addDir,
  ijEqual
} from "./utils";
import { roadCost } from "./constants";

export function drawRoads(state: State): true | void {
  if (!state.ui.dragging) {
    return;
  }
  const { lastIJ, currIJ } = state.ui;
  if (!lastIJ || !currIJ) {
    return;
  }

  if (ijEqual(lastIJ, currIJ)) {
    return;
  }

  const diffIJ = objIjDiff(lastIJ, currIJ);
  const d = ijToDir(diffIJ);
  if (!d) {
    return;
  }

  const oldIdx = ijToIndex(lastIJ);
  const newIdx = ijToIndex(currIJ);

  const oldC = state.map.cells[oldIdx];
  const newC = state.map.cells[newIdx];

  if (oldC.building && oldC.building.terrain) {
    return;
  }
  if (newC.building && newC.building.terrain) {
    return;
  }

  let od = dirOpposite(d);

  if (state.ui.shiftDown) {
    // delete roads
    removeDir(oldC, d);
    removeDir(newC, od);
    return true;
  } else {
    if (!(hasDir(oldC, d) && hasDir(newC, od))) {
      if (spend(state, roadCost, "build roads")) {
        addDir(oldC, d);
        addDir(newC, od);
        return true;
      }
    }
  }
}
