import { State, ToolbarObject } from "./types";

const standardButtons = <{ [key: string]: ToolbarObject }>{
  pause: {
    icon: "pause",
    event: "pause",
  },
  play: {
    icon: "play",
    event: "resume",
  },
  restart: {
    icon: "restart",
    event: "restart",
  },
  clearUnits: {
    icon: "clear-units",
    event: "clear-units",
  },
};

export function buildToolbar(state: State) {
  let objects: ToolbarObject[] = [];

  if (state.sim.paused) {
    objects.push(standardButtons.play);
  } else {
    objects.push(standardButtons.pause);
  }
  objects.push(standardButtons.clearUnits);
  objects.push(standardButtons.restart);

  state.ui.toolbar.objects = objects;
  state.ui.toolbar.dirty = true;
}
