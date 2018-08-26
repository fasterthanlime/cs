import { Texture } from "pixi.js";

type ImageSpec = string[][];

let images: {
  [key: string]: Texture;
} = {};

let toLoad = <ImageSpec>[
  ["cursors", "pointer"],
  ["cursors", "hand"],

  ["buildings", "building-bg"],
  ["buildings", "cinema"],
  ["buildings", "city"],
  ["buildings", "copper"],
  ["buildings", "cross"],
  ["buildings", "depot"],
  ["buildings", "diamond"],
  ["buildings", "gold"],
  ["buildings", "jewelry"],
  ["buildings", "library"],
  ["buildings", "microchips"],
  ["buildings", "mountains"],
  ["buildings", "oil"],
  ["buildings", "plastic"],
  ["buildings", "power-plant"],
  ["buildings", "toys"],
  ["buildings", "tree"],
  ["buildings", "wires"],

  ["buttons", "restart"],
  ["buttons", "button-bg"],
  ["buttons", "pause"],
  ["buttons", "play"],
  ["buttons", "slot"],
  ["buttons", "toolbar"],
  ["buttons", "clear-units"],

  ["misc", "arrow"],

  ["roads", "road"],
  ["roads", "road-down"],
  ["roads", "road-left"],
  ["roads", "road-left-down"],
  ["roads", "road-left-right"],
  ["roads", "road-left-right-down"],
  ["roads", "road-left-right-up"],
  ["roads", "road-left-right-up-down"],
  ["roads", "road-left-up"],
  ["roads", "road-left-up-down"],
  ["roads", "road-right"],
  ["roads", "road-right-down"],
  ["roads", "road-right-up"],
  ["roads", "road-right-up-down"],
  ["roads", "road-up"],
  ["roads", "road-up-down"],

  ["units", "jeep"],
  ["units", "van"],
  ["units", "truck"],
];

export function getImg(name: string): Texture {
  const img = images[name];
  if (!img) {
    throw new Error(`image not found: ${name}`);
  }
  return img;
}

export function loadAllImgs() {
  for (const t of toLoad) {
    const [dir, name] = t;
    let path = `art/${dir}/${name}.png`;
    let img = Texture.fromImage(path);
    images[name] = img;
  }
}
