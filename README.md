# Mac Remote Control Ecosystem

> **For Lazy People Like Me** 🛋️

Ever been comfortably watching Netflix, Jio Hotstar, or any streaming service from your bed, only to realize you need to adjust the volume, brightness, or even put your Mac to sleep? This project solves that exact problem - no more getting up from your cozy spot!

## What is This?

A complete ecosystem that lets you control your Mac remotely from your phone or tablet. Perfect for those moments when you're too comfortable to move but need to make quick system adjustments.

## Project Structure

### 🖥️ `node-server/` - Backend API Server

The Node.js server that runs on your Mac and provides REST APIs to control system functions.

### 📱 `MacRemoteApp/` - Native macOS Menu Bar App

A lightweight macOS app that lives in your menu bar and manages the server automatically.

### 📱 `MacRemoteReactNative/` - Mobile App

A beautiful React Native mobile app that connects to your Mac and provides full remote control capabilities.

## Why I Built This

As someone who spends a lot of time watching content from bed or the couch, I got tired of constantly getting up to:

- Adjust volume during loud commercials
- Change brightness when the room lighting changes
- Put the system to sleep when I'm done watching
- Check system status without interrupting my viewing

This project eliminates all those interruptions - control everything from your phone while staying comfortable!

## Quick Start

1. **Start the Server** (from `node-server/`):

   ```bash
   npm install
   npm start
   ```

2. **Run the Mobile App** (from `MacRemoteReactNative/`):

   ```bash
   bun install
   bun start
   ```

3. **Or use the macOS App** (from `MacRemoteApp/`) - opens automatically and manages the server

## Features You'll Love

### 🎚️ Volume Control

Adjust system volume from 0-100% with smooth sliders

### 💡 Brightness Control

Fine-tune display brightness from your phone

### 📊 System Monitoring

Real-time monitoring of:

- Battery status and charging state
- CPU load with live graphs
- Memory usage with historical data

### ⚡ Quick Actions

One-tap system controls:

- **Sleep** - Put your Mac to sleep instantly
- **Restart** - Quick system restart
- **Shutdown** - Power down safely

### 📱 Beautiful Mobile Interface

- Dark theme optimized for low-light viewing
- Responsive design that works on phones and tablets
- Real-time updates every 2 seconds
- Error handling with automatic reconnection

## Perfect For

- 🛋️ **Couch potatoes** who don't want to get up
- 🎬 **Movie nights** when you're the designated remote person
- 🎵 **Music sessions** where you need quick volume adjustments
- 💻 **Work from bed** days when you're feeling extra lazy
- 🎮 **Gaming setups** where your phone is always nearby

## API Documentation

The server provides a simple REST API at `http://localhost:5001`:

- `GET /status` - Check if server is running
- `GET /info` - Get system information (battery, CPU, memory)
- `GET /volume` - Get current volume
- `POST /volume` - Set volume (0-100)
- `GET /brightness` - Get current brightness
- `POST /brightness` - Set brightness (0.0-1.0)
- `POST /action` - Perform system actions (sleep, restart, shutdown)

## Contributing

Got ideas to make this even lazier? Feel free to contribute! Whether it's new features, better UI, or performance improvements - all lazy innovations are welcome.

## License

MIT License - because everyone deserves to be comfortably lazy.

---

_Built with ❤️ for lazy people everywhere_
