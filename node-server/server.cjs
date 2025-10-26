//
//  server.js
//  MacRemoteControl
//
//  Created by Yogesh Solanki on 26/10/25.
//

const express = require("express");
const cors = require("cors");
const loudness = require("loudness");
const brightness = require("brightness");
const si = require("systeminformation");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/status", (_req, res) => {
  res.json({ ok: true, message: "Mac Control Server is running" });
});

app.get("/info", async (_req, res) => {
  try {
    const battery = await si.battery();
    const cpu = await si.currentLoad();
    const mem = await si.mem();

    res.json({
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        charging: battery.isCharging,
      },
      cpu: {
        avgLoad: cpu.avgload,
        currentLoad: cpu.currentload,
      },
      mem: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/volume", async (_req, res) => {
  const vol = await loudness.getVolume();
  res.json({ volume: vol });
});

app.post("/volume", async (req, res) => {
  await loudness.setVolume(req.body.volume);
  res.json({ success: true });
});

app.get("/brightness", async (req, res) => {
  const val = await brightness.get();
  res.json({ brightness: val });
});

app.post("/brightness", async (req, res) => {
  await brightness.set(req.body.brightness);
  res.json({ success: true });
});

app.post("/action", (req, res) => {
  const { type } = req.body;
  const commands = {
    sleep: "pmset sleepnow",
    restart: "sudo shutdown -r now",
    shutdown: "sudo shutdown -h now",
  };
  if (commands[type]) {
    exec(commands[type]);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid action" });
  }
});

const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Mac Control Server running on http://localhost:${PORT}`);
});
