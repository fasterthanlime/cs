import { Application } from "pixi.js";

////////////////////////////////////////
// Dimensions
////////////////////////////////////////

export const globals: {
  app: Application;
} = {
  app: null,
};

export const screenW = 1280;
export const screenH = 720;
export const numCols = 15;
export const numRows = 9;

export const palette = (() => {
  const p = {
    initialX: 10,
    itemsPerRow: 3,
    itemSide: 40,
    itemSpacing: 25,
    itemSpacingY: 60,
    totalWidth: 0,
  };
  p.totalWidth = p.initialX + (p.itemSide + p.itemSpacing) * p.itemsPerRow + 30;
  return p;
})();

export const map = {
  initialX: 30,
  initialY: 60,
  slotSide: 60,
  unitSide: 30,
};

////////////////////////////////////////
// Time variables
////////////////////////////////////////

export const stepDuration = 0.33333;
export const maxUnits = 100;

////////////////////////////////////////
// Costs
////////////////////////////////////////

// export const startMoney = 30000;
export const startMoney = 30000 * 100;
export const roadCost = 5000;
export const maxOutput = 10000;
export const maxInput = 10000;
