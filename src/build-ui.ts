import { UIObject, State, Dir } from "./types";
import { units } from "./units";
import {
  roadCost,
  numCols,
  numRows,
  maxUnits,
  screenW,
  palette,
  map,
} from "./constants";
import { spend, ijToIndex, initBuilding, ijToXy } from "./utils";
import { buildings } from "./buildings";

export function buildUI(state: State) {
  let objects: UIObject[] = [];

  ////////////////////////////////////////
  // palette
  ////////////////////////////////////////

  for (const u of units) {
    const obj: UIObject = {
      loc: "palette",
      icon: u.name,
      cost: u.cost,
      onclick: state => {
        state.tool = { name: "unit", unit: u };
        return { buildUI: true };
      },
    };
    objects.push(obj);
  }

  {
    const obj: UIObject = {
      loc: "palette",
      icon: "road-left-right",
      cost: roadCost,
      onclick: state => {
        state.tool = { name: "road" };
        return { buildUI: true };
      },
    };
    objects.push(obj);
  }

  for (const b of buildings.infra) {
    const obj: UIObject = {
      loc: "palette",
      icon: b.name,
      cost: b.cost,
      onclick: state => {
        state.tool = { name: "building", building: b };
        return { buildUI: true };
      },
    };
    objects.push(obj);
  }

  ////////////////////////////////////////
  // map
  ////////////////////////////////////////
  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      objects.push({
        i,
        j,
        loc: "map",
        meta: true,
        icon: "slot",
        onclick: state => {
          switch (state.tool.name) {
            case "road":
              state.ui.dragging = true;
              break;
            case "unit":
              if (state.map.units.length >= maxUnits) {
                state.ui.statusText = `too many units! hit the 'clear units' button`;
                return;
              }
              if (state.tool.unit) {
                const { unit } = state.tool;
                if (spend(state, unit.cost, `purchase ${unit.name}`)) {
                  state.map.units.push({
                    i,
                    j,
                    d: Dir.u,
                    angle: 0,
                    unit,
                    materials: {},
                  });
                }
              }
              break;
            case "building":
              const idx = ijToIndex({ i, j });
              const c = state.map.cells[idx];
              if (c.protected) {
                return;
              }
              if (state.ui.shiftDown && c.building) {
                c.building = null;
                return { buildUI: true };
              } else {
                const { building } = state.tool;
                if (spend(state, building.cost, `build ${building.name}`)) {
                  c.building = building;
                  initBuilding(c);
                  return { buildUI: true };
                }
              }
              break;
          }
        },
      });
    }
  }

  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      let idx = ijToIndex({ i, j });
      const c = state.map.cells[idx];
      if (c) {
        const obj: UIObject = {
          i,
          j,
          loc: "map",
          building: c.building,
          protected: c.protected,
        };
        if (c.road) {
          obj.roadIcon = c.road;
        }
        if (c.building) {
          obj.icon = c.building.name;
        }
        objects.push(obj);
      }
    }
  }

  // now do layout
  {
    let toolbarX = 10;
    let toolbarY = 10;

    let paletteBaseX = screenW - palette.totalWidth;
    let paletteX = palette.initialX;
    let paletteY = 100;
    let paletteN = 0;

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (!obj) {
        throw new Error(`UIObject ${i} is nil`);
      }
      obj.hover = false;

      switch (obj.loc) {
        case "toolbar":
          obj.x = toolbarX;
          obj.y = toolbarY;
          obj.w = 40;
          obj.h = 40;
          toolbarX += 50;
          break;
        case "palette":
          obj.x = paletteX + paletteBaseX;
          obj.y = paletteY;
          obj.w = palette.itemSide;
          obj.h = palette.itemSide;

          paletteN++;
          paletteX += palette.itemSide + palette.itemSpacing;
          if (paletteN >= palette.itemsPerRow) {
            paletteN = 0;
            paletteX = palette.initialX;
            paletteY += palette.itemSide + palette.itemSpacingY;
          }
          break;
        case "map":
          const { x, y } = ijToXy(obj);
          obj.x = x;
          obj.y = y;
          obj.w = map.slotSide;
          obj.h = map.slotSide;
          break;
        default:
          throw new Error(`Unknown location ${obj.loc}`);
      }
    }
  }
  state.ui.objects = objects;
}
