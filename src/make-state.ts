import { startMoney } from "./constants";
import { State } from "./types";

export function makeState(): State {
  const state: State = {
    startedAt: Date.now(),
    money: startMoney,
    map: {
      cells: [],
      units: []
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
      pressed: false,
      hovered: null,
      shiftDown: false
    },
    tool: {
      name: "road"
    },
    sim: {
      paused: false,
      ticks: 0,
      step: 0
    }
  };
  return state;
}
