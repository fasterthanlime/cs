import { Application, Text } from "pixi.js";
import { globals } from "./constants";

document.addEventListener("DOMContentLoaded", () => {
  var app = new Application(1280, 720);
  globals.app = app;
  document.body.appendChild(app.view);

  var text = new Text("Hellooo.", {
    fill: "white"
  });
  text.position.set(100, 100);
  app.stage.addChild(text);

  let i = 0;
  app.ticker.add(delta => {
    i += delta;
    text.text = `Time since start: ${i.toFixed()}`;
  });
});
