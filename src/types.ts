export interface UIObject {}

export interface ResourceSpec {
  name: string;
  amount: number;
}

export interface BuildingSpec {
  name: string;
  cost: number;
  terrain?: boolean;
  inputs?: ResourceSpec[];
  output?: ResourceSpec;
}

export interface Materials {
  [key: string]: number;
}

export interface BuildingState {
  materials?: Materials;
}

export interface IJ {
  i: number;
  j: number;
}

export interface XY {
  x: number;
  y: number;
}

export interface Cell extends IJ {
  i: number;
  j: number;
  building?: BuildingSpec;
  bstate?: BuildingState;
  dirs?: Dirs;
}

export interface Unit {
  materials: Materials;
  unit: UnitSpec;
}

export interface UnitSpec {
  name: string;
  cost: number;
  capacity: number;
}

export enum Dir {
  l = 1,
  r = 2,
  u = 3,
  d = 4
}

export interface Dirs {
  [key: string]: boolean;
  [Dir.l]?: boolean;
  [Dir.r]?: boolean;
  [Dir.u]?: boolean;
  [Dir.d]?: boolean;
}

/**
 * An angle, in radians
 */
export type Angle = number;

export interface State {
  startedAt: number;
  money: number;
  map: MapState;
  ui: UIState;

  tool: ToolSpec;
  sim: SimState;
}

export interface MapState {
  cells: Cell[];
  units: Unit[];
}

export interface UIState {
  objects: UIObject[];
  cursor: string;
  mainText: string;
  pausedText: string;
  moneyText: string;
  unitsText: string;
  statusText: string;

  buildingTab: string;
  pressed: false;
  hovered: UIObject;
}

export interface SimState {
  paused: boolean;
  ticks: number;
  step: number;
}

export interface ToolSpec {
  name: string;
}

export interface MaterialSpec {
  price: number;
}
