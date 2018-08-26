export interface UIObject {}

export interface ResourceSpec {
  name: string;
}

export interface BuildingSpec {
  name: string;
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
  money: number;
  ui: UIState;
}

export interface UIState {
  statusText: string;
}
