import { Application, Text } from "pixi.js";

document.addEventListener("DOMContentLoaded", () => {
  var app = new Application(1280, 720);
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
