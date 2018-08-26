import { buildUI } from "./build-ui";
import { eachMapIndex, ijToIndex, dirsToRoad } from "./utils";
import { State } from "./types";

export function autotileRoads(state: State) {
  eachMapIndex(ij => {
    const { i, j } = ij;
    let idx = ijToIndex({ i, j });
    const c = state.map.cells[idx];
    if (c && c.dirs) {
      c.road = dirsToRoad(c.dirs);
    }
  });
  buildUI(state);
}
