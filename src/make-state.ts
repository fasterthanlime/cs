import { startMoney } from "./constants";
import { State } from "./types";

export function makeState(): State {
  const state: State = {
    startedAt: Date.now(),
    shouldRestart: false,
    money: startMoney,
    map: {
      cells: [],
      units: [],
    },
    ui: {
      objects: [],

      cursor: "pointer",
      mainText: "",
      pausedText: "",
      moneyText: "",
      unitsText: "",
      statusText: "",

      buildingTab: "infra",
      dragging: false,
      hovered: null,
      shiftDown: false,
      lastIJ: { i: 0, j: 0 },
      currIJ: { i: 0, j: 0 },
    },
    tool: {
      name: "road",
    },
    sim: {
      paused: false,
      ticks: 0,
      ticksSinceStart: 0,
      step: 0,
    },
  };
  return state;
}
