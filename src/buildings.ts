import { BuildingSpec } from "./types";
import { entries } from "lodash";

type BuildingCategory = BuildingSpec[];

export const buildings = {
  infra: <BuildingCategory>[
    {
      name: "wires",
      cost: 10000,
      inputs: [{ name: "copper", amount: 1 }],
      output: { name: "wires", amount: 8 },
    },
    {
      name: "plastic",
      cost: 15000,
      inputs: [{ name: "oil", amount: 1 }],
      output: { name: "plastic", amount: 5 },
    },
    {
      name: "jewelry",
      cost: 40000,
      inputs: [{ name: "diamonds", amount: 1 }, { name: "gold", amount: 2 }],
      output: { name: "jewelry", amount: 4 },
    },
    {
      name: "toys",
      cost: 25000,
      inputs: [{ name: "plastic", amount: 2 }],
      output: { name: "toys", amount: 3 },
    },
    {
      name: "microchips",
      cost: 50000,
      inputs: [{ name: "diamonds", amount: 5 }],
      output: { name: "microchips", amount: 1 },
    },
    {
      name: "oil",
      cost: 400000,
      inputs: [],
      output: { name: "oil", amount: 4 },
    },
    {
      name: "copper",
      cost: 100000,
      inputs: [],
      output: { name: "copper", amount: 12 },
    },
    {
      name: "gold",
      cost: 200000,
      inputs: [],
      output: { name: "gold", amount: 8 },
    },
    {
      name: "diamond",
      cost: 600000,
      inputs: [],
      output: { name: "diamonds", amount: 6 },
    },
    {
      name: "city",
      cost: 1000000,
    },
  ],
  misc: <BuildingCategory>[
    {
      name: "cross",
      cost: 0,
    },
    {
      name: "bg",
      cost: 0,
    },
  ],
  terrain: <BuildingCategory>[
    {
      name: "mountains",
      cost: 0,
      terrain: true,
    },
  ],
};

let buildingsByName: {
  [key: string]: BuildingSpec;
} = {};

(function() {
  for (const [cat, items] of entries(buildings)) {
    for (const i of items) {
      buildingsByName[i.name] = i;
    }
  }
})();

export function findBuilding(name: string) {
  const b = buildingsByName[name];
  if (b) {
    return b;
  }
  throw new Error(`building not found: ${name}`);
}
