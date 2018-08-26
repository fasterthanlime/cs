import { maxOutput, numCols, numRows, map } from "./constants";
import { Cell, Unit, IJ, XY, Dir, Angle, Dirs, State } from "./types";
import { entries } from "lodash";

const { PI } = Math;
export const epsilon = 0.1;

export function feq(a: number, b: number): boolean {
  return Math.abs(a - b) < epsilon;
}

export function cellOccupancy(c: Cell): number {
  const { building } = c;
  if (building) {
    if (building.name === "city") {
      return 0;
    }
    if (building.inputs && building.output) {
      return c.bstate.materials[building.output.name] / maxOutput;
    }
  }

  return 0;
}

export function unitTakenSpace(u: Unit): number {
  let takenSpace = 0;
  for (const [k, v] of entries(u.materials)) {
    takenSpace += v;
  }
  return takenSpace;
}

export function unitAvailSpace(u: Unit): number {
  return u.unit.capacity - unitTakenSpace(u);
}

export function unitIsFull(u: Unit): boolean {
  return unitAvailSpace(u) < epsilon;
}

export function unitOccupancy(u: Unit): number {
  return unitTakenSpace(u) / u.unit.capacity;
}

export function unitHasInputForCell(u: Unit, c: Cell): boolean {
  const b = c.building;
  if (b.name === "city") {
    return true;
  }

  if (b.inputs && b.output) {
    for (const input of b.inputs) {
      const materialAvail = u.materials[input.name] || 0;
      if (materialAvail > 0) {
        return true;
      }
    }
  }
  return false;
}

export function initBuilding(c: Cell) {
  c.bstate = {};
  if (c.building && c.building.inputs && c.building.output) {
    const { inputs, output } = c.building;
    c.bstate.materials = {};
    for (const input of inputs) {
      c.bstate.materials[input.name] = 0;
    }
    c.bstate.materials[output.name] = 0;
  }
}

export function ijToIndex(ij: IJ): number {
  const { i, j } = ij;
  return i + j * numCols;
}

export function objIjDiff(a: IJ, b: IJ): IJ {
  return {
    i: b.i - a.i,
    j: b.j - a.j
  };
}

export function hasDirs(c: Cell): boolean {
  if (!c.dirs) {
    return false;
  }

  for (const k of Object.keys(c.dirs)) {
    if (c.dirs[k]) {
      return true;
    }
  }
  return false;
}

export function eachMapIndex(f: (ij: IJ) => any) {
  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      if (f({ i, j }) === false) {
        return;
      }
    }
  }
}

export function ijToXy(ij: IJ): XY {
  const { i, j } = ij;
  const x = map.initialX + i * map.slotSide;
  const y = map.initialY + j * map.slotSide;
  return { x, y };
}

export function xyToIj(xy: XY): IJ | null {
  const { x, y } = xy;
  let i = Math.floor((x - map.initialX) / map.slotSide);
  let j = Math.floor((y - map.initialY) / map.slotSide);
  const ij = { i, j };
  if (isValidIJ(ij)) {
    return ij;
  }
  return null;
}

export function isValidIJ(ij: IJ): boolean {
  const { i, j } = ij;
  return i >= 0 && i < numCols && j >= 0 && j < numRows;
}

////////////////////////////////////////
// Dir stuff
////////////////////////////////////////

export function dirToVec(d: Dir): IJ {
  switch (d) {
    case Dir.l:
      return { i: -1, j: 0 };
    case Dir.r:
      return { i: 1, j: 0 };
    case Dir.u:
      return { i: 0, j: -1 };
    case Dir.d:
      return { i: 0, j: 1 };
  }
}

export function dirToAngle(d: Dir): Angle {
  switch (d) {
    case Dir.l:
      return (-PI / 2) as Angle;
    case Dir.r:
      return (PI / 2) as Angle;
    case Dir.u:
      return PI as Angle;
    case Dir.d:
      return 0 as Angle;
  }
}

export function ijToDir(ij: IJ): Dir {
  const { i, j } = ij;
  switch (true) {
    case feq(i, -1) && feq(j, 0):
      return Dir.l;
    case feq(i, 1) && feq(j, 0):
      return Dir.r;
    case feq(i, 0) && feq(j, -1):
      return Dir.u;
    case feq(i, 0) && feq(j, 1):
      return Dir.d;
  }
  return undefined;
}

export function ijEqual(a: IJ, b: IJ): boolean {
  return feq(a.i, b.i) && feq(a.j, b.j);
}

export function dirOpposite(d: Dir) {
  switch (d) {
    case Dir.l:
      return Dir.r;
    case Dir.r:
      return Dir.l;
    case Dir.u:
      return Dir.d;
    case Dir.d:
      return Dir.u;
  }
}

////////////////////////////////////////
// Road stuff
////////////////////////////////////////

export function dirsToRoad(dirs: Dirs): string {
  let name = `road`;
  if (dirs[Dir.l]) {
    name = `${name}-left`;
  }
  if (dirs[Dir.r]) {
    name = `${name}-right`;
  }
  if (dirs[Dir.u]) {
    name = `${name}-up`;
  }
  if (dirs[Dir.d]) {
    name = `${name}-down`;
  }
  return name;
}

export function hasDir(c: Cell, d: Dir): boolean {
  return c.dirs && c.dirs[d] === true;
}

export function addDir(c: Cell, d: Dir) {
  if (!c.dirs) {
    c.dirs = {};
  }
  c.dirs[d] = true;
}

export function removeDir(c: Cell, d: Dir) {
  if (c.dirs) {
    delete c.dirs[d];
  }
}

////////////////////////////////////////
// Road stuff
////////////////////////////////////////

export function spend(state: State, amount: number, action: string): boolean {
  if (state.money >= amount) {
    state.money -= amount;
    state.ui.statusText = `just spent ${formatPrice(amount)} to ${action}`;
    return true;
  }

  state.ui.statusText = `can't afford to spend ${formatPrice(
    amount
  )} to ${action}`;
  return false;
}

export function formatPrice(p: number): string {
  if (p > 1000) {
    let thousands = p / 1000;
    return `$${thousands.toFixed(2)}K`;
  }
  return `$${p}`;
}
