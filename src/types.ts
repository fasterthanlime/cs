import { Graph } from "./graph";
import { Node } from "ngraph.graph";
import { Tween } from "@tweenjs/tween.js";
import { Container, Text } from "pixi.js";

export interface OnClickResult {
  buildUI?: boolean;
  restart?: boolean;
  autotileRoads?: boolean;
}
export type OnClick = (state: State) => OnClickResult | void;

export interface UIObject extends IJ, XY {
  loc: "toolbar" | "palette" | "map";
  icon?: string;
  roadIcon?: string;
  building?: BuildingSpec;
  protected?: boolean;
  x?: number;
  y?: number;
  i?: number;
  j?: number;
  w?: number;
  h?: number;
  cost?: number;
  meta?: boolean;
  onclick?: OnClick;
  hover?: boolean;
}

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
  i?: number;
  j?: number;
}

export interface XY {
  x?: number;
  y?: number;
}

export interface Cell extends IJ {
  i: number;
  j: number;
  building?: BuildingSpec;
  bstate?: BuildingState;
  dirs?: Dirs;
  road?: string;
  protected?: boolean;
}

export interface Unit {
  i: number;
  j: number;
  x?: number;
  y?: number;
  d: Dir;
  angle: number;
  materials: Materials;
  unit: UnitSpec;
  path?: UnitPath;
  tween?: Tween;
  lastOccupancy?: number;
}

export interface UnitPath {
  index: number;
  nodes: Node<any>[];
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
  d = 4,
}

export const allDirs = [Dir.l, Dir.r, Dir.u, Dir.d];

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
  shouldRestart: boolean;
  money: number;
  map: MapState;
  ui: UIState;

  tool: ToolSpec;
  sim: SimState;
  draw?: DrawState;
  events?: EventKind[];
}

export interface MapState {
  cells: Cell[];
  units: Unit[];
  graph?: Graph;
}

export interface UIState {
  toolbar: ToolbarState;

  objects: UIObject[];
  cursor: string;
  mainText: string;
  pausedText: string;
  moneyText: string;
  unitsText: string;
  statusText: string;

  buildingTab: string;
  dragging: boolean;
  hovered: UIObject;
  shiftDown: boolean;

  lastIJ?: IJ;
  currIJ?: IJ;
}

export interface SimState {
  paused: boolean;
  ticksSinceStart: number;
  ticks: number;
  step: number;
}

export interface ToolSpec {
  name: string;
  unit?: UnitSpec;
  building?: BuildingSpec;
}

export interface MaterialSpec {
  price: number;
}

enum EventKind {
  pause = "pause",
  resume = "resume",
  restart = "restart",
  clearUnits = "clear-units",
}

export interface ToolbarObject {
  container?: Container;
  event: EventKind;
  icon: string;
}

export interface ToolbarState {
  container?: Container;
  objects: ToolbarObject[];
  dirty: boolean;
}

export interface DrawState {
  container?: Container;
  layers?: {
    road?: Container;
    unit?: Container;
    building?: Container;
    ui?: Container;
  };
  pausedText?: Text;
  moneyText?: Text;
  unitsText?: Text;
  statusText?: Text;
}
